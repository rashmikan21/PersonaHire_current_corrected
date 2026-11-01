import json
import math
import os
import re
from difflib import SequenceMatcher
from typing import Any
import requests


AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").strip().lower()
OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL", "http://127.0.0.1:11434"
).strip().rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b").strip()
try:
    OLLAMA_TIMEOUT_SECONDS = max(15, int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "90")))
except ValueError:
    OLLAMA_TIMEOUT_SECONDS = 90
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")


class AIServiceError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def create_client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise AIServiceError(
            "The AI interview service is not configured. Set GEMINI_API_KEY in the backend environment.",
            503,
        )

    try:
        from google import genai
        from google.genai import types
    except ImportError as error:
        raise AIServiceError(
            "The Gemini SDK is unavailable. Install the backend requirements.",
            503,
        ) from error

    return genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=30_000),
    )


def get_ai_status() -> dict[str, Any]:
    if AI_PROVIDER == "ollama":
        return {
            "provider": AI_PROVIDER,
            "configured": bool(OLLAMA_BASE_URL and OLLAMA_MODEL),
            "model": OLLAMA_MODEL,
        }
    if AI_PROVIDER == "gemini":
        return {
            "provider": AI_PROVIDER,
            "configured": bool(os.getenv("GEMINI_API_KEY", "").strip()),
            "model": MODEL_NAME,
        }
    return {"provider": AI_PROVIDER, "configured": False, "model": None}


def _request_ollama_text(
    prompt: str,
    schema: dict[str, Any],
    system_instruction: str,
) -> str:
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "format": schema,
                "options": {"temperature": 0.2},
            },
            timeout=OLLAMA_TIMEOUT_SECONDS,
        )
    except requests.Timeout as error:
        raise AIServiceError(
            "The local Ollama model took too long to respond. Please try again.",
            504,
        ) from error
    except requests.ConnectionError as error:
        raise AIServiceError(
            "Cannot reach Ollama. Start Ollama and verify its local service URL.",
            503,
        ) from error
    except requests.RequestException as error:
        raise AIServiceError(
            "The local AI service is temporarily unavailable.",
            502,
        ) from error

    if response.status_code == 404:
        raise AIServiceError(
            f"Ollama model '{OLLAMA_MODEL}' is not installed. Run `ollama pull {OLLAMA_MODEL}`.",
            503,
        )
    if response.status_code == 429:
        raise AIServiceError(
            "Ollama is busy. Please wait a moment and try again.",
            429,
        )
    if not response.ok:
        raise AIServiceError(
            "Ollama rejected the request. Check that the selected model supports chat and structured output.",
            502,
        )

    try:
        payload = response.json()
    except ValueError as error:
        raise AIServiceError("Ollama returned an unreadable response.") from error
    message = payload.get("message") if isinstance(payload, dict) else None
    output_text = message.get("content") if isinstance(message, dict) else None
    if not isinstance(output_text, str) or not output_text.strip():
        raise AIServiceError("Ollama returned an empty response.")
    return output_text


def _request_json(
    prompt: str,
    schema: dict[str, Any],
    system_instruction: str = "Return only the requested structured response.",
) -> dict[str, Any]:
    client = None
    try:
        if AI_PROVIDER == "ollama":
            output_text = _request_ollama_text(prompt, schema, system_instruction)
        elif AI_PROVIDER == "gemini":
            client = create_client()
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": schema,
                    "system_instruction": system_instruction,
                },
            )
            output_text = getattr(response, "text", None)
        else:
            raise AIServiceError(
                "AI_PROVIDER must be set to 'ollama' or 'gemini'.",
                503,
            )
        if not isinstance(output_text, str) or not output_text.strip():
            raise AIServiceError("The AI service returned an empty response.")
        result = json.loads(output_text)
        if not isinstance(result, dict):
            raise AIServiceError("The AI service returned an invalid response.")
        return result
    except AIServiceError:
        raise
    except json.JSONDecodeError as error:
        raise AIServiceError("The AI service returned an invalid response.") from error
    except Exception as error:
        status = getattr(error, "code", None) or getattr(error, "status_code", None)
        status_text = str(status or "").upper()
        error_name = type(error).__name__.lower()
        if status == 429 or "RESOURCE_EXHAUSTED" in status_text:
            raise AIServiceError(
                "The AI service is busy. Please wait a moment and try again.",
                429,
            ) from error
        if status in (408, 504) or "timeout" in error_name:
            raise AIServiceError(
                "The AI service took too long to respond. Please try again.",
                504,
            ) from error
        raise AIServiceError(
            "The AI service is temporarily unavailable. Please try again shortly.",
            502,
        ) from error
    finally:
        close = getattr(client, "close", None)
        if callable(close):
            try:
                close()
            except Exception:
                pass


def _number(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise AIServiceError("The AI service returned an invalid evaluation.")
    if not math.isfinite(value) or value < 0 or value > 10:
        raise AIServiceError("The AI service returned an invalid evaluation.")
    return round(float(value), 1)


def _text_list(value: Any, field: str) -> list[str]:
    if not isinstance(value, list) or len(value) > 8:
        raise AIServiceError("The AI service returned an invalid evaluation.")
    items = []
    for item in value:
        if not isinstance(item, str) or not item.strip():
            raise AIServiceError("The AI service returned an invalid evaluation.")
        items.append(item.strip()[:500])
    return items


def _schema(properties: dict[str, Any], required: list[str]) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
    }


QUESTION_SCHEMA = _schema(
    {"question": {"type": "string"}},
    ["question"],
)

EVALUATION_SCHEMA = _schema(
    {
        "overallScore": {"type": "number"},
        "relevanceScore": {"type": "number"},
        "technicalAccuracyScore": {"type": "number"},
        "completenessScore": {"type": "number"},
        "communicationScore": {"type": "number"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "missingConcepts": {"type": "array", "items": {"type": "string"}},
        "mistakes": {"type": "array", "items": {"type": "string"}},
        "improvementSuggestions": {
            "type": "array",
            "items": {"type": "string"},
        },
        "sampleImprovedAnswer": {"type": "string"},
    },
    [
        "overallScore",
        "relevanceScore",
        "technicalAccuracyScore",
        "completenessScore",
        "communicationScore",
        "strengths",
        "missingConcepts",
        "mistakes",
        "improvementSuggestions",
        "sampleImprovedAnswer",
    ],
)

REPORT_SCHEMA = _schema(
    {
        "strongAreas": {"type": "array", "items": {"type": "string"}},
        "weakAreas": {"type": "array", "items": {"type": "string"}},
        "frequentlyMissingConcepts": {
            "type": "array",
            "items": {"type": "string"},
        },
        "personalizedRecommendations": {
            "type": "array",
            "items": {"type": "string"},
        },
        "readinessAssessment": {"type": "string"},
    },
    [
        "strongAreas",
        "weakAreas",
        "frequentlyMissingConcepts",
        "personalizedRecommendations",
        "readinessAssessment",
    ],
)


def generate_interview_question(
    role: str,
    category: str,
    difficulty: str,
    previous_questions: list[str],
) -> str:
    prompt = (
        "You are an interviewer for college placement preparation. Generate exactly one "
        "clear interview question for the selected role and category. Use the requested "
        "difficulty. Include a suitable mix of conceptual and practical questions across "
        "the session. Ask a direct, realistic placement-interview question. Never request "
        "misdirection, intentionally erroneous code, or a trick answer. Avoid repeating or "
        "paraphrasing any previous question. Do not include an answer, hints, numbering, or "
        "commentary. Return JSON only.\n"
        f"Role: {role}\nCategory: {category}\nDifficulty: {difficulty}\n"
        f"Previous questions to avoid: {json.dumps(previous_questions)}"
    )
    retry_note = ""
    for attempt in range(2):
        result = _request_json(
            prompt + retry_note,
            QUESTION_SCHEMA,
            "You write fair, direct college placement interview questions. Never include misdirection, trick wording, or requests for intentionally incorrect code. Return exactly one relevant question.",
        )
        question = result.get("question")
        if not isinstance(question, str) or not 8 <= len(question.strip()) <= 500:
            raise AIServiceError("The AI service returned an invalid interview question.")

        normalized = re.sub(r"\W+", " ", question.casefold()).strip()
        is_repeat = any(
            SequenceMatcher(
                None,
                normalized,
                re.sub(r"\W+", " ", previous.casefold()).strip(),
            ).ratio() >= 0.86
            for previous in previous_questions
        )
        is_misleading = any(
            marker in question.casefold()
            for marker in (
                "misedirection",
                "misleading",
                "trick question",
                "erroneous code",
                "intentionally incorrect code",
            )
        )
        if not is_repeat and not is_misleading:
            return question.strip()
        reason = "repeated a previous question" if is_repeat else "requested misleading content"
        retry_note = (
            f"\nRejected draft ({reason}): {json.dumps(question)}. "
            "Generate a different, straightforward interview question."
        )

    raise AIServiceError(
        "The AI service could not generate a fresh question. Please try again."
    )


def evaluate_interview_answer(
    role: str,
    category: str,
    difficulty: str,
    question: str,
    answer: str,
) -> dict[str, Any]:
    prompt = (
        "Evaluate this student's actual interview answer. Base every judgment on the exact "
        "question and answer below. Do not award points merely for keyword overlap. Assess "
        "relevance, correctness for the role/category, conceptual understanding, completeness, "
        "and clarity. Be calibrated: short, vague, incorrect, or irrelevant answers should score "
        "accordingly. Identify incorrect concepts and state the correction in mistakes or "
        "improvementSuggestions. Give specific feedback and a concise sample improved answer. "
        "Scores must be from 0 to 10. For non-technical categories, technicalAccuracyScore "
        "means factual/conceptual accuracy appropriate to that category. Return JSON only.\n"
        f"Role: {role}\nCategory: {category}\nDifficulty: {difficulty}\n"
        f"Question: {question}\nStudent answer: {answer}"
    )
    result = _request_json(
        prompt,
        EVALUATION_SCHEMA,
        "You are a fair, technically accurate placement-interview evaluator. Judge only the supplied question and actual student answer. The candidate is a student preparing for college placements, so academic, coursework, internship, and personal project examples are valid evidence; do not penalize an answer merely because its example is not from professional employment. Before identifying missing requirements, verify the answer's code, math, and logic against each requirement. Treat logically equivalent conditions and explanations as equivalent; do not claim a requirement is missing when the answer satisfies it in another valid form. Check that strengths, missing concepts, mistakes, scores, and suggestions do not contradict one another. If a valid equivalent solution is present but could be clearer, suggest clarification without calling it a mistake or missing concept. Do not reward filler or keywords without correct reasoning. Give low scores for irrelevant or genuinely incorrect answers, explain real misconceptions, and return only the requested structured evaluation.",
    )
    text_fields = ("sampleImprovedAnswer",)
    for field in text_fields:
        if not isinstance(result.get(field), str) or not result[field].strip():
            raise AIServiceError("The AI service returned an invalid evaluation.")

    return {
        "overallScore": _number(result.get("overallScore"), "overallScore"),
        "relevanceScore": _number(result.get("relevanceScore"), "relevanceScore"),
        "technicalAccuracyScore": _number(
            result.get("technicalAccuracyScore"), "technicalAccuracyScore"
        ),
        "completenessScore": _number(
            result.get("completenessScore"), "completenessScore"
        ),
        "communicationScore": _number(
            result.get("communicationScore"), "communicationScore"
        ),
        "strengths": _text_list(result.get("strengths"), "strengths"),
        "missingConcepts": _text_list(
            result.get("missingConcepts"), "missingConcepts"
        ),
        "mistakes": _text_list(result.get("mistakes"), "mistakes"),
        "improvementSuggestions": _text_list(
            result.get("improvementSuggestions"), "improvementSuggestions"
        ),
        "sampleImprovedAnswer": result["sampleImprovedAnswer"].strip()[:3000],
    }


def generate_interview_report(
    role: str,
    category: str,
    difficulty: str,
    turns: list[dict[str, Any]],
) -> dict[str, Any]:
    prompt = (
        "Write a concise, evidence-based mock interview report for a college placement "
        "candidate. Use only the transcript and per-answer evaluations provided. Do not invent "
        "performance evidence. Identify recurring strengths, weaknesses, repeated missing "
        "concepts, and practical recommendations. readinessAssessment should be a short overall "
        "readiness judgment supported by the evidence. Return JSON only.\n"
        f"Role: {role}\nCategory: {category}\nDifficulty: {difficulty}\n"
        f"Interview transcript and evaluations: {json.dumps(turns, ensure_ascii=True)}"
    )
    result = _request_json(
        prompt,
        REPORT_SCHEMA,
        "You are an evidence-based placement-interview report writer. Use only the supplied transcript and stored evaluations. Do not invent strengths, weaknesses, or evidence. Return only the requested structured report.",
    )
    assessment = result.get("readinessAssessment")
    if not isinstance(assessment, str) or not assessment.strip():
        raise AIServiceError("The AI service returned an invalid report.")

    return {
        "strongAreas": _text_list(result.get("strongAreas"), "strongAreas"),
        "weakAreas": _text_list(result.get("weakAreas"), "weakAreas"),
        "frequentlyMissingConcepts": _text_list(
            result.get("frequentlyMissingConcepts"), "frequentlyMissingConcepts"
        ),
        "personalizedRecommendations": _text_list(
            result.get("personalizedRecommendations"),
            "personalizedRecommendations",
        ),
        "readinessAssessment": assessment.strip()[:2000],
    }

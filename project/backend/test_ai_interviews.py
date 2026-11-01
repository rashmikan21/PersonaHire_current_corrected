import json
import os
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from backend import app as app_module
from backend import ai_service


class InterviewAPITests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = os.path.join(self.temp_dir.name, "test.db")
        self.original_db_path = app_module.DB_PATH
        app_module.DB_PATH = self.database_path
        app_module.init_db()
        self.client = app_module.app.test_client()
        self.question_patch = patch.object(
            app_module,
            "generate_interview_question",
            side_effect=self.fake_question,
        )
        self.evaluation_patch = patch.object(
            app_module,
            "evaluate_interview_answer",
            side_effect=self.fake_evaluation,
        )
        self.report_patch = patch.object(
            app_module,
            "generate_interview_report",
            return_value={
                "strongAreas": ["Specific examples"],
                "weakAreas": ["Completeness"],
                "frequentlyMissingConcepts": ["Edge cases"],
                "personalizedRecommendations": ["Explain trade-offs"],
                "readinessAssessment": "Developing; keep practicing.",
            },
        )
        self.question_patch.start()
        self.evaluation_patch.start()
        self.report_patch.start()
        self.generated_question_count = 0

    def tearDown(self):
        self.question_patch.stop()
        self.evaluation_patch.stop()
        self.report_patch.stop()
        app_module.DB_PATH = self.original_db_path
        self.temp_dir.cleanup()

    def fake_question(self, role, category, difficulty, previous_questions):
        self.generated_question_count += 1
        return f"Explain a distinct {role} concept {self.generated_question_count}?"

    def fake_evaluation(self, role, category, difficulty, question, answer):
        normalized = answer.lower()
        score = (
            9 if "strong" in normalized
            else 6 if "partial" in normalized
            else 2 if "incorrect" in normalized
            else 0
        )
        return {
            "overallScore": score,
            "relevanceScore": score,
            "technicalAccuracyScore": score,
            "completenessScore": score,
            "communicationScore": score,
            "strengths": ["Answered the question"] if score > 5 else [],
            "missingConcepts": [] if score > 5 else ["Core concept"],
            "mistakes": [] if score > 5 else ["Incorrect explanation"],
            "improvementSuggestions": ["Explain the reasoning"],
            "sampleImprovedAnswer": "A clearer answer with the relevant reasoning.",
        }

    def start_session(self):
        response = self.client.post(
            "/api/interviews/questions",
            json={
                "role": "Python Developer",
                "category": "Programming Concepts",
                "difficulty": "Medium",
            },
        )
        self.assertEqual(response.status_code, 200)
        return response.get_json()

    def test_existing_auth_routes_still_register_and_login(self):
        registration = self.client.post(
            "/api/auth/register",
            json={
                "name": "Test Student",
                "email": "student@example.com",
                "password": "test-password-123",
            },
        )
        self.assertEqual(registration.status_code, 201)

        login = self.client.post(
            "/api/auth/login",
            json={
                "email": "student@example.com",
                "password": "test-password-123",
            },
        )
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.get_json()["user"]["name"], "Test Student")

        rejected_login = self.client.post(
            "/api/auth/login",
            json={"email": "student@example.com", "password": "wrong-password"},
        )
        self.assertEqual(rejected_login.status_code, 401)

    def test_question_generation_and_no_duplicate_question(self):
        first = self.start_session()
        evaluated = self.client.post(
            "/api/interviews/evaluate",
            json={
                "sessionId": first["sessionId"],
                "questionId": first["questionId"],
                "answer": "A correct answer.",
            },
        )
        self.assertEqual(evaluated.status_code, 200)
        second_response = self.client.post(
            "/api/interviews/questions",
            json={"sessionId": first["sessionId"]},
        )
        self.assertEqual(second_response.status_code, 200)
        second = second_response.get_json()
        self.assertNotEqual(first["question"], second["question"])
        self.assertEqual(second["questionNumber"], 2)

    def test_strong_partial_incorrect_and_irrelevant_answers_are_distinguished(self):
        answer_scores = [
            ("A strong answer with clear reasoning.", 9),
            ("A partial answer with one relevant point.", 6),
            ("An incorrect explanation.", 2),
            ("A completely unrelated response.", 0),
        ]
        for answer, expected_score in answer_scores:
            with self.subTest(answer=answer):
                session = self.start_session()
                response = self.client.post(
                    "/api/interviews/evaluate",
                    json={
                        "sessionId": session["sessionId"],
                        "questionId": session["questionId"],
                        "answer": answer,
                    },
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(
                    response.get_json()["evaluation"]["overallScore"],
                    expected_score,
                )

    def test_evaluation_retry_is_idempotent_and_different_answer_is_rejected(self):
        session = self.start_session()
        payload = {
            "sessionId": session["sessionId"],
            "questionId": session["questionId"],
            "answer": "A correct answer.",
        }
        first = self.client.post("/api/interviews/evaluate", json=payload)
        retry = self.client.post("/api/interviews/evaluate", json=payload)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(first.get_json(), retry.get_json())

        payload["answer"] = "A different answer."
        conflict = self.client.post("/api/interviews/evaluate", json=payload)
        self.assertEqual(conflict.status_code, 409)

    def test_report_uses_server_stored_evaluations(self):
        session = self.start_session()
        self.client.post(
            "/api/interviews/evaluate",
            json={
                "sessionId": session["sessionId"],
                "questionId": session["questionId"],
                "answer": "A strong answer with reasoning.",
            },
        )
        report_response = self.client.post(
            "/api/interviews/report",
            json={"sessionId": session["sessionId"]},
        )
        report = report_response.get_json()["report"]
        self.assertEqual(report_response.status_code, 200)
        self.assertEqual(report["totalQuestionsAttempted"], 1)
        self.assertEqual(report["averageScore"], 9)
        self.assertEqual(report["technicalKnowledgePerformance"], 9)
        self.assertEqual(report["communicationPerformance"], 9)

    def test_empty_answers_and_missing_session_are_rejected(self):
        empty = self.client.post(
            "/api/interviews/evaluate",
            json={"sessionId": "missing", "questionId": "missing", "answer": "  "},
        )
        self.assertEqual(empty.status_code, 400)

        missing = self.client.post(
            "/api/interviews/questions",
            json={"sessionId": "not-a-real-session"},
        )
        self.assertEqual(missing.status_code, 404)

        invalid_category = self.client.post(
            "/api/interviews/questions",
            json={
                "role": "Python Developer",
                "category": ["Technical"],
                "difficulty": "Medium",
            },
        )
        invalid_difficulty = self.client.post(
            "/api/interviews/questions",
            json={
                "role": "Python Developer",
                "category": "Technical",
                "difficulty": ["Medium"],
            },
        )
        self.assertEqual(invalid_category.status_code, 400)
        self.assertEqual(invalid_difficulty.status_code, 400)

    def test_provider_failure_returns_non_sensitive_error(self):
        session = self.start_session()
        with patch.object(
            app_module,
            "evaluate_interview_answer",
            side_effect=ai_service.AIServiceError(
                "The AI service is temporarily unavailable. Please try again shortly.",
                503,
            ),
        ):
            response = self.client.post(
                "/api/interviews/evaluate",
                json={
                    "sessionId": session["sessionId"],
                    "questionId": session["questionId"],
                    "answer": "A reasonable answer.",
                },
            )
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("API key", json.dumps(response.get_json()))


class GeminiServiceTests(unittest.TestCase):
    def test_answer_evaluator_sends_question_and_answer_and_validates_scores(self):
        evaluation = {
            "overallScore": 4,
            "relevanceScore": 3,
            "technicalAccuracyScore": 2,
            "completenessScore": 4,
            "communicationScore": 7,
            "strengths": ["The answer was concise."],
            "missingConcepts": ["Time complexity"],
            "mistakes": ["It confused average and worst-case complexity."],
            "improvementSuggestions": ["Explain the complexity trade-off."],
            "sampleImprovedAnswer": "State the correct complexity, then justify it.",
        }
        captured = {}

        def create_interaction(**kwargs):
            captured.update(kwargs)
            return SimpleNamespace(text=json.dumps(evaluation))

        close_client = Mock()
        client = SimpleNamespace(
            models=SimpleNamespace(generate_content=create_interaction),
            close=close_client,
        )
        with patch.object(ai_service, "AI_PROVIDER", "gemini"), patch.object(
            ai_service, "create_client", return_value=client
        ):
            result = ai_service.evaluate_interview_answer(
                "Python Developer",
                "Programming Concepts",
                "Medium",
                "What is the time complexity of binary search?",
                "It checks every item once.",
            )

        self.assertEqual(result["overallScore"], 4)
        self.assertIn("What is the time complexity of binary search?", captured["contents"])
        self.assertIn("It checks every item once.", captured["contents"])
        self.assertEqual(captured["config"]["response_mime_type"], "application/json")
        self.assertEqual(captured["config"]["response_json_schema"]["type"], "object")
        self.assertIn(
            "Treat logically equivalent conditions and explanations as equivalent",
            captured["config"]["system_instruction"],
        )
        self.assertIn(
            "academic, coursework, internship, and personal project examples are valid evidence",
            captured["config"]["system_instruction"],
        )
        self.assertEqual(captured["model"], ai_service.MODEL_NAME)
        close_client.assert_called_once()

    def test_rate_limit_is_mapped_to_a_safe_api_error(self):
        class RateLimitError(Exception):
            status_code = 429

        def fail_request(**kwargs):
            raise RateLimitError("private provider response")

        client = SimpleNamespace(
            models=SimpleNamespace(generate_content=fail_request)
        )
        with patch.object(ai_service, "AI_PROVIDER", "gemini"), patch.object(
            ai_service, "create_client", return_value=client
        ):
            with self.assertRaises(ai_service.AIServiceError) as raised:
                ai_service._request_json("test", ai_service.QUESTION_SCHEMA)

        self.assertEqual(raised.exception.status_code, 429)
        self.assertNotIn("private provider response", str(raised.exception))

    def test_ollama_uses_local_chat_and_structured_schema(self):
        captured = {}
        response_bodies = [
            {
                "message": {
                    "content": json.dumps({
                        "question": "Explain this intentionally erroneous code as misdirection."
                    })
                }
            },
            {
                "message": {
                    "content": json.dumps({
                        "question": "How do Python dictionaries resolve hash collisions?"
                    })
                }
            },
        ]

        def fake_post(url, **kwargs):
            captured["url"] = url
            captured["call_count"] = captured.get("call_count", 0) + 1
            captured.update(kwargs)
            response_body = response_bodies[captured["call_count"] - 1]
            return SimpleNamespace(
                status_code=200,
                ok=True,
                json=lambda response_body=response_body: response_body,
            )

        with patch.object(ai_service, "AI_PROVIDER", "ollama"), patch.object(
            ai_service.requests, "post", side_effect=fake_post
        ):
            question = ai_service.generate_interview_question(
                "Python Developer", "Technical", "Medium", []
            )

        self.assertIn("hash collisions", question)
        self.assertEqual(captured["url"], f"{ai_service.OLLAMA_BASE_URL}/api/chat")
        self.assertEqual(captured["json"]["model"], ai_service.OLLAMA_MODEL)
        self.assertEqual(captured["json"]["format"], ai_service.QUESTION_SCHEMA)
        self.assertFalse(captured["json"]["stream"])
        self.assertEqual(captured["call_count"], 2)
        self.assertEqual(captured["json"]["messages"][0]["role"], "system")
        self.assertIn("Never include misdirection", captured["json"]["messages"][0]["content"])


if __name__ == "__main__":
    unittest.main()

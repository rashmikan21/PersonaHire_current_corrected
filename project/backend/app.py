
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import requests
import time
import re
import os
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from contextlib import contextmanager

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().with_name(".env"), override=True)
except ImportError:
    pass

try:
    from .ai_service import (
        AIServiceError,
        evaluate_interview_answer,
        get_ai_status,
        generate_interview_question,
        generate_interview_report,
    )
except ImportError:
    from ai_service import (
        AIServiceError,
        evaluate_interview_answer,
        get_ai_status,
        generate_interview_question,
        generate_interview_report,
    )

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "personahire.db")

JUDGE0_URL = "https://extra-ce.judge0.com/submissions"

LANGUAGE_IDS = {
    "C++": 54,
    "Java": 62,
    "Python": 71,
    "JavaScript": 63,
}

INTERVIEW_CATEGORIES = {"Technical", "HR", "Behavioral", "Programming Concepts"}
INTERVIEW_DIFFICULTIES = {"Easy", "Medium", "Hard"}
MAX_INTERVIEW_QUESTIONS = 5


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id TEXT PRIMARY KEY,
                role TEXT NOT NULL,
                category TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                report_json TEXT,
                created_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS interview_turns (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                question_number INTEGER NOT NULL,
                question TEXT NOT NULL,
                answer TEXT,
                evaluation_json TEXT,
                created_at TEXT NOT NULL,
                UNIQUE(session_id, question_number),
                FOREIGN KEY(session_id) REFERENCES interview_sessions(id)
            )
        """)


init_db()


@app.route("/", methods=["GET"])
def home():
    return "PersonaHire backend is running!"


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "PersonaHire Backend",
        "ai": get_ai_status(),
    })


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not name or not email or not isinstance(password, str):
        return jsonify({"message": "Name, email, and password are required."}), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"message": "Enter a valid email address."}), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters."
        }), 400

    password_hash = generate_password_hash(password)

    try:
        with get_db() as conn:
            cursor = conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, password_hash)
            )
            user_id = cursor.lastrowid

        return jsonify({
            "message": "Account created successfully.",
            "user": {
                "id": str(user_id),
                "name": name,
                "email": email
            }
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "message": "An account with this email already exists. Please sign in."
        }), 409


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not isinstance(password, str) or not password:
        return jsonify({
            "message": "Email and password are required."
        }), 400

    with get_db() as conn:
        user = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (email,)
        ).fetchone()

    if user is None or not check_password_hash(
        user["password_hash"], password
    ):
        return jsonify({
            "message": "Incorrect email or password."
        }), 401

    return jsonify({
        "message": "Login successful.",
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"]
        }
    })


def interview_error(error):
    return jsonify({"message": str(error)}), error.status_code


def valid_identifier(value):
    return isinstance(value, str) and 1 <= len(value) <= 64


def question_payload(session_id, role, category, difficulty, turn):
    return jsonify({
        "sessionId": session_id,
        "questionId": turn["id"],
        "question": turn["question"],
        "role": role,
        "category": category,
        "difficulty": difficulty,
        "questionNumber": turn["question_number"],
        "totalQuestions": MAX_INTERVIEW_QUESTIONS,
    })


@app.route("/api/interviews/questions", methods=["POST"])
def interview_question():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"message": "A JSON request body is required."}), 400

    session_id = data.get("sessionId")
    if session_id is None:
        role = data.get("role")
        category = data.get("category")
        difficulty = data.get("difficulty")

        if not isinstance(role, str) or not role.strip() or len(role.strip()) > 80:
            return jsonify({"message": "Choose a valid job role."}), 400
        role = role.strip()
        if not isinstance(category, str) or category not in INTERVIEW_CATEGORIES:
            return jsonify({"message": "Choose a valid interview category."}), 400
        if not isinstance(difficulty, str) or difficulty not in INTERVIEW_DIFFICULTIES:
            return jsonify({"message": "Choose a valid interview difficulty."}), 400

        try:
            question = generate_interview_question(role, category, difficulty, [])
        except AIServiceError as error:
            return interview_error(error)

        session_id = uuid.uuid4().hex
        question_id = uuid.uuid4().hex
        created_at = datetime.now(timezone.utc).isoformat()
        with get_db() as conn:
            conn.execute(
                "INSERT INTO interview_sessions (id, role, category, difficulty, created_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (session_id, role, category, difficulty, created_at),
            )
            conn.execute(
                "INSERT INTO interview_turns "
                "(id, session_id, question_number, question, created_at) "
                "VALUES (?, ?, 1, ?, ?)",
                (question_id, session_id, question, created_at),
            )
            turn = conn.execute(
                "SELECT id, question, question_number FROM interview_turns WHERE id = ?",
                (question_id,),
            ).fetchone()
        return question_payload(session_id, role, category, difficulty, turn)

    if not valid_identifier(session_id):
        return jsonify({"message": "The interview session is invalid."}), 400

    with get_db() as conn:
        session = conn.execute(
            "SELECT id, role, category, difficulty, status FROM interview_sessions WHERE id = ?",
            (session_id,),
        ).fetchone()
        if session is None:
            return jsonify({"message": "Interview session not found."}), 404
        if session["status"] != "active":
            return jsonify({"message": "This interview session is already complete."}), 409
        turns = conn.execute(
            "SELECT id, question, question_number, answer, evaluation_json "
            "FROM interview_turns WHERE session_id = ? ORDER BY question_number",
            (session_id,),
        ).fetchall()

    if turns and turns[-1]["evaluation_json"] is None:
        return question_payload(
            session_id,
            session["role"],
            session["category"],
            session["difficulty"],
            turns[-1],
        )
    if len(turns) >= MAX_INTERVIEW_QUESTIONS:
        return jsonify({"message": "All interview questions have been answered."}), 409

    previous_questions = [turn["question"] for turn in turns]
    try:
        question = generate_interview_question(
            session["role"],
            session["category"],
            session["difficulty"],
            previous_questions,
        )
    except AIServiceError as error:
        return interview_error(error)

    question_id = uuid.uuid4().hex
    question_number = len(turns) + 1
    created_at = datetime.now(timezone.utc).isoformat()
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO interview_turns "
                "(id, session_id, question_number, question, created_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (question_id, session_id, question_number, question, created_at),
            )
            turn = conn.execute(
                "SELECT id, question, question_number FROM interview_turns WHERE id = ?",
                (question_id,),
            ).fetchone()
    except sqlite3.IntegrityError:
        return jsonify({"message": "A question is already being prepared. Try again."}), 409

    return question_payload(
        session_id,
        session["role"],
        session["category"],
        session["difficulty"],
        turn,
    )


@app.route("/api/interviews/evaluate", methods=["POST"])
def interview_evaluate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"message": "A JSON request body is required."}), 400

    session_id = data.get("sessionId")
    question_id = data.get("questionId")
    answer = data.get("answer")
    if not valid_identifier(session_id) or not valid_identifier(question_id):
        return jsonify({"message": "The interview session or question is invalid."}), 400
    if not isinstance(answer, str) or not answer.strip():
        return jsonify({"message": "Enter or speak an answer before submitting."}), 400
    answer = answer.strip()
    if len(answer) > 6000:
        return jsonify({"message": "Answers must be 6,000 characters or fewer."}), 413

    with get_db() as conn:
        session = conn.execute(
            "SELECT id, role, category, difficulty, status FROM interview_sessions WHERE id = ?",
            (session_id,),
        ).fetchone()
        if session is None:
            return jsonify({"message": "Interview session not found."}), 404
        if session["status"] != "active":
            return jsonify({"message": "This interview session is already complete."}), 409
        turn = conn.execute(
            "SELECT id, question_number, question, answer, evaluation_json "
            "FROM interview_turns WHERE session_id = ? ORDER BY question_number DESC LIMIT 1",
            (session_id,),
        ).fetchone()

    if turn is None or turn["id"] != question_id:
        return jsonify({"message": "This is not the active interview question."}), 409
    if turn["evaluation_json"] is not None:
        if turn["answer"] == answer:
            return jsonify({
                "questionNumber": turn["question_number"],
                "evaluation": json.loads(turn["evaluation_json"]),
            })
        return jsonify({"message": "This answer has already been evaluated."}), 409

    try:
        evaluation = evaluate_interview_answer(
            session["role"],
            session["category"],
            session["difficulty"],
            turn["question"],
            answer,
        )
    except AIServiceError as error:
        return interview_error(error)

    with get_db() as conn:
        updated = conn.execute(
            "UPDATE interview_turns SET answer = ?, evaluation_json = ? "
            "WHERE id = ? AND evaluation_json IS NULL",
            (answer, json.dumps(evaluation), question_id),
        )
        if updated.rowcount != 1:
            saved = conn.execute(
                "SELECT answer, evaluation_json FROM interview_turns WHERE id = ?",
                (question_id,),
            ).fetchone()
            if saved and saved["answer"] == answer and saved["evaluation_json"]:
                evaluation = json.loads(saved["evaluation_json"])
            else:
                return jsonify({"message": "This answer has already been evaluated."}), 409

    return jsonify({
        "questionNumber": turn["question_number"],
        "evaluation": evaluation,
    })


@app.route("/api/interviews/report", methods=["POST"])
def interview_report():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"message": "A JSON request body is required."}), 400
    session_id = data.get("sessionId")
    if not valid_identifier(session_id):
        return jsonify({"message": "The interview session is invalid."}), 400

    with get_db() as conn:
        session = conn.execute(
            "SELECT id, role, category, difficulty, status, report_json "
            "FROM interview_sessions WHERE id = ?",
            (session_id,),
        ).fetchone()
        if session is None:
            return jsonify({"message": "Interview session not found."}), 404
        if session["report_json"]:
            return jsonify({"report": json.loads(session["report_json"]), "sessionId": session_id})
        rows = conn.execute(
            "SELECT question, answer, evaluation_json FROM interview_turns "
            "WHERE session_id = ? ORDER BY question_number",
            (session_id,),
        ).fetchall()

    if not rows or any(row["evaluation_json"] is None for row in rows):
        return jsonify({"message": "Evaluate the current answer before requesting a report."}), 409

    turns = [
        {
            "question": row["question"],
            "answer": row["answer"],
            "evaluation": json.loads(row["evaluation_json"]),
        }
        for row in rows
    ]
    try:
        generated = generate_interview_report(
            session["role"],
            session["category"],
            session["difficulty"],
            turns,
        )
    except AIServiceError as error:
        return interview_error(error)

    evaluations = [turn["evaluation"] for turn in turns]
    report = {
        **generated,
        "totalQuestionsAttempted": len(turns),
        "averageScore": round(
            sum(item["overallScore"] for item in evaluations) / len(evaluations),
            1,
        ),
        "technicalKnowledgePerformance": round(
            sum(item["technicalAccuracyScore"] for item in evaluations) / len(evaluations),
            1,
        ),
        "communicationPerformance": round(
            sum(item["communicationScore"] for item in evaluations) / len(evaluations),
            1,
        ),
    }
    report_json = json.dumps(report)
    with get_db() as conn:
        conn.execute(
            "UPDATE interview_sessions SET status = 'completed', report_json = ? WHERE id = ?",
            (report_json, session_id),
        )

    return jsonify({"report": report, "sessionId": session_id})


@app.route("/api/code/submit", methods=["POST"])
def submit_code():
    data = request.get_json(silent=True) or {}

    problem_id = data.get("problemId")
    language = data.get("language")
    code = data.get("code", "")

    if not problem_id or language not in LANGUAGE_IDS:
        return jsonify({
            "status": "Invalid Request",
            "message": "Choose a supported problem and language.",
            "passed": 0,
            "total": 0
        }), 400

    if not isinstance(code, str) or not code.strip():
        return jsonify({
            "status": "Compilation Error",
            "message": "Your code is empty.",
            "passed": 0,
            "total": 0
        }), 400

    try:
        created = requests.post(
            JUDGE0_URL,
            params={"base64_encoded": "false"},
            json={
                "source_code": code,
                "language_id": LANGUAGE_IDS[language],
                "stdin": ""
            },
            timeout=20
        )

        if not created.ok:
            return jsonify({
                "status": "Judge Request Rejected",
                "message": f"Judge0 HTTP {created.status_code}: {created.text[:1000]}",
                "passed": 0,
                "total": 0
            }), 502

        token = created.json().get("token")

        if not token:
            return jsonify({
                "status": "Judge Error",
                "message": "Judge0 did not return a submission token.",
                "passed": 0,
                "total": 0
            }), 502

        result = None

        for _ in range(10):
            check = requests.get(
                f"{JUDGE0_URL}/{token}",
                params={"base64_encoded": "false"},
                timeout=10
            )
            check.raise_for_status()
            result = check.json()

            status_info = result.get("status") or {}
            if status_info.get("id") not in (1, 2):
                break

            time.sleep(1)

        if not result:
            raise RuntimeError("No execution result received.")

        status_info = result.get("status") or {}
        status = status_info.get("description", "Unknown")
        output = result.get("stdout") or ""
        error = (
            result.get("compile_output")
            or result.get("stderr")
            or result.get("message")
            or ""
        )

        message = error or status
        if status == "Accepted":
            status = "Executed"
            message = (
                "Code executed successfully. Problem-specific test cases "
                "are not configured, so correctness has not been verified."
            )

        return jsonify({
            "status": status,
            "message": message,
            "passed": 0,
            "total": 0,
            "output": output,
            "compileOutput": error
        })

    except requests.RequestException as error:
        app.logger.exception("Judge0 connection failed")
        return jsonify({
            "status": "Judge Service Unavailable",
            "message": str(error),
            "passed": 0,
            "total": 0
        }), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

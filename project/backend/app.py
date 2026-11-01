
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import requests
import time
import re
import os

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


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


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


init_db()


@app.route("/", methods=["GET"])
def home():
    return "PersonaHire backend is running!"


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "PersonaHire Backend"
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

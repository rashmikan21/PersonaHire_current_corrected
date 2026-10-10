
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)

JUDGE0_URL = "https://extra-ce.judge0.com/submissions"

LANGUAGE_IDS = {
    "C++": 54,
    "Java": 62,
    "Python": 71,
    "JavaScript": 63,
}


@app.route("/", methods=["GET"])
def home():
    return "PersonaHire backend is running!"


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "PersonaHire Code Judge"
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

        if status == "Accepted":
            status = "Executed"
            message = (
                "Code executed successfully. Problem-specific test cases "
                "are not configured, so correctness has not been verified."
            )
        else:
            message = error or status

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

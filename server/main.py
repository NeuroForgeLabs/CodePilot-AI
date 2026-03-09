from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import re

from models.schemas import (
    CheckDetail,
    ExecuteRequest,
    ExecuteResponse,
    ExecuteSummary,
    ExerciseCheckRequest,
    ExerciseCheckResponse,
    HintRequest,
    HintResponse,
    ReviewRequest,
    ReviewResponse,
    SyntaxExplainRequest,
    SyntaxExplainResponse,
    TestResult,
)
from services.judge0 import LANGUAGE_IDS, Judge0RateLimitError, build_submission_source, submit_batch
from services.llm import generate_exercise_feedback, generate_hint, generate_review, generate_syntax_explanation

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env.local")
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="InterviewCoach API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROBLEMS_DIR = Path(__file__).resolve().parent.parent / "data" / "problems"
_problems_cache: dict[str, dict] = {}


def _load_problems() -> dict[str, dict]:
    if _problems_cache:
        return _problems_cache
    for filepath in sorted(PROBLEMS_DIR.glob("*.json")):
        with open(filepath) as f:
            problem = json.load(f)
            _problems_cache[problem["id"]] = problem
    return _problems_cache


def _get_problem(problem_id: str) -> dict:
    problems = _load_problems()
    if problem_id not in problems:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found")
    return problems[problem_id]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/problems")
async def list_problems():
    problems = _load_problems()
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "difficulty": p["difficulty"],
            "tags": p.get("tags", []),
        }
        for p in problems.values()
    ]


@app.get("/problems/{problem_id}")
async def get_problem(problem_id: str):
    problem = _get_problem(problem_id)
    safe = {k: v for k, v in problem.items() if k not in ("hiddenTests", "notesForAI")}
    return safe


@app.post("/execute", response_model=ExecuteResponse)
async def execute_code(req: ExecuteRequest):
    problem = _get_problem(req.problemId)

    if req.language not in LANGUAGE_IDS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {req.language}. Supported: {list(LANGUAGE_IDS.keys())}",
        )

    source = build_submission_source(req.language, req.code)

    visible = problem.get("visibleTests", [])
    hidden = problem.get("hiddenTests", [])
    all_tests = visible + hidden

    if not all_tests:
        raise HTTPException(status_code=400, detail="No tests found for this problem")

    def _get_stdin(test: dict, lang: str) -> str:
        stdin = test["stdin"]
        if isinstance(stdin, dict):
            if lang in stdin:
                return stdin[lang]
            return stdin.get("python", next(iter(stdin.values()), ""))
        return stdin

    test_inputs = [_get_stdin(t, req.language) for t in all_tests]
    expected_outputs = [t["expectedStdout"] for t in all_tests]

    try:
        raw_results = await submit_batch(req.language, source, test_inputs, expected_outputs)
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Judge0RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

    visible_results: list[TestResult] = []
    hidden_results: list[TestResult] = []

    for i, (test, result) in enumerate(zip(all_tests, raw_results)):
        stdout = result["stdout"].strip()
        expected = test["expectedStdout"].strip()
        passed = stdout == expected

        tr = TestResult(
            name=f"{'visible' if i < len(visible) else 'hidden'}-{(i % max(len(visible), 1)) + 1}",
            passed=passed,
            stdout=stdout,
            stderr=result.get("stderr", ""),
            expectedStdout=expected,
            time=str(result.get("time", "")) if result.get("time") else None,
            memory=str(result.get("memory", "")) if result.get("memory") else None,
        )

        if i < len(visible):
            visible_results.append(tr)
        else:
            hidden_results.append(tr)

    total = len(visible_results) + len(hidden_results)
    passed_count = sum(1 for t in visible_results + hidden_results if t.passed)

    return ExecuteResponse(
        passed=passed_count == total,
        summary=ExecuteSummary(total=total, passed=passed_count, failed=total - passed_count),
        tests=visible_results,
        hiddenTests=hidden_results,
    )


@app.post("/hint", response_model=HintResponse)
async def get_hint(req: HintRequest):
    problem = _get_problem(req.problemId)

    try:
        hint = await generate_hint(
            problem=problem,
            language=req.language,
            code=req.code,
            hint_level=req.hintLevel,
            mode=req.mode,
            history=req.history,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    return HintResponse(hint=hint)


@app.post("/review", response_model=ReviewResponse)
async def review_code(req: ReviewRequest):
    problem = _get_problem(req.problemId)

    try:
        review = await generate_review(
            problem=problem,
            language=req.language,
            code=req.code,
            results=req.results,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    return ReviewResponse(
        feedback=review.get("feedback", ""),
        complexity=review.get("complexity", {"time": "Unknown", "space": "Unknown"}),
        edgeCases=review.get("edgeCases", []),
        improvements=review.get("improvements", []),
    )


@app.post("/syntax/explain", response_model=SyntaxExplainResponse)
async def syntax_explain(req: SyntaxExplainRequest):
    problem_title: str | None = None
    if req.problemId:
        try:
            problem = _get_problem(req.problemId)
            problem_title = problem.get("title")
        except Exception:
            pass

    try:
        explanation = await generate_syntax_explanation(
            action=req.action,
            language=req.language,
            snippet=req.snippet,
            section_title=req.sectionTitle,
            section_explanation=req.sectionExplanation,
            target_language=req.targetLanguage,
            question=req.question,
            problem_title=problem_title,
            mode=req.mode,
        )
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    return SyntaxExplainResponse(explanation=explanation)


@app.post("/syntax/check", response_model=ExerciseCheckResponse)
async def syntax_check(req: ExerciseCheckRequest):
    checks: list[CheckDetail] = []
    stdout = ""
    stderr = ""
    all_passed = True

    if req.language not in LANGUAGE_IDS:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {req.language}")

    source = build_submission_source(req.language, req.code)
    try:
        results = await submit_batch(req.language, source, [""], [req.expectedOutput or ""])
        result = results[0] if results else {}
        stdout = result.get("stdout", "").strip()
        stderr = result.get("stderr", "").strip()
    except EnvironmentError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Judge0RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        stderr = str(e)

    if req.expectedOutput:
        output_match = stdout == req.expectedOutput.strip()
        checks.append(CheckDetail(label="Correct output", passed=output_match))
        if not output_match:
            all_passed = False

    for pattern in req.requiredPatterns:
        found = pattern in req.code
        checks.append(CheckDetail(label=f"Uses `{pattern}`", passed=found))
        if not found:
            all_passed = False

    if stderr and not stdout:
        all_passed = False
        checks.append(CheckDetail(label="No runtime errors", passed=False))

    check_summary = ", ".join(f"{c.label}: {'pass' if c.passed else 'FAIL'}" for c in checks)

    ai_feedback = ""
    try:
        ai_feedback = await generate_exercise_feedback(
            language=req.language,
            section_title=req.sectionTitle,
            exercise_prompt=req.exercisePrompt,
            code=req.code,
            passed=all_passed,
            stdout=stdout,
            stderr=stderr,
            check_details=check_summary,
        )
    except Exception:
        ai_feedback = "Great effort!" if all_passed else "Check the output and try again."

    return ExerciseCheckResponse(
        passed=all_passed,
        stdout=stdout,
        stderr=stderr,
        checks=checks,
        aiFeedback=ai_feedback,
    )

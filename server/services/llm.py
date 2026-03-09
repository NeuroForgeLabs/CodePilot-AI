from __future__ import annotations

import json
import os

from openai import AsyncOpenAI

from .prompts import (
    HINT_INTERVIEWER_TEMPLATE,
    HINT_LEARNING_TEMPLATE,
    HINT_SYSTEM_PROMPT,
    PROBLEM_AI_ASK_TEMPLATE,
    PROBLEM_AI_SYSTEM_PROMPT,
    REVIEW_SYSTEM_PROMPT,
    REVIEW_USER_TEMPLATE,
    SYNTAX_ASK_TEMPLATE,
    SYNTAX_EXERCISE_REVIEW_TEMPLATE,
    SYNTAX_EXPLAIN_TEMPLATE,
    SYNTAX_SYSTEM_PROMPT,
    SYNTAX_TRANSLATE_TEMPLATE,
)


def _get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    if not api_key:
        raise EnvironmentError(
            "OPENAI_API_KEY is not set. Please add it to your .env file."
        )
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


def _get_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4.1-mini")


async def generate_hint(
    problem: dict,
    language: str,
    code: str,
    hint_level: int,
    mode: str,
    history: list[dict],
) -> str:
    if mode == "strict":
        return "Hints are disabled in Strict mode. Try working through the problem on your own!"

    notes = problem.get("notesForAI", {})
    template = HINT_INTERVIEWER_TEMPLATE if mode == "interviewer" else HINT_LEARNING_TEMPLATE

    user_prompt = template.format(
        title=problem["title"],
        difficulty=problem["difficulty"],
        core_idea=notes.get("coreIdea", "N/A"),
        common_bugs=", ".join(notes.get("commonBugs", [])),
        expected_complexity=notes.get("expectedComplexity", "N/A"),
        language=language,
        code=code,
        hint_level=hint_level,
    )

    messages = [{"role": "system", "content": HINT_SYSTEM_PROMPT}]
    for msg in history[-10:]:
        messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
    messages.append({"role": "user", "content": user_prompt})

    client = _get_client()
    resp = await client.chat.completions.create(
        model=_get_model(),
        messages=messages,
        temperature=0.7,
        max_tokens=800,
    )
    return resp.choices[0].message.content or "No hint available."


async def generate_review(
    problem: dict,
    language: str,
    code: str,
    results: dict,
) -> dict:
    notes = problem.get("notesForAI", {})
    summary = results.get("summary", {})

    user_prompt = REVIEW_USER_TEMPLATE.format(
        title=problem["title"],
        difficulty=problem["difficulty"],
        expected_complexity=notes.get("expectedComplexity", "N/A"),
        language=language,
        code=code,
        total_tests=summary.get("total", 0),
        passed_tests=summary.get("passed", 0),
        failed_tests=summary.get("failed", 0),
    )

    client = _get_client()
    resp = await client.chat.completions.create(
        model=_get_model(),
        messages=[
            {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=1000,
    )

    raw = resp.choices[0].message.content or "{}"
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "feedback": raw,
            "complexity": {"time": "Unknown", "space": "Unknown"},
            "edgeCases": [],
            "improvements": [],
        }


async def generate_syntax_explanation(
    action: str,
    language: str,
    snippet: str,
    section_title: str,
    section_explanation: str,
    target_language: str | None = None,
    question: str | None = None,
    problem_title: str | None = None,
    mode: str = "syntax",
) -> str:
    if mode == "problem" and question:
        system_prompt = PROBLEM_AI_SYSTEM_PROMPT
        user_prompt = PROBLEM_AI_ASK_TEMPLATE.format(
            problem_title=problem_title or "a coding problem",
            language=language,
            question=question,
        )
        temperature = 0.4
    elif action == "translate" and target_language:
        system_prompt = SYNTAX_SYSTEM_PROMPT
        user_prompt = SYNTAX_TRANSLATE_TEMPLATE.format(
            language=language,
            target_language=target_language,
            snippet=snippet,
            section_title=section_title,
            section_explanation=section_explanation,
        )
        temperature = 0.2
    elif action == "ask" and question:
        system_prompt = SYNTAX_SYSTEM_PROMPT
        problem_context = ""
        if problem_title:
            problem_context = f"The user is currently working on the \"{problem_title}\" problem."
        user_prompt = SYNTAX_ASK_TEMPLATE.format(
            language=language,
            snippet=snippet,
            section_title=section_title,
            section_explanation=section_explanation,
            problem_context=problem_context,
            question=question,
        )
        temperature = 0.5
    else:
        system_prompt = SYNTAX_SYSTEM_PROMPT
        problem_context = ""
        if problem_title:
            problem_context = f"The user is currently working on the \"{problem_title}\" problem."
        user_prompt = SYNTAX_EXPLAIN_TEMPLATE.format(
            language=language,
            snippet=snippet,
            section_title=section_title,
            section_explanation=section_explanation,
            problem_context=problem_context,
        )
        temperature = 0.3

    client = _get_client()
    resp = await client.chat.completions.create(
        model=_get_model(),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=600,
    )
    return resp.choices[0].message.content or "No explanation available."


async def generate_exercise_feedback(
    language: str,
    section_title: str,
    exercise_prompt: str,
    code: str,
    passed: bool,
    stdout: str,
    stderr: str,
    check_details: str,
) -> str:
    feedback_instruction = (
        "The user passed! Give a short congratulation and one interview tip related to this syntax."
        if passed else
        "The user's code has issues. Identify the most likely mistake and suggest a fix. Don't give the full answer."
    )

    user_prompt = SYNTAX_EXERCISE_REVIEW_TEMPLATE.format(
        language=language,
        section_title=section_title,
        exercise_prompt=exercise_prompt,
        code=code,
        passed=str(passed),
        stdout=stdout or "(empty)",
        stderr=stderr or "(none)",
        check_details=check_details,
        feedback_instruction=feedback_instruction,
    )

    client = _get_client()
    resp = await client.chat.completions.create(
        model=_get_model(),
        messages=[
            {"role": "system", "content": SYNTAX_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=300,
    )
    return resp.choices[0].message.content or ""

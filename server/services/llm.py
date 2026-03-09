from __future__ import annotations

import json
import os

from openai import AsyncOpenAI

from .prompts import (
    HINT_INTERVIEWER_TEMPLATE,
    HINT_LEARNING_TEMPLATE,
    HINT_SYSTEM_PROMPT,
    REVIEW_SYSTEM_PROMPT,
    REVIEW_USER_TEMPLATE,
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

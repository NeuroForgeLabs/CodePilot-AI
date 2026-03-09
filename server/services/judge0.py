from __future__ import annotations

import asyncio
import base64
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

LANGUAGE_IDS: dict[str, int] = {
    "python": 71,       # Python 3
    "javascript": 63,   # Node.js
    "typescript": 74,   # TypeScript
    "java": 62,         # Java (OpenJDK)
    "csharp": 51,       # C# (Mono)
    "go": 60,           # Go
}

MAX_RETRIES = 3
RETRY_BACKOFF = [1.0, 3.0, 6.0]

WRAPPER_TEMPLATES: dict[str, str] = {
    "python": """\
import sys
{user_code}

if __name__ == "__main__":
    _input = sys.stdin.read().strip()
    exec(_input)
""",
    "javascript": """\
const readline = require('readline');
{user_code}

const rl = readline.createInterface({{ input: process.stdin }});
let _lines = [];
rl.on('line', l => _lines.push(l));
rl.on('close', () => {{
    const _input = _lines.join('\\n').trim();
    eval(_input);
}});
""",
    "typescript": """\
import * as readline from 'readline';
{user_code}

const rl = readline.createInterface({{ input: process.stdin }});
let _lines: string[] = [];
rl.on('line', (l: string) => _lines.push(l));
rl.on('close', () => {{
    const _input = _lines.join('\\n').trim();
    eval(_input);
}});
""",
    "java": """\
import java.util.*;
import java.io.*;

{user_code}

class Main {{
    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {{
            sb.append(line).append("\\n");
        }}
        String input = sb.toString().trim();
        // The test stdin contains a driver call
        // For Java, we compile the class with the user's Solution class
        // and the stdin acts as a driver via reflection or direct call
    }}
}}
""",
    "csharp": """\
using System;
using System.Collections.Generic;
using System.Linq;

{user_code}

class Program {{
    static void Main(string[] args) {{
        string input = Console.In.ReadToEnd().Trim();
    }}
}}
""",
    "go": """\
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{user_code}

func main() {{
    scanner := bufio.NewScanner(os.Stdin)
    var lines []string
    for scanner.Scan() {{
        lines = append(lines, scanner.Text())
    }}
    input := strings.TrimSpace(strings.Join(lines, "\\n"))
    _ = input
    _ = fmt.Sprintf("")
}}
""",
}

# Simpler approach: each test's stdin contains a full driver script
# that imports/calls the user's function and prints the result.
# This avoids complex wrapper logic per language.
DRIVER_TEMPLATES: dict[str, str] = {
    "python": """{user_code}

import sys, json
_raw = sys.stdin.read().strip()
exec(_raw)
""",
    "javascript": """{user_code}

const _rl = require('readline');
const _iface = _rl.createInterface({{ input: process.stdin }});
let _buf = [];
_iface.on('line', l => _buf.push(l));
_iface.on('close', () => {{ eval(_buf.join('\\n')); }});
""",
    "typescript": """{user_code}

const _rl = require('readline');
const _iface = _rl.createInterface({{ input: process.stdin }});
let _buf: string[] = [];
_iface.on('line', (l: string) => _buf.push(l));
_iface.on('close', () => {{ eval(_buf.join('\\n')); }});
""",
    "java": """\
import java.util.*;
import java.io.*;
import java.util.stream.*;

{user_code}

class Main {{
    public static void main(String[] args) throws Exception {{
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.lines().collect(Collectors.joining("\\n")).trim();
        javax.script.ScriptEngine engine = new javax.script.ScriptEngineManager().getEngineByName("js");
        // For Java, stdin contains direct method calls we compile with
    }}
}}
""",
    "csharp": """\
using System;
using System.Collections.Generic;
using System.Linq;

{user_code}
""",
    "go": """\
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{user_code}

func main() {{
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Buffer(make([]byte, 1024*1024), 1024*1024)
    var lines []string
    for scanner.Scan() {{
        lines = append(lines, scanner.Text())
    }}
    _ = strings.TrimSpace(strings.Join(lines, "\\n"))
    _ = fmt.Sprintf("")
}}
""",
}


class Judge0RateLimitError(Exception):
    """Raised when Judge0 returns 429 Too Many Requests."""


def _get_judge0_url() -> str:
    url = os.getenv("JUDGE0_URL", "").rstrip("/")
    if not url:
        raise EnvironmentError(
            "JUDGE0_URL is not set. Please configure it in your .env file. "
            "You can use a self-hosted Judge0 or https://judge0-ce.p.rapidapi.com"
        )
    return url


def _get_headers() -> dict[str, str]:
    headers: dict[str, str] = {"Content-Type": "application/json"}
    api_key = os.getenv("JUDGE0_API_KEY", "")
    if not api_key:
        url = os.getenv("JUDGE0_URL", "")
        if "rapidapi" in url.lower():
            raise EnvironmentError(
                "JUDGE0_API_KEY is not set but you're using the RapidAPI-hosted Judge0. "
                "Sign up at https://rapidapi.com/judge0-official/api/judge0-ce and add "
                "your key to .env.local"
            )
    else:
        headers["X-RapidAPI-Key"] = api_key
        headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"
    return headers


async def _request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    headers: dict[str, str],
    **kwargs: Any,
) -> httpx.Response:
    last_exc: Exception | None = None
    for attempt in range(MAX_RETRIES):
        resp = await client.request(method, url, headers=headers, **kwargs)
        if resp.status_code == 429:
            wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
            logger.warning("Judge0 rate limited (429). Retry %d/%d in %.1fs", attempt + 1, MAX_RETRIES, wait)
            await asyncio.sleep(wait)
            last_exc = Judge0RateLimitError(
                "Judge0 rate limit exceeded (429 Too Many Requests). "
                "The free RapidAPI tier has strict limits — wait a moment and try again, "
                "or upgrade your RapidAPI plan."
            )
            continue
        resp.raise_for_status()
        return resp
    raise last_exc or Judge0RateLimitError("Judge0 rate limit exceeded after retries.")


def build_submission_source(language: str, user_code: str) -> str:
    template = DRIVER_TEMPLATES.get(language)
    if not template:
        raise ValueError(f"Unsupported language: {language}")
    return template.replace("{user_code}", user_code)


async def submit_batch(
    language: str,
    source_code: str,
    test_inputs: list[str],
    expected_outputs: list[str],
) -> list[dict[str, Any]]:
    url = _get_judge0_url()
    headers = _get_headers()
    lang_id = LANGUAGE_IDS.get(language)
    if lang_id is None:
        raise ValueError(f"Unsupported language: {language}")

    encoded_source = base64.b64encode(source_code.encode()).decode()

    submissions = []
    for stdin_val in test_inputs:
        submissions.append({
            "language_id": lang_id,
            "source_code": encoded_source,
            "stdin": base64.b64encode(stdin_val.encode()).decode(),
            "base64_encoded": True,
            "cpu_time_limit": 5,
            "memory_limit": 128000,
        })

    async with httpx.AsyncClient(timeout=60) as client:
        tokens: list[str] = []

        # Try batch submission first
        try:
            resp = await _request_with_retry(
                client, "POST",
                f"{url}/submissions/batch",
                headers=headers,
                json={"submissions": submissions},
                params={"base64_encoded": "true"},
            )
            tokens = [item["token"] for item in resp.json()]
        except (httpx.HTTPError, KeyError, Judge0RateLimitError) as batch_err:
            logger.info("Batch submission failed (%s), falling back to sequential.", type(batch_err).__name__)
            tokens = []
            for i, sub in enumerate(submissions):
                if i > 0:
                    await asyncio.sleep(0.5)
                resp = await _request_with_retry(
                    client, "POST",
                    f"{url}/submissions",
                    headers=headers,
                    json=sub,
                    params={"base64_encoded": "true"},
                )
                tokens.append(resp.json()["token"])

        results = await _poll_results(client, url, headers, tokens)

    return results


async def _poll_results(
    client: httpx.AsyncClient,
    url: str,
    headers: dict[str, str],
    tokens: list[str],
    max_attempts: int = 30,
) -> list[dict[str, Any]]:
    subs: list[dict[str, Any]] = []
    for attempt in range(max_attempts):
        await asyncio.sleep(1.5 if attempt < 3 else 2.0)

        try:
            token_str = ",".join(tokens)
            resp = await _request_with_retry(
                client, "GET",
                f"{url}/submissions/batch",
                headers=headers,
                params={"tokens": token_str, "base64_encoded": "true"},
            )
            data = resp.json()
            subs = data.get("submissions", data) if isinstance(data, dict) else data
        except (httpx.HTTPError, KeyError, Judge0RateLimitError):
            subs = []
            for i, token in enumerate(tokens):
                if i > 0:
                    await asyncio.sleep(0.5)
                try:
                    resp = await _request_with_retry(
                        client, "GET",
                        f"{url}/submissions/{token}",
                        headers=headers,
                        params={"base64_encoded": "true"},
                    )
                    subs.append(resp.json())
                except (httpx.HTTPError, Judge0RateLimitError):
                    subs.append({"status": {"id": 2, "description": "Processing"}})

        if not subs:
            continue

        all_done = all(
            sub.get("status", {}).get("id", 0) not in (1, 2) for sub in subs
        )
        if all_done:
            return [_parse_result(sub) for sub in subs]

    return [_parse_result(sub) for sub in subs]


def _decode_b64(val: str | None) -> str:
    if not val:
        return ""
    try:
        return base64.b64decode(val).decode("utf-8", errors="replace")
    except Exception:
        return val


def _parse_result(sub: dict[str, Any]) -> dict[str, Any]:
    status = sub.get("status", {})
    return {
        "stdout": _decode_b64(sub.get("stdout")),
        "stderr": _decode_b64(sub.get("stderr")) + _decode_b64(sub.get("compile_output")),
        "time": sub.get("time"),
        "memory": sub.get("memory"),
        "status_id": status.get("id", 0),
        "status_description": status.get("description", "Unknown"),
    }

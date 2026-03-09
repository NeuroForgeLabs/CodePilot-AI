from __future__ import annotations

import asyncio
import base64
import os
from typing import Any

import httpx

LANGUAGE_IDS: dict[str, int] = {
    "python": 71,       # Python 3
    "javascript": 63,   # Node.js
    "typescript": 74,   # TypeScript
    "java": 62,         # Java (OpenJDK)
    "csharp": 51,       # C# (Mono)
    "go": 60,           # Go
}

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
    if api_key:
        headers["X-RapidAPI-Key"] = api_key
        headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"
    return headers


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
        # Try batch submission first
        try:
            resp = await client.post(
                f"{url}/submissions/batch",
                json={"submissions": submissions},
                headers=headers,
                params={"base64_encoded": "true"},
            )
            resp.raise_for_status()
            tokens = [item["token"] for item in resp.json()]
        except (httpx.HTTPError, KeyError):
            # Fall back to sequential submissions
            tokens = []
            for sub in submissions:
                resp = await client.post(
                    f"{url}/submissions",
                    json=sub,
                    headers=headers,
                    params={"base64_encoded": "true"},
                )
                resp.raise_for_status()
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
    for _ in range(max_attempts):
        await asyncio.sleep(1)

        try:
            token_str = ",".join(tokens)
            resp = await client.get(
                f"{url}/submissions/batch",
                params={"tokens": token_str, "base64_encoded": "true"},
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            subs = data.get("submissions", data) if isinstance(data, dict) else data
        except (httpx.HTTPError, KeyError):
            # Fall back to individual polling
            subs = []
            for token in tokens:
                resp = await client.get(
                    f"{url}/submissions/{token}",
                    params={"base64_encoded": "true"},
                    headers=headers,
                )
                resp.raise_for_status()
                subs.append(resp.json())

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

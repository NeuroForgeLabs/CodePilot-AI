# InterviewCoach — Complete Project Documentation

AI-powered coding interview practice platform with multi-language code execution, progressive AI-guided hints, and intelligent code review.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Environment Variables](#environment-variables)
6. [Frontend (Next.js)](#frontend-nextjs)
   - [Pages and Layout](#pages-and-layout)
   - [Components](#components)
   - [API Proxy Routes](#api-proxy-routes)
   - [Shared Libraries](#shared-libraries)
   - [Styling](#styling)
7. [Backend (FastAPI)](#backend-fastapi)
   - [Server Entry Point](#server-entry-point)
   - [API Endpoints](#api-endpoints)
   - [Pydantic Schemas](#pydantic-schemas)
   - [Judge0 Code Execution Service](#judge0-code-execution-service)
   - [LLM Service](#llm-service)
   - [Prompt Templates](#prompt-templates)
   - [Chunking Utility](#chunking-utility)
8. [Problem Data Format](#problem-data-format)
9. [User Flow](#user-flow)
10. [How Code Execution Works](#how-code-execution-works)
11. [How the Hint System Works](#how-the-hint-system-works)
12. [How AI Review Works](#how-ai-review-works)
13. [Local Storage and Persistence](#local-storage-and-persistence)
14. [Infrastructure (Docker Compose)](#infrastructure-docker-compose)
15. [Setup and Running](#setup-and-running)
16. [Using Alternative LLM Providers](#using-alternative-llm-providers)

---

## Overview

InterviewCoach is a full-stack web application designed to help users practice coding interviews. It provides:

- **10 curated coding problems** ranging from Easy to Medium difficulty (Two Sum, Reverse String, Valid Parentheses, Climbing Stairs, Binary Search, Maximum Subarray, Merge Intervals, Longest Substring Without Repeating, Product Except Self, Linked List Cycle).
- **6 supported programming languages**: Python, JavaScript, TypeScript, Java, C#, Go.
- **A Monaco Editor** (the same editor powering VS Code) for writing solutions with syntax highlighting, bracket colorization, and language-aware editing.
- **Code execution** via Judge0 against both visible and hidden test cases.
- **AI-guided hints** with three modes: Strict (no hints), Interviewer (Socratic, no code), and Learning (more direct, pseudocode allowed). Hints are progressive across 5 levels from subtle to detailed.
- **AI code review** after running tests, providing feedback, time/space complexity analysis, edge case identification, and actionable improvements.
- **Auto-save** of user code attempts to browser localStorage.

---

## Tech Stack

| Layer       | Technology                                                             |
|-------------|------------------------------------------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Monaco Editor |
| Backend     | Python 3, FastAPI 0.115, Uvicorn 0.34, Pydantic 2.10                  |
| Code Execution | Judge0 CE (cloud-hosted via RapidAPI or self-hosted)                |
| AI/LLM      | OpenAI SDK 1.58 (compatible with any OpenAI-compatible API)           |
| HTTP Client  | httpx 0.28 (async, used for Judge0 API calls)                        |
| Markdown     | react-markdown 9.0 (rendering hint text)                             |
| Icons        | Lucide React 0.460                                                   |
| Storage      | Browser localStorage (client-side persistence)                       |
| Infra        | Docker Compose (Postgres 16 + Redis 7, scaffolded for future use)    |

### Frontend Dependencies (package.json)

- `next` 14.2.21
- `react` / `react-dom` ^18.3.1
- `@monaco-editor/react` ^4.6.0
- `lucide-react` ^0.460.0
- `react-markdown` ^9.0.1
- `tailwindcss` ^3.4.16, `autoprefixer` ^10.4.20, `postcss` ^8.4.49
- `typescript` ^5.7.0

### Backend Dependencies (requirements.txt)

- `fastapi` 0.115.6
- `uvicorn[standard]` 0.34.0
- `httpx` 0.28.1
- `pydantic` 2.10.3
- `python-dotenv` 1.0.1
- `openai` 1.58.1

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Browser (localhost:3000)                         │
│                                                                          │
│  ┌──────────────┐  ┌──────────────────────┐  ┌────────────────────────┐ │
│  │ ProblemPanel │  │     CodeEditor        │  │      RightPanel        │ │
│  │   (left)     │  │ (center, Monaco)      │  │  Tests | Hint | Review │ │
│  └──────────────┘  └──────────────────────┘  └────────────────────────┘ │
│                                                                          │
│  localStorage ◄──── Auto-save attempts (debounced 1s) ────► localStorage│
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
                    POST /api/execute, /api/hint, /api/review
                    (Next.js API routes — server-side proxy)
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (localhost:8000)                      │
│                                                                          │
│  POST /execute ──► Judge0 (code execution, batch submit + poll)          │
│  POST /hint    ──► OpenAI-compatible LLM (hint generation)               │
│  POST /review  ──► OpenAI-compatible LLM (code review, JSON response)    │
│  GET  /health  ──► { "status": "ok" }                                    │
│  GET  /problems ─► List all problems (id, title, difficulty, tags)        │
│  GET  /problems/{id} ► Single problem (sans hiddenTests, notesForAI)     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Data flow summary:**
1. Problems are loaded at build time from JSON files in `data/problems/` on both the frontend (via static imports in `lib/problems.ts`) and the backend (via filesystem reads in `main.py`).
2. The frontend calls Next.js API routes (`/api/execute`, `/api/hint`, `/api/review`), which act as server-side proxies, forwarding requests to the FastAPI backend.
3. The backend handles execution by calling Judge0, and hint/review generation by calling an OpenAI-compatible LLM API.

---

## Directory Structure

```
InterviewCoach/
├── .env.example                    # Environment variable template
├── .env.local                      # Local environment (not committed)
├── docker-compose.yml              # Postgres + Redis (scaffolded)
├── package.json                    # Frontend dependencies and scripts
├── package-lock.json               # npm lockfile
├── tsconfig.json                   # TypeScript configuration
├── next.config.mjs                 # Next.js configuration
├── next-env.d.ts                   # Next.js type references (auto-generated)
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.mjs              # PostCSS configuration
├── README.md                       # Project README
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (Inter font, dark theme, metadata)
│   ├── page.tsx                    # Main page (state management, 3-panel UI)
│   ├── globals.css                 # Global styles (Tailwind, scrollbars, prose)
│   └── api/                        # API proxy routes (server-side)
│       ├── execute/
│       │   └── route.ts            # POST /api/execute → FastAPI /execute
│       ├── hint/
│       │   └── route.ts            # POST /api/hint → FastAPI /hint
│       └── review/
│           └── route.ts            # POST /api/review → FastAPI /review
│
├── components/                     # React UI components
│   ├── CodeEditor.tsx              # Monaco Editor with language selector
│   ├── ProblemPanel.tsx            # Problem description, examples, constraints
│   ├── ProblemSelector.tsx         # Problem dropdown picker
│   ├── RightPanel.tsx              # Tab container (Tests / Hint / Review)
│   ├── TestResults.tsx             # Test execution results display
│   ├── HintPanel.tsx               # Hint mode/level controls + hint display
│   └── ReviewPanel.tsx             # AI review display (feedback, complexity, etc.)
│
├── lib/                            # Shared frontend utilities
│   ├── types.ts                    # TypeScript interfaces and type definitions
│   ├── problems.ts                 # Problem loader (static JSON imports)
│   └── storage.ts                  # localStorage helpers for attempts
│
├── data/
│   └── problems/                   # Problem definitions (10 JSON files)
│       ├── two-sum.json
│       ├── reverse-string.json
│       ├── valid-parentheses.json
│       ├── climbing-stairs.json
│       ├── binary-search.json
│       ├── maximum-subarray.json
│       ├── merge-intervals.json
│       ├── longest-substring-without-repeating.json
│       ├── product-except-self.json
│       └── linked-list-cycle.json
│
├── server/                         # Python FastAPI backend
│   ├── main.py                     # App entry point, endpoints, CORS
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py              # Pydantic request/response models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── judge0.py               # Judge0 API integration
│   │   ├── llm.py                  # OpenAI-compatible LLM calls
│   │   └── prompts.py              # System prompts and templates
│   └── utils/
│       ├── __init__.py
│       └── chunking.py             # Text chunking utility (future use)
│
└── public/                         # Static assets (currently empty)
```

---

## Environment Variables

Defined in `.env.example`, intended to be copied to `.env.local`:

| Variable                 | Required | Default                              | Description                                                    |
|--------------------------|----------|--------------------------------------|----------------------------------------------------------------|
| `NEXT_PUBLIC_APP_NAME`   | No       | `InterviewCoach`                     | App display name                                               |
| `FASTAPI_BASE_URL`       | No       | `http://localhost:8000`              | FastAPI backend URL (used by Next.js API proxy routes)         |
| `OPENAI_API_KEY`         | Yes      | —                                    | API key for OpenAI or compatible provider                      |
| `OPENAI_BASE_URL`        | No       | `https://api.openai.com/v1`         | Base URL for the LLM API (change for Claude, local models, etc.) |
| `OPENAI_MODEL`           | No       | `gpt-4.1-mini`                      | Model name to use for hints and reviews                        |
| `JUDGE0_URL`             | Yes      | —                                    | Judge0 instance URL (e.g. `https://judge0-ce.p.rapidapi.com`) |
| `JUDGE0_API_KEY`         | Yes*     | —                                    | RapidAPI key (required if using RapidAPI-hosted Judge0)        |
| `POSTGRES_USER`          | No       | `interviewcoach`                     | Postgres user (scaffolded, not used yet)                       |
| `POSTGRES_PASSWORD`      | No       | `changeme`                           | Postgres password (scaffolded, not used yet)                   |
| `POSTGRES_DB`            | No       | `interviewcoach`                     | Postgres database name (scaffolded, not used yet)              |
| `REDIS_URL`              | No       | `redis://localhost:6379`             | Redis URL (scaffolded, not used yet)                           |

---

## Frontend (Next.js)

### Pages and Layout

#### `app/layout.tsx`
The root layout wraps all pages. It:
- Loads the **Inter** font from Google Fonts.
- Sets the HTML class to `dark` for dark theme.
- Applies the `antialiased` class for smooth font rendering.
- Sets page metadata (title: "InterviewCoach — AI Coding Interview Practice").

#### `app/page.tsx`
The main (and only) page. This is a client component (`"use client"`) that acts as the application shell and state orchestrator. It manages:

**State:**
- `selectedProblemId` — which problem is currently selected
- `language` — selected programming language (default: `python`)
- `code` — current editor contents
- `activeTab` — which right-panel tab is active (`tests`, `hint`, or `review`)
- Execute state: `executeResults`, `executeLoading`, `executeError`
- Hint state: `hintMode`, `hintLevel`, `hints[]`, `hintLoading`, `hintError`
- Review state: `review`, `reviewLoading`, `reviewError`

**Effects:**
- When `selectedProblemId` or `language` changes: loads saved attempt from localStorage (or falls back to starter code), resets all results/hints/reviews.
- On code change (debounced 1 second): auto-saves to localStorage via `saveAttempt()`.

**Action Handlers:**
- `handleExecute()` — POSTs to `/api/execute` with `{problemId, language, code}`, stores result.
- `handleHint()` — POSTs to `/api/hint` with `{problemId, language, code, hintLevel, mode, history}`. Builds conversation history from previous hints. Disabled in Strict mode.
- `handleReview()` — POSTs to `/api/review` with `{problemId, language, code, results}`. Requires execute results first.
- `handleReset()` — Resets code to starter template and clears all results.

**Layout:** A 3-panel layout inside a full-height flexbox:
1. **Left (340px)** — `ProblemPanel` showing the problem description.
2. **Center (flex-1)** — `CodeEditor` with the Monaco editor.
3. **Right (380px)** — `RightPanel` with tabs for Tests, Hint, and Review.

A **top header bar** contains the app logo, `ProblemSelector` dropdown, and action buttons (Reset, Hint, Review, Run).

### Components

#### `components/ProblemSelector.tsx`
A custom dropdown component for picking a problem. Shows the current problem's difficulty (color-coded: green for Easy, amber for Medium, red for Hard) and title. When open, lists all problems with difficulty, title, and up to 2 tags. Closes on outside click via a `mousedown` event listener.

#### `components/ProblemPanel.tsx`
Left panel displaying the selected problem's details:
- Title with a color-coded difficulty badge.
- Tags as small pills.
- Problem prompt (whitespace-preserved).
- Examples (input/output pairs in styled cards).
- Constraints (bulleted list with code formatting).

#### `components/CodeEditor.tsx`
Wraps the `@monaco-editor/react` Monaco Editor:
- A top bar shows "Solution" label and a language `<select>` dropdown.
- The editor uses the `vs-dark` theme.
- Configuration: 14px font, JetBrains Mono / Fira Code / Cascadia Code font stack, ligatures enabled, minimap disabled, bracket pair colorization, word wrap, tab size 4, smooth scrolling.
- Language switching re-maps via `MONACO_LANGUAGE_MAP`.

#### `components/RightPanel.tsx`
A tabbed container for the right panel. Three tabs:
- **Tests** (`FlaskConical` icon) — renders `TestResults`
- **Hint** (`Lightbulb` icon) — renders `HintPanel`
- **Review** (`MessageSquare` icon) — renders `ReviewPanel`

The active tab is highlighted with a bottom border in the brand color.

#### `components/TestResults.tsx`
Displays code execution results:
- **Loading state**: spinner with "Running tests..." message.
- **Error state**: red error card.
- **Empty state**: prompt to click Run.
- **Results**: Summary bar (green if all passed, red if any failed, showing X/Y passed). Visible tests shown as expandable cards with pass/fail icon, test name, execution time, memory usage. Failed tests show expected vs actual stdout, and stderr if present. Hidden tests shown as a row of colored dots (green=pass, red=fail) with a pass count.

#### `components/HintPanel.tsx`
The hint interface:
- **Mode selector**: 3-button grid (Interviewer / Learning / Strict). A warning banner appears in Strict mode.
- **Hint level slider**: Range input 1–5, labeled "Subtle" to "Direct".
- **"Get Hint" button**: Triggers hint request. Disabled when loading or in Strict mode.
- **Hints display**: Scrollable list of received hints. Each hint is numbered and rendered as Markdown via `react-markdown` with `prose-invert` styling.

#### `components/ReviewPanel.tsx`
The AI review interface:
- **"Get AI Review" button**: Disabled until code has been run.
- **Review display** (when available):
  - **Feedback** section with a general assessment.
  - **Complexity** section showing time and space complexity in a 2-column grid with monospace font.
  - **Edge Cases** as a bulleted list with amber dots.
  - **Improvements** as a bulleted list with green dots.

### API Proxy Routes

All three API routes follow the same pattern — they act as server-side proxies from the Next.js frontend to the FastAPI backend, avoiding CORS issues and keeping the backend URL private.

#### `app/api/execute/route.ts`
- **Method**: POST
- **Flow**: Reads request body → forwards to `${FASTAPI_BASE_URL}/execute` → returns response or error.
- **Error handling**: Returns structured `{error}` JSON with the backend's error detail, or a 502 if the backend is unreachable.

#### `app/api/hint/route.ts`
- Same pattern, proxies to `/hint`.

#### `app/api/review/route.ts`
- Same pattern, proxies to `/review`.

### Shared Libraries

#### `lib/types.ts`
All TypeScript type definitions:

- `ProblemExample` — `{input, output}` for example display.
- `TestCase` — `{stdin, expectedStdout}` for test execution.
- `StarterCode` — An object with keys for each language (`python`, `javascript`, `typescript`, `java`, `csharp`, `go`).
- `Problem` — Full problem definition (id, title, difficulty, tags, prompt, examples, constraints, starterCode, visibleTests).
- `ProblemListItem` — Subset for the dropdown (id, title, difficulty, tags).
- `Language` — Union type derived from `keyof StarterCode`.
- `LANGUAGES` — Array of `{value, label}` pairs for the language dropdown.
- `MONACO_LANGUAGE_MAP` — Maps `Language` to Monaco editor language identifiers.
- `HintMode` — `"strict" | "interviewer" | "learning"`.
- `TestResult` — Individual test result (name, passed, stdout, stderr, expectedStdout, time, memory).
- `ExecuteResponse` — `{passed, summary, tests[], hiddenTests[]}`.
- `HintResponse` — `{hint}`.
- `ReviewResponse` — `{feedback, complexity, edgeCases[], improvements[]}`.
- `Attempt` — `{problemId, language, code, timestamp}` for localStorage persistence.

#### `lib/problems.ts`
Statically imports all 10 problem JSON files and exposes:
- `getProblems()` — Returns an array of `ProblemListItem` (id, title, difficulty, tags only).
- `getProblem(id)` — Returns the full `Problem` object by ID, or `undefined`.

#### `lib/storage.ts`
Browser localStorage persistence under the key `interviewcoach_attempts`:
- `saveAttempt(problemId, language, code)` — Upserts an attempt (keyed by `problemId:language`), stores with a timestamp.
- `getAttempts()` — Returns all saved attempts.
- `getAttempt(problemId, language)` — Returns a specific attempt or `null`.
- All functions guard against SSR with `typeof window === "undefined"` checks.

### Styling

#### `app/globals.css`
- Imports Tailwind's base, components, and utilities.
- CSS custom properties: `--background: #0f1117`, `--surface: #161821` for the dark theme.
- Custom scrollbar styling (6px width, dark track, gray thumb).
- `.prose` overrides for rendered markdown: lighter text, slightly smaller paragraphs, pre-block dark background.
- Range input (`input[type=range]`) styling for the hint level slider.

#### `tailwind.config.ts`
- Content paths: `./app/**` and `./components/**`.
- Extended theme with a `brand` color palette (50–950 shades in the blue range) used for active tabs, buttons, and accents.

#### `postcss.config.mjs`
- Plugins: `tailwindcss` and `autoprefixer`.

---

## Backend (FastAPI)

### Server Entry Point

#### `server/main.py`

**Configuration:**
- Loads environment from `.env.local` and `.env` in the project root (parent of `/server`).
- Creates a FastAPI app with title "InterviewCoach API", version "0.1.0".
- CORS middleware: allows all origins, methods, and headers.

**Problem loading:**
- Reads all `*.json` files from `data/problems/` into an in-memory cache (`_problems_cache` dict keyed by problem ID).
- `_get_problem(id)` raises HTTP 404 if a problem ID is not found.

### API Endpoints

#### `GET /health`
Returns `{"status": "ok"}`. Used for health checks.

#### `GET /problems`
Returns a list of all problems with only safe fields: `id`, `title`, `difficulty`, `tags`.

#### `GET /problems/{problem_id}`
Returns a single problem, filtering out `hiddenTests` and `notesForAI` to prevent cheating. Returns all other fields (prompt, examples, constraints, starterCode, visibleTests).

#### `POST /execute`
Runs user code against all test cases (visible + hidden).

**Flow:**
1. Validates the language is supported.
2. Wraps user code with a driver template via `build_submission_source()`.
3. Collects all test stdin/expected-stdout values.
4. Submits to Judge0 via `submit_batch()`.
5. Compares each test's actual stdout (trimmed) to expected stdout (trimmed).
6. Builds `TestResult` objects, categorized as visible or hidden.
7. Returns `ExecuteResponse` with pass/fail status, summary counts, and test details.

**Error responses:**
- 400: Unsupported language or no tests found.
- 503: Judge0 not configured (missing `JUDGE0_URL`).
- 500: General execution error.

#### `POST /hint`
Generates an AI hint.

**Flow:**
1. Looks up the problem (including `notesForAI`).
2. Calls `generate_hint()` from the LLM service with problem context, user code, hint level, mode, and conversation history.
3. Returns `HintResponse` with the hint text.

**Error responses:**
- 503: OpenAI API key not configured.
- 500: LLM error.

#### `POST /review`
Generates an AI code review.

**Flow:**
1. Looks up the problem.
2. Calls `generate_review()` from the LLM service with problem context, user code, and execution results.
3. Extracts structured fields (feedback, complexity, edgeCases, improvements) with fallback defaults.
4. Returns `ReviewResponse`.

### Pydantic Schemas

#### `server/models/schemas.py`

**Request models:**
- `ExecuteRequest` — `{problemId: str, language: str, code: str}`
- `HintRequest` — `{problemId: str, language: str, code: str, hintLevel: int (1–5), mode: "strict"|"interviewer"|"learning", history: list[dict]}`
- `ReviewRequest` — `{problemId: str, language: str, code: str, results: dict}`

**Response models:**
- `TestResult` — `{name, passed, stdout, stderr, expectedStdout, time?, memory?}`
- `ExecuteSummary` — `{total, passed, failed}`
- `ExecuteResponse` — `{passed, summary: ExecuteSummary, tests: list[TestResult], hiddenTests: list[TestResult]}`
- `HintResponse` — `{hint: str}`
- `ComplexityInfo` — `{time: str, space: str}`
- `ReviewResponse` — `{feedback: str, complexity: ComplexityInfo, edgeCases: list[str], improvements: list[str]}`

### Judge0 Code Execution Service

#### `server/services/judge0.py`

**Language IDs:**
| Language   | Judge0 ID |
|------------|-----------|
| Python     | 71        |
| JavaScript | 63        |
| TypeScript | 74        |
| Java       | 62        |
| C#         | 51        |
| Go         | 60        |

**Driver templates (`DRIVER_TEMPLATES`):**
Each language has a template that prepends the user's code and appends a driver that reads stdin and executes it. The test cases' `stdin` field contains a driver script (e.g., `print(solve([2, 7, 11, 15], 9))` for Python) that calls the user's function and prints the result.

- **Python**: Appends the user code, then `exec(_raw)` where `_raw` is stdin.
- **JavaScript/TypeScript**: Appends user code, then reads stdin lines and `eval()`s them.
- **Java**: Appends user code as a Solution class alongside a Main class.
- **C#**: Appends user code directly.
- **Go**: Appends user code with a `main()` function that reads stdin.

**`build_submission_source(language, user_code)`**: Injects user code into the appropriate driver template.

**`submit_batch(language, source_code, test_inputs, expected_outputs)`**:
1. Base64-encodes the source code and each test's stdin.
2. Constructs submission payloads with `cpu_time_limit: 5s` and `memory_limit: 128MB`.
3. Tries batch submission (`POST /submissions/batch`). On failure, falls back to sequential individual submissions.
4. Polls for results via `_poll_results()`.

**`_poll_results(client, url, headers, tokens, max_attempts=30)`**:
1. Polls every 1 second (up to 30 attempts).
2. Tries batch status check (`GET /submissions/batch?tokens=...`). Falls back to individual polling.
3. Status IDs 1 (In Queue) and 2 (Processing) are treated as "not done yet".
4. When all submissions are done, parses and returns results.

**`_parse_result(sub)`**: Extracts stdout, stderr (+ compile output), time, memory, and status from a Judge0 submission response. Decodes base64-encoded fields.

### LLM Service

#### `server/services/llm.py`

**Client setup:**
- `_get_client()` — Creates an `AsyncOpenAI` client using `OPENAI_API_KEY` and `OPENAI_BASE_URL`. Raises `EnvironmentError` if key is missing.
- `_get_model()` — Returns the `OPENAI_MODEL` env var (default `gpt-4.1-mini`).

**`generate_hint(problem, language, code, hint_level, mode, history)`**:
1. If mode is `"strict"`, returns a fixed message immediately.
2. Extracts `notesForAI` from the problem (coreIdea, commonBugs, expectedComplexity).
3. Selects the appropriate template (`HINT_INTERVIEWER_TEMPLATE` or `HINT_LEARNING_TEMPLATE`).
4. Formats the template with problem details, user code, and hint level.
5. Builds a message array: system prompt + last 10 conversation history messages + the new user prompt.
6. Calls the LLM with temperature 0.7, max tokens 800.
7. Returns the assistant's response text.

**`generate_review(problem, language, code, results)`**:
1. Extracts `notesForAI` and execution summary from results.
2. Formats `REVIEW_USER_TEMPLATE` with problem details, user code, and test results.
3. Calls the LLM with temperature 0.4, max tokens 1000.
4. Strips markdown code fences from the response if present.
5. Attempts to parse the response as JSON.
6. Falls back to a default structure if JSON parsing fails (puts raw text in `feedback`).

### Prompt Templates

#### `server/services/prompts.py`

**`HINT_SYSTEM_PROMPT`**: Establishes the AI as "InterviewCoach, an expert coding interview coach." Rules: base guidance on the problem, never invent facts, encourage the user to explain their approach, use structured output, stay concise. Anti-cheat: never produce a complete working solution.

**`HINT_INTERVIEWER_TEMPLATE`** (Socratic mode):
- Template variables: `{title}`, `{difficulty}`, `{core_idea}`, `{common_bugs}`, `{expected_complexity}`, `{language}`, `{code}`, `{hint_level}`
- Hint levels 1–5:
  1. Ask a clarifying question about their approach.
  2. Point toward the right data structure/pattern without naming it.
  3. Name the pattern and ask how they'd apply it.
  4. Provide pseudocode outline (no real code).
  5. Walk through the algorithm step-by-step in words (still no complete code).

**`HINT_LEARNING_TEMPLATE`** (Learning mode):
- Same template variables.
- Hint levels 1–5:
  1. Ask what approach they're considering, suggest thinking about edge cases.
  2. Name the optimal pattern and explain why it fits.
  3. Provide pseudocode.
  4. Provide a partial code snippet (key logic only).
  5. Detailed walkthrough with partial code. Full solution only if explicitly requested in history.

**`REVIEW_SYSTEM_PROMPT`**: The AI acts as a senior engineer conducting an interview debrief. Must provide: (1) feedback (2-3 sentences), (2) time/space complexity, (3) 2-4 edge cases, (4) 2-4 improvements. Response must be valid JSON matching the schema `{feedback, complexity: {time, space}, edgeCases[], improvements[]}`.

**`REVIEW_USER_TEMPLATE`**: Template variables: `{title}`, `{difficulty}`, `{expected_complexity}`, `{language}`, `{code}`, `{total_tests}`, `{passed_tests}`, `{failed_tests}`.

### Chunking Utility

#### `server/utils/chunking.py`

`chunk_text(text, max_chars=4000, overlap=200)` — Splits text into overlapping chunks for LLM context window management. Currently unused but scaffolded for future features like processing long conversation histories.

---

## Problem Data Format

Each problem is a JSON file in `data/problems/`. Example structure (from `two-sum.json`):

```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  "tags": ["arrays", "hashmap"],
  "prompt": "Given an array of integers `nums` and an integer `target`...",
  "examples": [
    {
      "input": "nums = [2, 7, 11, 15], target = 9",
      "output": "[0, 1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9"
  ],
  "starterCode": {
    "python": "def solve(nums, target):\n    pass",
    "javascript": "function solve(nums, target) {\n  \n}",
    "typescript": "export function solve(nums: number[], target: number): number[] {\n  \n}",
    "java": "class Solution {\n    public int[] solve(int[] nums, int target) {\n        \n    }\n}",
    "csharp": "public class Solution {\n    public int[] Solve(int[] nums, int target) {\n        \n    }\n}",
    "go": "func solve(nums []int, target int) []int {\n    \n}"
  },
  "visibleTests": [
    {
      "stdin": "print(solve([2, 7, 11, 15], 9))",
      "expectedStdout": "[0, 1]"
    }
  ],
  "hiddenTests": [
    {
      "stdin": "print(solve([3, 3], 6))",
      "expectedStdout": "[0, 1]"
    }
  ],
  "notesForAI": {
    "coreIdea": "Use a hash map to store seen values and their indices...",
    "commonBugs": [
      "Forgetting to sort the result before returning",
      "Using the same element twice when duplicate values exist"
    ],
    "expectedComplexity": "O(n)"
  }
}
```

**Field descriptions:**
- `id` — Unique slug identifier.
- `title` — Display name.
- `difficulty` — `"Easy"`, `"Medium"`, or `"Hard"`.
- `tags` — Category tags (e.g., `["arrays", "hashmap"]`).
- `prompt` — The problem description (supports markdown-like backtick formatting).
- `examples` — Input/output examples shown to the user.
- `constraints` — Problem constraints shown to the user.
- `starterCode` — Boilerplate code per language, pre-loaded in the editor.
- `visibleTests` — Tests whose results (expected vs actual) are shown to the user.
- `hiddenTests` — Tests whose individual results are hidden; only pass/fail dots are shown.
- `notesForAI` — Metadata provided to the LLM for better hints and reviews (never sent to the frontend):
  - `coreIdea` — The key insight for solving the problem.
  - `commonBugs` — Typical mistakes users make.
  - `expectedComplexity` — Target time/space complexity.

### Available Problems

| Problem                              | Difficulty | Tags                              |
|--------------------------------------|------------|-----------------------------------|
| Two Sum                              | Easy       | arrays, hashmap                   |
| Reverse String                       | Easy       | strings, two-pointers             |
| Valid Parentheses                     | Easy       | stack, strings                    |
| Climbing Stairs                      | Easy       | dynamic-programming, recursion    |
| Binary Search                        | Easy       | arrays, binary-search             |
| Maximum Subarray                     | Medium     | arrays, dynamic-programming       |
| Merge Intervals                      | Medium     | arrays, sorting                   |
| Longest Substring Without Repeating  | Medium     | strings, sliding-window, hashmap  |
| Product Except Self                  | Medium     | arrays                            |
| Linked List Cycle                    | Medium     | linked-list, two-pointers         |

---

## User Flow

1. **Select a problem** from the dropdown in the header.
2. **Choose a language** from the dropdown above the editor.
3. **Write your solution** in the Monaco editor. Code is auto-saved to localStorage after 1 second of inactivity.
4. **Click "Run"** to execute code against all test cases (visible + hidden) via Judge0. Results appear in the Tests tab on the right.
5. **Click "Hint"** to get an AI-guided hint at the current hint level and mode. The hint appears in the Hint tab. Each subsequent hint click adds a new hint to the conversation, building progressive guidance.
6. **Click "Review"** (after running code) to get an AI code review. The review appears in the Review tab with feedback, complexity analysis, edge cases, and suggested improvements.
7. **Click "Reset"** to clear your code and revert to the starter template.

---

## How Code Execution Works

1. User clicks **Run** → frontend POSTs `{problemId, language, code}` to `/api/execute`.
2. Next.js API route proxies the request to FastAPI `POST /execute`.
3. FastAPI loads the problem's visible and hidden tests, builds a submission source by injecting the user's code into a language-specific driver template.
4. The driver template prepends the user's code and sets up stdin reading. Each test's `stdin` field contains a driver call (e.g., `print(solve([2,7,11,15], 9))` for Python) that invokes the user's function and prints the result.
5. Submissions are sent to Judge0 in batch (or sequentially as fallback). Each submission is base64-encoded with a 5-second CPU time limit and 128MB memory limit.
6. The backend polls Judge0 every second (up to 30 times) until all submissions complete.
7. Results are compared: actual stdout (trimmed) vs expected stdout (trimmed). Test results include execution time and memory usage.
8. The response separates visible tests (full details shown) from hidden tests (only pass/fail shown as dots).

---

## How the Hint System Works

1. User selects a **mode** (Interviewer, Learning, or Strict) and a **hint level** (1–5).
2. User clicks **"Get Hint"** (or the "Hint" button in the header).
3. Frontend POSTs `{problemId, language, code, hintLevel, mode, history}` to `/api/hint`.
4. The backend loads the problem's `notesForAI` (coreIdea, commonBugs, expectedComplexity).
5. If mode is `"strict"`, a fixed message is returned immediately.
6. Otherwise, the appropriate prompt template is filled with problem context and the user's current code.
7. The LLM is called with the system prompt, up to 10 previous conversation messages, and the new hint request. Temperature is 0.7 for creative but focused responses.
8. The hint text is returned and displayed as markdown in the Hint panel.
9. Subsequent hint requests include previous hints as conversation history, enabling progressive guidance.

**Hint levels (Interviewer mode):**
1. Clarifying question about approach.
2. Point toward the right data structure/pattern without naming it.
3. Name the pattern and ask how to apply it.
4. Pseudocode outline.
5. Step-by-step algorithm walkthrough in words.

**Hint levels (Learning mode):**
1. Ask about approach, suggest edge cases.
2. Name the optimal pattern and explain why.
3. Provide pseudocode.
4. Partial code snippet with key logic.
5. Detailed walkthrough with partial code.

---

## How AI Review Works

1. User must first **run their code** (Review is disabled until execute results exist).
2. User clicks **"Get AI Review"** (or the "Review" button in the header).
3. Frontend POSTs `{problemId, language, code, results}` to `/api/review`.
4. The backend loads the problem and formats the review prompt with the user's code and test result summary.
5. The LLM is called with the review system prompt and user prompt. Temperature is 0.4 for more deterministic, analytical responses.
6. The response is expected to be JSON with fields: `feedback`, `complexity`, `edgeCases`, `improvements`.
7. If the LLM returns markdown-fenced JSON, the fences are stripped before parsing.
8. If JSON parsing fails, the raw text is used as feedback with default values for other fields.

---

## Local Storage and Persistence

User code attempts are persisted in browser localStorage under the key `interviewcoach_attempts`. The data structure is an array of `Attempt` objects:

```json
[
  {
    "problemId": "two-sum",
    "language": "python",
    "code": "def solve(nums, target):\n    seen = {}\n    ...",
    "timestamp": 1709913600000
  }
]
```

- **Save**: Debounced 1 second after the last code change. Upserts by `problemId + language` combination.
- **Load**: When switching problems or languages, checks for a saved attempt. If found, restores the code; otherwise loads starter code.
- **No server-side persistence**: All data stays in the browser. Clearing browser data loses all saved attempts.

---

## Infrastructure (Docker Compose)

`docker-compose.yml` provisions two services (scaffolded for future use, not required for the current MVP):

- **Postgres 16** (Alpine): Default credentials `interviewcoach/changeme`, database `interviewcoach`, port 5432. Data persisted in a named volume `pgdata`.
- **Redis 7** (Alpine): Port 6379, data persisted in `redisdata` volume.

Both services restart `unless-stopped`.

---

## Setup and Running

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Judge0 instance (cloud via RapidAPI or self-hosted)
- An OpenAI API key (or compatible provider)

### 1. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:
- `JUDGE0_URL` — Your Judge0 instance URL
- `JUDGE0_API_KEY` — Your Judge0 API key
- `OPENAI_API_KEY` — Your LLM API key
- `OPENAI_BASE_URL` — (Optional) Change if using a non-OpenAI provider
- `OPENAI_MODEL` — (Optional) Change the model name

### 2. Start the Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`. Verify with `curl http://localhost:8000/health`.

### 3. Start the Frontend

```bash
# From project root
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### 4. (Optional) Start Infrastructure

```bash
docker compose up -d
```

Starts Postgres and Redis containers. Not required for the current feature set.

---

## Using Alternative LLM Providers

The backend uses the OpenAI SDK's `AsyncOpenAI` client, which is compatible with any API that implements the OpenAI chat completions interface. To use a different provider, update your `.env.local`:

**Claude (Anthropic via OpenAI-compatible endpoint):**
```env
OPENAI_BASE_URL=https://api.anthropic.com/v1
OPENAI_API_KEY=sk-ant-...
OPENAI_MODEL=claude-sonnet-4-20250514
```

**Local model (e.g., via Ollama, LM Studio, vLLM):**
```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=not-needed
OPENAI_MODEL=llama3
```

Any provider that supports the `POST /chat/completions` endpoint with the OpenAI message format will work.

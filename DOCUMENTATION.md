# InterviewCoach — Complete Project Documentation

AI-powered coding interview practice platform with 100 algorithm problems, multi-language code execution, progressive AI-guided hints, intelligent code review, and an interactive 9-language syntax trainer.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Environment Variables](#environment-variables)
6. [Frontend (Next.js)](#frontend-nextjs)
   - [Pages and Layout](#pages-and-layout)
   - [Top-Level Navigation](#top-level-navigation)
   - [Components](#components)
   - [Syntax Trainer Components](#syntax-trainer-components)
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
8. [Problem Data Format](#problem-data-format)
9. [Syntax Trainer System](#syntax-trainer-system)
   - [Curriculum](#curriculum)
   - [Trainer Lesson Format](#trainer-lesson-format)
   - [Reference Lessons](#reference-lessons)
   - [Exercise Validation](#exercise-validation)
10. [User Flows](#user-flows)
11. [How Code Execution Works](#how-code-execution-works)
12. [How the Hint System Works](#how-the-hint-system-works)
13. [How AI Review Works](#how-ai-review-works)
14. [AI Behavior Modes](#ai-behavior-modes)
15. [Local Storage and Persistence](#local-storage-and-persistence)
16. [Infrastructure (Docker Compose)](#infrastructure-docker-compose)
17. [Setup and Running](#setup-and-running)
18. [Using Alternative LLM Providers](#using-alternative-llm-providers)

---

## Overview

InterviewCoach is a full-stack web application for coding interview preparation. It provides:

- **100 coding problems** (35 Easy, 45 Medium, 20 Hard) across 21 topic categories, with LeetCode-style topic filtering (Array, String, Hash Table, Dynamic Programming, Tree, Graph, etc.)
- **Interactive Syntax Trainer** with 13 curriculum categories across 9 programming languages (Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust) — 117 lesson files with ~500 interactive exercises
- **Static Syntax Reference** with 4 reference lessons (Hashmaps, Arrays & Loops, Stacks & Queues, Sorting) in Python, JavaScript, and Java
- **6 editor languages** for solving problems: Python, JavaScript, TypeScript, Java, C#, Go
- **9 syntax trainer languages**: Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust
- **Monaco Editor** (VS Code editor) with syntax highlighting, bracket colorization, and language-aware editing
- **Code execution** via Judge0 against visible + hidden test cases, with per-language test support
- **AI-guided hints** with 3 modes (Strict, Interviewer, Learning) and 5 progressive hint levels
- **AI code review** with complexity analysis, edge cases, and improvement suggestions
- **AI Assistant** with dual-mode behavior: coaching mode for problems (no spoilers) and tutoring mode for syntax (teaches freely)
- **Auto-save** of code attempts to browser localStorage

---

## Tech Stack

| Layer          | Technology                                                              |
|----------------|-------------------------------------------------------------------------|
| Frontend       | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Monaco Editor |
| Backend        | Python 3, FastAPI 0.115, Uvicorn 0.34, Pydantic 2.10                   |
| Code Execution | Judge0 CE (9 languages: Python, JS, TS, Java, C#, Go, C, C++, Rust)    |
| AI/LLM         | OpenAI SDK 1.58 (compatible with any OpenAI-compatible API)            |
| HTTP Client    | httpx 0.28 (async, used for Judge0 API calls)                          |
| Markdown       | react-markdown 9.0 (rendering hints, AI responses)                    |
| Icons          | Lucide React 0.460                                                     |
| Storage        | Browser localStorage (client-side persistence)                         |
| Infra          | Docker Compose (Postgres 16 + Redis 7, scaffolded for future use)      |

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
│  Top Nav: [Problems] [Syntax]                                           │
│                                                                          │
│  ┌─ Problems View ───────────────────────────────────────────────────┐  │
│  │ Difficulty filters | Topic filter tabs | Search                    │  │
│  │ 100 problems listed with tags and difficulty badges                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ Workspace (on problem select) ───────────────────────────────────┐  │
│  │ Problem Panel │ Monaco Editor │ Tests|Hint|Review|AI tabs          │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─ Syntax View ─────────────────────────────────────────────────────┐  │
│  │ [Learn|Reference] [Language▼] │ AI Chat Panel                     │  │
│  │ 13 curriculum categories      │                                    │  │
│  │ Interactive exercises          │                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  localStorage ◄──── Auto-save attempts (debounced 1s) ────►             │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
          POST /api/execute, /api/hint, /api/review,
          /api/syntax/explain, /api/syntax/check
          (Next.js API routes — server-side proxy)
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (localhost:8000)                      │
│                                                                          │
│  POST /execute       ──► Judge0 (code execution, 9 languages)           │
│  POST /hint          ──► OpenAI-compatible LLM (hint generation)        │
│  POST /review        ──► OpenAI-compatible LLM (code review)            │
│  POST /syntax/explain ──► LLM (syntax explain / translate / ask)        │
│  POST /syntax/check   ──► Judge0 + pattern checks + LLM feedback        │
│  GET  /health         ──► { "status": "ok" }                            │
│  GET  /problems       ──► List all 100 problems                         │
│  GET  /problems/{id}  ──► Single problem (sans hiddenTests, notesForAI) │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
InterviewCoach/
├── .env.example                        # Environment variable template
├── .env.local                          # Local environment (not committed)
├── .gitignore
├── docker-compose.yml                  # Postgres + Redis (scaffolded)
├── package.json                        # Frontend dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── next.config.mjs                     # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── postcss.config.mjs                  # PostCSS configuration
├── README.md
├── DOCUMENTATION.md                    # This file
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # Root layout (Inter font, dark theme)
│   ├── page.tsx                        # Main page (top-level nav, 3 views)
│   ├── globals.css                     # Global styles
│   └── api/                            # API proxy routes
│       ├── execute/route.ts            # POST → FastAPI /execute
│       ├── hint/route.ts              # POST → FastAPI /hint
│       ├── review/route.ts            # POST → FastAPI /review
│       └── syntax/
│           ├── explain/route.ts        # POST → FastAPI /syntax/explain
│           └── check/route.ts          # POST → FastAPI /syntax/check
│
├── components/                         # React UI components
│   ├── AIChatPanel.tsx                 # AI chat with dual mode (syntax/problem)
│   ├── CodeEditor.tsx                  # Monaco Editor with language selector
│   ├── HintPanel.tsx                   # Hint mode/level controls + display
│   ├── ProblemPanel.tsx                # Problem description, examples, constraints
│   ├── ProblemSelector.tsx             # Problem dropdown picker (legacy)
│   ├── ProblemsView.tsx                # Problem browser with topic + difficulty filters
│   ├── ReviewPanel.tsx                 # AI review display
│   ├── RightPanel.tsx                  # Tabbed panel (Tests|Hint|Review|AI)
│   ├── TestResults.tsx                 # Test execution results display
│   └── syntax/                         # Syntax Trainer components
│       ├── ExerciseEditor.tsx          # Monaco editor for exercises
│       ├── FeedbackPanel.tsx           # Exercise result + AI feedback
│       ├── LessonList.tsx              # Reference lesson grid
│       ├── LessonTrainer.tsx           # Interactive trainer with progress
│       ├── LessonView.tsx              # Static reference lesson view
│       ├── SyntaxPanel.tsx             # Main: Learn/Reference tabs, curriculum list
│       ├── SyntaxSnippet.tsx           # Code snippet with copy button
│       └── TrainerSection.tsx          # Single exercise: explain → example → try → check
│
├── lib/                                # Shared frontend utilities
│   ├── types.ts                        # All TypeScript type definitions
│   ├── problems.ts                     # Problem loader (100 problem imports)
│   ├── syntax.ts                       # Reference lesson loader
│   ├── trainer.ts                      # Trainer lesson loader (117 imports)
│   └── storage.ts                      # localStorage helpers
│
├── data/
│   ├── problems/                       # 100 problem JSON files
│   │   ├── two-sum.json
│   │   ├── reverse-string.json
│   │   ├── ... (100 files total)
│   │   └── find-median-from-data-stream.json
│   └── syntax/
│       ├── lessons/                    # 4 static reference lessons + index
│       │   ├── index.json
│       │   ├── arrays-loops.json
│       │   ├── hashmaps.json
│       │   ├── sorting.json
│       │   └── stacks-queues.json
│       ├── tag-lesson-map.json         # Problem tag → reference lesson mapping
│       └── trainer/                    # 117 interactive trainer lessons + curriculum
│           ├── curriculum.json         # 13 category definitions
│           ├── python-variables-types.json
│           ├── python-arrays-loops.json
│           ├── ... (13 files per language × 9 languages = 117 files)
│           └── rust-interview-templates.json
│
├── server/                             # Python FastAPI backend
│   ├── main.py                         # App entry point, 7 endpoints
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py                  # Pydantic request/response models
│   ├── services/
│   │   ├── judge0.py                   # Judge0 integration (9 languages)
│   │   ├── llm.py                      # LLM calls (hints, review, syntax, exercises)
│   │   └── prompts.py                  # System prompts and templates
│   └── utils/
│       └── chunking.py                 # Text chunking utility (future use)
│
├── docs/
│   └── SYNTAX_TAB_DESIGN.md           # Syntax tab design document
│
└── public/                             # Static assets (empty)
```

---

## Environment Variables

| Variable               | Required | Default                          | Description                                                |
|------------------------|----------|----------------------------------|------------------------------------------------------------|
| `NEXT_PUBLIC_APP_NAME` | No       | `InterviewCoach`                 | App display name                                           |
| `FASTAPI_BASE_URL`     | No       | `http://localhost:8000`          | FastAPI backend URL (used by Next.js API proxy)            |
| `OPENAI_API_KEY`       | Yes      | —                                | API key for OpenAI or compatible provider                  |
| `OPENAI_BASE_URL`      | No       | `https://api.openai.com/v1`     | LLM API base URL                                           |
| `OPENAI_MODEL`         | No       | `gpt-4.1-mini`                  | Model name for hints, reviews, syntax                      |
| `JUDGE0_URL`           | Yes      | —                                | Judge0 instance URL                                        |
| `X_RAPIDAPI_KEY`       | Yes*     | —                                | RapidAPI key (required for RapidAPI-hosted Judge0)         |
| `POSTGRES_USER`        | No       | `interviewcoach`                 | Postgres user (scaffolded)                                 |
| `POSTGRES_PASSWORD`    | No       | `changeme`                       | Postgres password (scaffolded)                             |
| `POSTGRES_DB`          | No       | `interviewcoach`                 | Postgres database (scaffolded)                             |
| `REDIS_URL`            | No       | `redis://localhost:6379`         | Redis URL (scaffolded)                                     |

---

## Frontend (Next.js)

### Pages and Layout

**`app/layout.tsx`** — Root layout with Inter font, `dark` theme class, and SEO metadata.

**`app/page.tsx`** — The main application shell. A client component managing three top-level views via `TopView` state:

### Top-Level Navigation

The header bar contains two navigation buttons: **Problems** and **Syntax**.

| View | Description |
|------|-------------|
| `problems` | Full-page problem browser with difficulty filters, topic filter tabs, and search. Click a problem to enter the workspace. |
| `syntax` | Full-page syntax trainer (Learn mode) and reference (Reference mode) with language selector and AI chat panel on the right. |
| `workspace` | 3-panel coding layout: Problem Panel (left, 340px) + Monaco Editor (center, flex) + Right Panel with Tests/Hint/Review/AI tabs (right, 380px). Shows when a problem is selected. |

### Components

**`ProblemsView.tsx`** — Problem browser with:
- Difficulty filter buttons: All (100), Easy (35), Medium (45), Hard (20)
- Topic filter tabs (horizontal scroll): All Topics, Array, String, Hash Table, DP, Sorting, Tree, Graph, Binary Search, Two Pointers, Sliding Window, Stack, Heap, Linked List, Backtracking, Matrix, Greedy, Math, Bit Manipulation, Recursion, BFS — each showing count
- Search input filtering by title or tags
- Problem list with numbered order, difficulty badges, and topic tags

**`ProblemPanel.tsx`** — Left panel: title, difficulty badge, tags, prompt, examples, constraints.

**`CodeEditor.tsx`** — Monaco Editor with language selector (Python, JS, TS, Java, C#, Go), vs-dark theme, JetBrains Mono font.

**`RightPanel.tsx`** — Tabbed container with 4 tabs:
- **Tests** — Execution results with pass/fail, stdout/stderr, timing
- **Hint** — Mode selector (Interviewer/Learning/Strict), hint level slider (1-5), progressive hints
- **Review** — AI code review with feedback, complexity, edge cases, improvements
- **AI** — AI Assistant chat panel in `problem` mode (coaches without spoilers)

**`AIChatPanel.tsx`** — Chat-style AI panel with:
- Dual mode: `mode="syntax"` (teaches freely) or `mode="problem"` (coaches without giving solutions)
- Context-aware: shows current section or problem title
- Quick action buttons: "Explain simpler", translate to other languages
- Chat message history with markdown rendering
- Clear button and auto-scroll

### Syntax Trainer Components

**`SyntaxPanel.tsx`** — Main panel with:
- Learn / Reference toggle
- Language selector (9 languages)
- Curriculum category list (13 categories) with exercise counts and "Coming soon" for languages without content

**`LessonTrainer.tsx`** — Interactive lesson: progress bar, collapsible sections, completion tracking, "lesson complete" trophy.

**`TrainerSection.tsx`** — Single exercise section: explanation, example code, editable exercise area, Check/Reset/Hint/Ask AI buttons, feedback display.

**`ExerciseEditor.tsx`** — Monaco editor configured for exercise code editing.

**`FeedbackPanel.tsx`** — Displays pass/fail status, per-check results, stdout/stderr, AI feedback.

**`LessonView.tsx`** — Static reference lesson with typed sections (concept, snippet, pattern, gotcha).

**`LessonList.tsx`** — Reference lesson grid with recommended lessons based on current problem tags.

**`SyntaxSnippet.tsx`** — Code block with language label and copy button.

### API Proxy Routes

All routes proxy from Next.js to FastAPI, structured identically:

| Route | Proxies To | Purpose |
|-------|-----------|---------|
| `POST /api/execute` | `/execute` | Run code against test cases |
| `POST /api/hint` | `/hint` | Get AI hint |
| `POST /api/review` | `/review` | Get AI code review |
| `POST /api/syntax/explain` | `/syntax/explain` | AI syntax explain / translate / ask |
| `POST /api/syntax/check` | `/syntax/check` | Exercise validation + AI feedback |

### Shared Libraries

**`lib/types.ts`** — All TypeScript interfaces:
- Problem types: `Problem`, `ProblemListItem`, `TestCase` (supports per-language stdin), `StarterCode`, `ProblemExample`
- Editor types: `Language`, `LANGUAGES`, `MONACO_LANGUAGE_MAP`, `HintMode`
- Response types: `ExecuteResponse`, `HintResponse`, `ReviewResponse`, `TestResult`
- Syntax types: `SyntaxLanguage` (9 languages), `SYNTAX_LANGUAGES`, `LessonSection`, `Lesson`, `SyntaxSnippets`
- Curriculum types: `CurriculumCategory`
- Trainer types: `TrainerLesson`, `TrainerSection`, `Exercise`, `ExerciseValidation`, `ExerciseCheckResult`
- Persistence: `Attempt`

**`lib/problems.ts`** — Statically imports all 100 problem JSON files. Exposes `getProblems()` and `getProblem(id)`.

**`lib/trainer.ts`** — Imports all 117 trainer lesson files and curriculum.json. Exposes:
- `getCurriculum()` — 13 ordered categories
- `getTrainerLessons(language)` — lessons for a language sorted by curriculum order
- `getTrainerLesson(id)` — specific lesson by ID
- `hasTrainerLesson(language, category)` — check if lesson exists
- `getTrainerLessonByCategory(language, category)` — find by language + category

**`lib/syntax.ts`** — Imports 4 reference lesson files. Exposes `getLessons()`, `getLesson(id)`, `getRecommendedLessonIds(tags)`.

**`lib/storage.ts`** — localStorage persistence under key `interviewcoach_attempts`: `saveAttempt()`, `getAttempts()`, `getAttempt()`.

### Styling

- **Dark theme**: `--background: #0f1117`, `--surface: #161821`
- **Tailwind** with `brand` color palette (blue range, 50-950)
- Custom scrollbar, prose overrides, range input styling

---

## Backend (FastAPI)

### Server Entry Point

**`server/main.py`** — FastAPI app with CORS (allow all), 7 endpoints. Loads `.env.local` and `.env` from project root. Caches all problem JSON files in memory.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{"status": "ok"}` |
| `GET` | `/problems` | List all 100 problems (id, title, difficulty, tags) |
| `GET` | `/problems/{id}` | Single problem (excludes hiddenTests, notesForAI) |
| `POST` | `/execute` | Run code via Judge0, per-language stdin support |
| `POST` | `/hint` | Generate AI hint (5 levels, 3 modes) |
| `POST` | `/review` | Generate AI code review (JSON response) |
| `POST` | `/syntax/explain` | AI syntax explanation with dual mode (syntax/problem) |
| `POST` | `/syntax/check` | Exercise validation: Judge0 execution + pattern checks + AI feedback |

### Pydantic Schemas

**Request models:**
- `ExecuteRequest` — `{problemId, language, code}`
- `HintRequest` — `{problemId, language, code, hintLevel (1-5), mode, history}`
- `ReviewRequest` — `{problemId, language, code, results}`
- `SyntaxExplainRequest` — `{lessonId, sectionId, language, snippet, action (explain|translate|ask), mode (syntax|problem), ...}`
- `ExerciseCheckRequest` — `{lessonId, sectionId, language, code, expectedOutput, requiredPatterns, ...}`

**Response models:**
- `ExecuteResponse` — `{passed, summary, tests[], hiddenTests[]}`
- `HintResponse` — `{hint}`
- `ReviewResponse` — `{feedback, complexity, edgeCases[], improvements[]}`
- `SyntaxExplainResponse` — `{explanation}`
- `ExerciseCheckResponse` — `{passed, stdout, stderr, checks[], aiFeedback}`

### Judge0 Code Execution Service

**9 supported languages:**

| Language   | Judge0 ID |
|------------|-----------|
| Python     | 71        |
| JavaScript | 63        |
| TypeScript | 74        |
| Java       | 62        |
| C#         | 51        |
| Go         | 60        |
| C          | 50        |
| C++        | 54        |
| Rust       | 73        |

Each language has a `DRIVER_TEMPLATE` that wraps user code with stdin reading/execution logic. Features retry with exponential backoff for 429 rate limits, batch submission with sequential fallback, and proper error propagation.

### LLM Service

**`server/services/llm.py`** — 4 LLM functions:
- `generate_hint()` — Problem hints with mode/level selection
- `generate_review()` — Code review returning structured JSON
- `generate_syntax_explanation()` — Dual-mode syntax AI (syntax tutor vs problem coach)
- `generate_exercise_feedback()` — Exercise review based on check results

### Prompt Templates

**`server/services/prompts.py`** — 9 prompt templates:
- `HINT_SYSTEM_PROMPT` + `HINT_INTERVIEWER_TEMPLATE` + `HINT_LEARNING_TEMPLATE` — Hint generation
- `REVIEW_SYSTEM_PROMPT` + `REVIEW_USER_TEMPLATE` — Code review
- `SYNTAX_SYSTEM_PROMPT` + `SYNTAX_EXPLAIN_TEMPLATE` + `SYNTAX_TRANSLATE_TEMPLATE` + `SYNTAX_ASK_TEMPLATE` — Syntax tutoring
- `PROBLEM_AI_SYSTEM_PROMPT` + `PROBLEM_AI_ASK_TEMPLATE` — Problem coaching (no spoilers)
- `SYNTAX_EXERCISE_REVIEW_TEMPLATE` — Exercise feedback

---

## Problem Data Format

100 problems in `data/problems/`, distributed as 35 Easy, 45 Medium, 20 Hard across 21 topic categories.

**Schema:**
```json
{
  "id": "two-sum",
  "title": "Two Sum",
  "difficulty": "Easy",
  "tags": ["arrays", "hashmap"],
  "prompt": "Problem description...",
  "examples": [{"input": "...", "output": "..."}],
  "constraints": ["2 <= nums.length <= 10^4"],
  "starterCode": {
    "python": "def solve(nums, target):\n    pass",
    "javascript": "function solve(nums, target) {\n  \n}",
    "typescript": "export function solve(...): ... {\n  \n}",
    "java": "class Solution { ... }",
    "csharp": "public class Solution { ... }",
    "go": "func solve(...) ... {\n    \n}"
  },
  "visibleTests": [
    {"stdin": {"python": "print(solve([2,7,11,15], 9))"}, "expectedStdout": "[0, 1]"}
  ],
  "hiddenTests": [
    {"stdin": {"python": "print(solve([3,3], 6))"}, "expectedStdout": "[0, 1]"}
  ],
  "notesForAI": {
    "coreIdea": "Use a hash map...",
    "commonBugs": ["Forgetting to sort", "Using same element twice"],
    "expectedComplexity": "O(n)"
  }
}
```

**Per-language test support:** `stdin` can be a string (backward-compatible) or `Record<string, string>` keyed by language. The backend reads `stdin[language]` with fallback to Python.

**Topic tags used:** arrays, strings, hash-table, dynamic-programming, sorting, tree, graph, binary-search, two-pointers, sliding-window, stack, heap, linked-list, backtracking, matrix, greedy, math, bit-manipulation, recursion, bfs, hashmap.

---

## Syntax Trainer System

### Curriculum

13 ordered categories defined in `data/syntax/trainer/curriculum.json`:

| Order | Category | Sections per lesson |
|-------|----------|-------------------|
| 1 | Variables & Types | 3-5 |
| 2 | Arrays & Loops | 3-5 |
| 3 | Strings | 4-5 |
| 4 | Functions | 3-5 |
| 5 | Hashmaps / Dictionaries | 4-5 |
| 6 | Sets | 3-4 |
| 7 | Sorting | 3-4 |
| 8 | Stacks & Queues | 4-5 |
| 9 | Heaps / Priority Queues | 3-4 |
| 10 | Recursion | 3-5 |
| 11 | Trees | 3-5 |
| 12 | Graphs | 3-5 |
| 13 | Interview Templates | 4-5 |

**9 supported languages:** Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust — 13 lessons each = 117 lesson files.

### Trainer Lesson Format

File naming: `{language}-{category}.json` in `data/syntax/trainer/`.

```json
{
  "id": "python-hashmaps",
  "title": "Hashmaps / Dictionaries",
  "description": "Master Python dictionaries...",
  "language": "python",
  "category": "hashmaps",
  "order": 5,
  "sections": [
    {
      "id": "creating",
      "title": "Creating dictionaries",
      "explanation": "Interview-focused explanation...",
      "example": "# Code example\nseen = {}\n...",
      "exercise": {
        "prompt": "Task description...",
        "starterCode": "# Code with blanks to fill\n...",
        "validation": [
          {"type": "output", "expected": "exact stdout", "message": "..."},
          {"type": "contains", "patterns": ["required_syntax"], "message": "..."}
        ],
        "testCode": "",
        "hint": "Short hint..."
      },
      "order": 1
    }
  ]
}
```

### Reference Lessons

4 static reference lessons in `data/syntax/lessons/` with per-language code snippets (Python, JavaScript, Java). Sections are typed as `concept`, `snippet`, `pattern`, or `gotcha`. These appear under the "Reference" tab in the Syntax view.

### Exercise Validation

The `/syntax/check` endpoint performs 3-layer validation:

1. **Output check** — Execute code via Judge0, compare stdout to expected output
2. **Pattern check** — Verify required syntax patterns exist in the user's code
3. **AI feedback** — Generate encouraging feedback based on check results

---

## User Flows

### Problem Solving Flow
1. Click **Problems** tab in the top nav
2. Filter by difficulty (Easy/Medium/Hard) and/or topic (Array, DP, Tree, etc.)
3. Click a problem to enter the coding workspace
4. Choose a language from the editor dropdown
5. Write solution in Monaco Editor (auto-saved to localStorage)
6. Click **Run** to execute against test cases
7. Click **Hint** for AI-guided hints at chosen mode and level
8. Click **Review** (after running) for AI code review
9. Click **AI** tab for free-form syntax questions (coaching mode, no spoilers)
10. Click **Back** to return to problem list

### Syntax Training Flow
1. Click **Syntax** tab in the top nav
2. Choose a language from the dropdown (9 options)
3. Select **Learn** or **Reference** mode
4. In Learn mode: click a curriculum category to start the interactive trainer
5. Read the explanation, study the example code
6. Fill in the exercise starter code
7. Click **Check** to validate (Judge0 execution + pattern checks + AI feedback)
8. Use **Hint** for a quick nudge, **Ask AI** for deeper help
9. Progress through sections; completion tracked with progress bar
10. Trophy celebration on lesson completion

---

## How Code Execution Works

1. Frontend POSTs `{problemId, language, code}` to `/api/execute`
2. Next.js proxies to FastAPI `/execute`
3. Backend wraps user code in a language-specific driver template via `build_submission_source()`
4. Reads per-language test stdin: `test["stdin"][language]` (fallback to Python or string format)
5. Submits to Judge0 in batch with 5s CPU limit, 128MB memory limit
6. Polls every 1-1.5s (up to 30 times) until completion
7. Compares actual stdout (trimmed) to expected stdout
8. Returns visible tests (full details) and hidden tests (pass/fail only)

---

## How the Hint System Works

3 modes with 5 progressive levels:

**Interviewer mode** (Socratic): Clarifying question → Point to pattern → Name the pattern → Pseudocode → Step-by-step walkthrough

**Learning mode** (Direct): Suggest edge cases → Name optimal approach → Pseudocode → Partial code → Detailed walkthrough

**Strict mode**: Returns fixed "no hints" message.

Conversation history (last 10 messages) is sent for progressive guidance.

---

## How AI Review Works

Requires running code first. Generates structured JSON response:
- **Feedback**: 2-3 sentence assessment
- **Complexity**: Time and space Big-O
- **Edge Cases**: 2-4 cases to consider
- **Improvements**: 2-4 actionable suggestions

Temperature: 0.4 for deterministic analysis. Falls back gracefully if JSON parsing fails.

---

## AI Behavior Modes

The AI Assistant has two distinct personalities:

| Mode | Used in | Behavior |
|------|---------|----------|
| `syntax` | Syntax tab AI panel | Teaches syntax freely with code examples. Explains, translates between languages, answers questions. |
| `problem` | Problems workspace AI tab | Coaches without spoilers. Never gives complete solutions. Teaches syntax patterns with generic 2-4 line examples. Points at approach without writing the answer. |

---

## Local Storage and Persistence

Key: `interviewcoach_attempts`. Array of `{problemId, language, code, timestamp}` objects. Auto-saved 1 second after last keystroke. Restored when switching problems or languages.

---

## Infrastructure (Docker Compose)

Scaffolded for future use (not required):
- **Postgres 16** (Alpine): port 5432, `interviewcoach` database
- **Redis 7** (Alpine): port 6379

---

## Setup and Running

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A Judge0 instance (RapidAPI or self-hosted)
- An OpenAI API key (or compatible provider)

### 1. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local: set JUDGE0_URL, X_RAPIDAPI_KEY, OPENAI_API_KEY
```

### 2. Start the Backend
```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## Using Alternative LLM Providers

Any OpenAI-compatible API works:

```env
# Claude
OPENAI_BASE_URL=https://api.anthropic.com/v1
OPENAI_API_KEY=sk-ant-...
OPENAI_MODEL=claude-sonnet-4-20250514

# Local model (Ollama, LM Studio, vLLM)
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=not-needed
OPENAI_MODEL=llama3
```

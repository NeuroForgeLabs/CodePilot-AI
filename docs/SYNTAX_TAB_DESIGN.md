# Syntax Tab — Feature Design Document

> AI Interview Coach: Interactive, AI-assisted syntax reference for coding interview fluency.

---

## Table of Contents

1. [Product Definition](#1-product-definition)
2. [MVP Scope](#2-mvp-scope)
3. [UX Structure](#3-ux-structure)
4. [Lesson System Design](#4-lesson-system-design)
5. [Data Model / Schema](#5-data-model--schema)
6. [AI Behavior Inside Syntax Tab](#6-ai-behavior-inside-syntax-tab)
7. [Integration with Existing Coding Challenge UI](#7-integration-with-existing-coding-challenge-ui)
8. [API Design](#8-api-design)
9. [Project Folder Structure Updates](#9-project-folder-structure-updates)
10. [Step-by-Step Implementation Plan](#10-step-by-step-implementation-plan)
11. [Example Content](#11-example-content)

---

## 1. Product Definition

### What it is

The Syntax tab is a **focused, interactive syntax reference** built specifically for coding interviews. It teaches the minimum language fluency a user needs to confidently implement algorithms and data structure solutions in their chosen language.

It lives as a fourth tab in the right panel alongside Tests, Hint, and Review — always one click away while solving a problem.

### Who it is for

- **Language switchers** — someone who knows Python but is interviewing in Java, and needs to quickly learn Java's HashMap, array syntax, and loop patterns.
- **Beginners starting interview prep** — they understand logic but freeze when they can't remember how to declare a priority queue or iterate a 2D matrix.
- **Rusty coders** — people returning to coding after a break who need a fast refresher on the exact syntax patterns used in interviews.

### What it is NOT

| In scope | Out of scope |
|----------|--------------|
| `dict[key] = value` syntax | OOP design patterns |
| `for i, val in enumerate(arr)` | Web frameworks |
| How to declare a min-heap | Database queries |
| BFS template with a queue | REST API design |
| Sorting with a custom comparator | File I/O, networking |
| Tree node class definition | Software architecture |

The boundary is simple: **if it doesn't show up in a whiteboard/online coding interview, it doesn't belong here.**

---

## 2. MVP Scope

### MVP (Phase 1) — Ship first, iterate later

| Feature | Details |
|---------|---------|
| **4 lesson modules** | Hashmaps, Arrays & Loops, Stacks & Queues, Sorting |
| **3 languages** | Python, JavaScript, Java |
| **Static lesson content** | JSON-defined lessons with code snippets per language |
| **Problem-aware recommendations** | Based on problem `tags`, surface relevant lessons (e.g., Two Sum → Hashmaps, Arrays) |
| **AI Explain button** | Send a snippet to the LLM with "explain this syntax simply in {language}" |
| **AI "Show me in {language}" button** | Translate a code snippet to another language |
| **AI Follow-up chat** | Free-form question about the current lesson or snippet |
| **Tab integration** | Fourth tab in the right panel: Tests | Hint | Review | **Syntax** |

### What MVP does NOT include

- Exercises with Judge0 execution (Phase 2)
- User progress tracking / completion state (Phase 2)
- C++, Go, Rust language support (Phase 2)
- AI that reads the user's editor code and suggests syntax lessons (Phase 2)

---

## 3. UX Structure

### 3.1 Tab Placement

The Syntax tab becomes the fourth tab in `RightPanel`:

```
┌─────────────────────────────────────────────────┐
│  Tests  │  Hint  │  Review  │  ✦ Syntax         │
├─────────────────────────────────────────────────┤
│                                                  │
│   (active tab content)                           │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 3.2 Syntax Tab Layout

When the Syntax tab is active, it renders a `SyntaxPanel` component with three sections stacked vertically:

```
┌──────────────────────────────────────────────┐
│ 🔤 SYNTAX                    [Python ▼]      │  ← language selector
├──────────────────────────────────────────────┤
│                                               │
│ ⚡ Recommended for "Two Sum"                  │  ← problem-aware section
│ ┌──────────────┐ ┌────────────────┐          │
│ │ 📖 Hashmaps  │ │ 📖 Arrays &    │          │
│ │              │ │    Loops       │          │
│ └──────────────┘ └────────────────┘          │
│                                               │
│ All Lessons                                   │  ← full lesson list
│ ┌──────────────┐ ┌────────────────┐          │
│ │ Hashmaps     │ │ Arrays & Loops │          │
│ │ Stacks &     │ │ Sorting        │          │
│ │ Queues       │ │ Strings        │          │
│ │ Recursion    │ │ Trees          │          │
│ │ Graphs       │ │ Heaps          │          │
│ └──────────────┘ └────────────────┘          │
│                                               │
└──────────────────────────────────────────────┘
```

### 3.3 Lesson View (after clicking a lesson)

```
┌──────────────────────────────────────────────┐
│ ← Back to lessons           [Python ▼]       │
├──────────────────────────────────────────────┤
│                                               │
│ 📖 Hashmaps / Dictionaries                    │
│                                               │
│ Section 1: Creating a hashmap                 │
│ ┌──────────────────────────────────────────┐ │
│ │ seen = {}                                │ │
│ │ seen = dict()                            │ │
│ │ counts = {"a": 1, "b": 2}               │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ Section 2: Adding and checking keys           │
│ ┌──────────────────────────────────────────┐ │
│ │ seen[key] = value                        │ │
│ │ if key in seen:                          │ │
│ │     return seen[key]                     │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ Section 3: Looping over a hashmap             │
│ ┌──────────────────────────────────────────┐ │
│ │ for key, val in seen.items():            │ │
│ │     print(key, val)                      │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ 📝 Interview Pattern: Two Sum Lookup          │
│ ┌──────────────────────────────────────────┐ │
│ │ seen = {}                                │ │
│ │ for i, num in enumerate(nums):           │ │
│ │     comp = target - num                  │ │
│ │     if comp in seen:                     │ │
│ │         return [seen[comp], i]           │ │
│ │     seen[num] = i                        │ │
│ └──────────────────────────────────────────┘ │
│                                               │
├──────────────────────────────────────────────┤
│ 🤖 AI Helper                                  │
│ ┌──────────────────────────────────────────┐ │
│ │ [Explain simpler] [Show in JavaScript]   │ │
│ │ [Ask a question... _______________] [Go] │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │ AI: In Python, `dict` is like a lookup   │ │
│ │ table. You store key→value pairs...      │ │
│ └──────────────────────────────────────────┘ │
│                                               │
└──────────────────────────────────────────────┘
```

### 3.4 Interaction Flows

**Quick actions (single click, no typing):**
- **"Explain simpler"** — AI re-explains the current section's code in plain English.
- **"Show in {language}"** — AI translates the current snippet into a different language. A small dropdown lets the user pick which language.

**Free-form (typing):**
- A text input at the bottom lets the user ask anything about the current lesson. The AI responds in context, knowing which lesson, section, language, and problem the user is looking at.

---

## 4. Lesson System Design

### 4.1 Lesson Categories and Sequence

Ordered from most frequently needed to least, matching the typical interview prep arc:

| # | Lesson ID | Title | Key concepts |
|---|-----------|-------|--------------|
| 1 | `hashmaps` | Hashmaps / Dictionaries | Create, insert, lookup, iterate, defaultdict, Counter |
| 2 | `arrays-loops` | Arrays & Loops | Declare, access, slice, for/while, enumerate, range, two-pointer iteration |
| 3 | `strings` | Strings | Iterate chars, substring, split/join, char codes, immutability |
| 4 | `sorting` | Sorting | Built-in sort, custom comparator, sort by key, partial sort |
| 5 | `stacks-queues` | Stacks & Queues | Stack via list/array, queue via deque/LinkedList, BFS template |
| 6 | `sets` | Sets | Create, add, membership check, intersection, union |
| 7 | `recursion` | Recursion Basics | Base case, recursive call, call stack, memoization pattern |
| 8 | `heaps` | Heaps / Priority Queues | Min-heap, max-heap, push, pop, top-K pattern |
| 9 | `trees` | Trees | TreeNode class, DFS (inorder/preorder/postorder), BFS level-order |
| 10 | `graphs` | Graphs | Adjacency list, DFS, BFS, visited set, connected components |
| 11 | `matrices` | Matrix Traversal | 2D array access, row/col iteration, 4-directional neighbors, BFS on grid |
| 12 | `templates` | Interview Templates | Sliding window, binary search, backtracking, two-pointer, prefix sum |

### 4.2 Section Types Within Each Lesson

Every lesson is composed of ordered sections. Each section has a type:

| Section type | Purpose |
|--------------|---------|
| `concept` | Brief explanation (1-3 sentences) of what this syntax does |
| `snippet` | Code example with per-language variants |
| `pattern` | A reusable interview pattern (e.g., "hashmap lookup", "BFS template") |
| `gotcha` | Common mistake or language-specific trap |
| `exercise` | (Phase 2) Small fill-in-the-blank or write-the-line challenge |

### 4.3 Problem-to-Lesson Mapping

Each problem's `tags` map directly to lesson IDs:

| Problem tag | Recommended lessons |
|-------------|-------------------|
| `arrays` | `arrays-loops`, `sorting` |
| `hashmap` | `hashmaps` |
| `strings` | `strings`, `arrays-loops` |
| `stack` | `stacks-queues` |
| `dynamic-programming` | `recursion`, `arrays-loops` |
| `binary-search` | `arrays-loops`, `templates` |
| `sliding-window` | `arrays-loops`, `hashmaps`, `templates` |
| `two-pointers` | `arrays-loops`, `templates` |
| `linked-list` | `trees`, `recursion` |
| `sorting` | `sorting` |
| `recursion` | `recursion` |
| `tree` | `trees`, `recursion` |
| `graph` | `graphs`, `stacks-queues` |
| `heap` | `heaps` |
| `matrix` | `matrices`, `graphs` |

This mapping lives in a static JSON file: `data/syntax/tag-lesson-map.json`.

---

## 5. Data Model / Schema

### 5.1 Lesson JSON (static, one file per lesson)

File: `data/syntax/lessons/{lesson-id}.json`

```json
{
  "id": "hashmaps",
  "title": "Hashmaps / Dictionaries",
  "description": "The most important data structure in coding interviews. Store key-value pairs for O(1) lookup.",
  "order": 1,
  "sections": [
    {
      "id": "creating",
      "title": "Creating a hashmap",
      "type": "concept",
      "explanation": "A hashmap stores key→value pairs. In interviews, you almost always use it to track seen values, count occurrences, or map one value to another.",
      "snippets": {
        "python": "seen = {}\ncounts = {\"a\": 1, \"b\": 2}\nfrom collections import defaultdict\nfreq = defaultdict(int)",
        "javascript": "const seen = {};\nconst seen2 = new Map();\nconst counts = {\"a\": 1, \"b\": 2};",
        "java": "Map<String, Integer> seen = new HashMap<>();\nseen.put(\"a\", 1);"
      }
    },
    {
      "id": "lookup",
      "title": "Insert and check keys",
      "type": "snippet",
      "explanation": "The core interview operation: check if a key exists, then insert.",
      "snippets": {
        "python": "seen[key] = value\n\nif key in seen:\n    return seen[key]",
        "javascript": "seen.set(key, value);\n\nif (seen.has(key)) {\n    return seen.get(key);\n}",
        "java": "seen.put(key, value);\n\nif (seen.containsKey(key)) {\n    return seen.get(key);\n}"
      }
    },
    {
      "id": "two-sum-pattern",
      "title": "Interview Pattern: Complement Lookup",
      "type": "pattern",
      "explanation": "The most common hashmap pattern: for each element, check if its complement exists. Used in Two Sum, pair problems, and frequency counting.",
      "snippets": {
        "python": "seen = {}\nfor i, num in enumerate(nums):\n    comp = target - num\n    if comp in seen:\n        return [seen[comp], i]\n    seen[num] = i",
        "javascript": "const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (seen.has(comp)) {\n        return [seen.get(comp), i];\n    }\n    seen.set(nums[i], i);\n}",
        "java": "Map<Integer, Integer> seen = new HashMap<>();\nfor (int i = 0; i < nums.length; i++) {\n    int comp = target - nums[i];\n    if (seen.containsKey(comp)) {\n        return new int[]{seen.get(comp), i};\n    }\n    seen.put(nums[i], i);\n}"
      }
    },
    {
      "id": "gotcha-mutable-keys",
      "title": "Gotcha: Mutable keys",
      "type": "gotcha",
      "explanation": "In Python, only immutable types (int, str, tuple) can be dict keys. Lists cannot. In Java, use the object's hashCode. In JS, Map keys can be any type but plain objects use string coercion.",
      "snippets": {
        "python": "# ✅ Works\nseen = {(1, 2): True}\n\n# ❌ TypeError: unhashable type: 'list'\nseen = {[1, 2]: True}",
        "javascript": "// Plain objects coerce keys to strings\nobj[{a: 1}] = true; // key becomes '[object Object]'\n\n// Use Map for non-string keys\nconst m = new Map();\nm.set([1, 2], true);",
        "java": "// Works — Integer is immutable and has hashCode\nMap<Integer, Boolean> seen = new HashMap<>();\n\n// Careful: mutable objects as keys cause bugs\n// if modified after insertion"
      }
    }
  ]
}
```

### 5.2 Tag-to-Lesson Mapping

File: `data/syntax/tag-lesson-map.json`

```json
{
  "arrays": ["arrays-loops", "sorting"],
  "hashmap": ["hashmaps"],
  "strings": ["strings", "arrays-loops"],
  "stack": ["stacks-queues"],
  "dynamic-programming": ["recursion", "arrays-loops"],
  "binary-search": ["arrays-loops", "templates"],
  "sliding-window": ["arrays-loops", "hashmaps", "templates"],
  "two-pointers": ["arrays-loops", "templates"],
  "linked-list": ["trees", "recursion"],
  "sorting": ["sorting"],
  "recursion": ["recursion"],
  "tree": ["trees", "recursion"],
  "graph": ["graphs", "stacks-queues"],
  "heap": ["heaps"],
  "matrix": ["matrices", "graphs"]
}
```

### 5.3 Lesson Index

File: `data/syntax/lessons/index.json`

```json
[
  {"id": "hashmaps", "title": "Hashmaps / Dictionaries", "order": 1},
  {"id": "arrays-loops", "title": "Arrays & Loops", "order": 2},
  {"id": "strings", "title": "Strings", "order": 3},
  {"id": "sorting", "title": "Sorting", "order": 4},
  {"id": "stacks-queues", "title": "Stacks & Queues", "order": 5},
  {"id": "sets", "title": "Sets", "order": 6},
  {"id": "recursion", "title": "Recursion Basics", "order": 7},
  {"id": "heaps", "title": "Heaps / Priority Queues", "order": 8},
  {"id": "trees", "title": "Trees", "order": 9},
  {"id": "graphs", "title": "Graphs", "order": 10},
  {"id": "matrices", "title": "Matrix Traversal", "order": 11},
  {"id": "templates", "title": "Interview Templates", "order": 12}
]
```

### 5.4 TypeScript Types (additions to `lib/types.ts`)

```typescript
export type SyntaxLanguage = "python" | "javascript" | "java" | "cpp" | "go" | "rust";

export const SYNTAX_LANGUAGES: { value: SyntaxLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export interface SyntaxSnippets {
  python?: string;
  javascript?: string;
  java?: string;
  cpp?: string;
  go?: string;
  rust?: string;
}

export interface LessonSection {
  id: string;
  title: string;
  type: "concept" | "snippet" | "pattern" | "gotcha" | "exercise";
  explanation: string;
  snippets: SyntaxSnippets;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: LessonSection[];
}

export interface LessonListItem {
  id: string;
  title: string;
  order: number;
}

export interface SyntaxExplainRequest {
  lessonId: string;
  sectionId: string;
  language: SyntaxLanguage;
  snippet: string;
  action: "explain" | "translate" | "ask";
  targetLanguage?: SyntaxLanguage;  // for "translate"
  question?: string;                // for "ask"
  problemId?: string;               // current problem context
}

export interface SyntaxExplainResponse {
  explanation: string;
}
```

### 5.5 Pydantic Schemas (additions to `server/models/schemas.py`)

```python
class SyntaxExplainRequest(BaseModel):
    lessonId: str
    sectionId: str
    language: str
    snippet: str
    action: Literal["explain", "translate", "ask"]
    targetLanguage: str | None = None
    question: str | None = None
    problemId: str | None = None

class SyntaxExplainResponse(BaseModel):
    explanation: str
```

---

## 6. AI Behavior Inside Syntax Tab

### 6.1 System Prompt

```
You are InterviewCoach Syntax Tutor, an expert at teaching programming language
syntax specifically for coding interviews and algorithm problems.

RULES:
- Explain syntax concisely. The user is not a total beginner — they understand
  programming concepts but need help with this language's specific syntax.
- Always use the user's selected language in examples.
- Relate everything back to coding interviews. Don't explain general programming.
- Use short, clear examples. Prefer 3-5 line snippets over long explanations.
- When comparing languages, show side-by-side with clear labels.
- If the user is working on a specific problem, tailor examples to that problem's
  domain (arrays, hashmaps, trees, etc.)

NEVER:
- Write complete solutions to interview problems
- Teach frameworks, ORMs, web APIs, or anything outside algorithm interviews
- Give long academic explanations. Be practical.
```

### 6.2 AI Actions

| Action | Trigger | What the AI does |
|--------|---------|------------------|
| **Explain** | User clicks "Explain simpler" | Takes the section's snippet + explanation, rewrites it in plain English at a beginner-friendly level. Adds a concrete analogy if helpful. |
| **Translate** | User clicks "Show in {lang}" | Takes the current snippet, translates to the target language. Highlights differences (e.g., "Python uses `in`, Java uses `containsKey()`"). |
| **Ask** | User types a free-form question | Answers in context of the current lesson, section, language, and (optionally) the problem they're solving. Limited to interview-relevant syntax. |

### 6.3 Context Passed to AI

Every AI call in the Syntax tab sends:

```json
{
  "lessonId": "hashmaps",
  "sectionId": "lookup",
  "language": "python",
  "snippet": "if key in seen:\n    return seen[key]",
  "action": "explain",
  "problemId": "two-sum"
}
```

The backend enriches this with:
- The lesson section's `explanation` field (so the AI has the original teaching context)
- If `problemId` is provided: the problem's `title`, `tags`, and `notesForAI.coreIdea`

### 6.4 Temperature Settings

| Action | Temperature | Reasoning |
|--------|-------------|-----------|
| Explain | 0.3 | Accuracy matters more than creativity |
| Translate | 0.2 | Code translation must be precise |
| Ask (free-form) | 0.5 | Allow some conversational flexibility |

---

## 7. Integration with Existing Coding Challenge UI

### 7.1 Touchpoints

| Existing feature | How Syntax connects |
|-----------------|---------------------|
| **Selected problem** | Problem's `tags` determine "Recommended" lessons at the top of the Syntax panel. |
| **Selected language** | Pre-selects the syntax language. If the user picks Python in the editor, the Syntax tab shows Python snippets by default. |
| **Current code in editor** | Phase 2: AI can analyze the editor code and suggest "You're using a list — check out the Arrays lesson." MVP does not read editor code. |
| **Failed tests** | Phase 2: If tests fail, suggest relevant syntax lessons (e.g., "Your dict lookup might have an issue — review Hashmaps > Insert and check keys"). |
| **Hint system** | Syntax tab is separate from Hints. Hints guide algorithmic thinking; Syntax teaches language mechanics. They complement each other. |

### 7.2 State Flow

The `page.tsx` orchestrator passes these props down to `SyntaxPanel`:

```typescript
// Already available in page.tsx
const problemTags = problem?.tags ?? [];
const selectedLanguage = language;  // "python", "javascript", etc.
const currentProblemId = selectedProblemId;

// Passed to RightPanel → SyntaxPanel
<SyntaxPanel
  problemTags={problemTags}
  problemId={currentProblemId}
  editorLanguage={selectedLanguage}
/>
```

### 7.3 Language Mapping

The editor uses `Language` type (`python | javascript | typescript | java | csharp | go`).
The Syntax tab uses `SyntaxLanguage` type (`python | javascript | java | cpp | go | rust`).

When the editor language changes, the Syntax tab auto-syncs to the closest match:

| Editor language | Syntax language |
|----------------|-----------------|
| `python` | `python` |
| `javascript` | `javascript` |
| `typescript` | `javascript` |
| `java` | `java` |
| `csharp` | `java` (closest available) |
| `go` | `go` |

---

## 8. API Design

### 8.1 Frontend API Routes (Next.js proxy)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/syntax/explain` | POST | AI explain / translate / ask |

Lessons and lesson data are loaded statically from JSON (no API route needed — same pattern as problems).

### 8.2 Backend Endpoints (FastAPI)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/syntax/lessons` | List all lessons (id, title, order) |
| `GET` | `/syntax/lessons/{lesson_id}` | Full lesson with all sections |
| `GET` | `/syntax/recommend/{problem_id}` | Recommended lesson IDs for a problem based on tags |
| `POST` | `/syntax/explain` | AI syntax explanation / translation / follow-up |

### 8.3 Request / Response Examples

**`POST /syntax/explain`** — Explain a snippet

```json
// Request
{
  "lessonId": "hashmaps",
  "sectionId": "lookup",
  "language": "python",
  "snippet": "if comp in seen:\n    return seen[comp]",
  "action": "explain",
  "problemId": "two-sum"
}

// Response
{
  "explanation": "This checks if the value `comp` exists as a **key** in the dictionary `seen`. In Python, `in` checks dict keys by default (not values). It's an O(1) operation.\n\nIn the Two Sum context: `comp` is `target - current_number`. If we've already seen a number that completes the pair, we found our answer."
}
```

**`POST /syntax/explain`** — Translate to another language

```json
// Request
{
  "lessonId": "hashmaps",
  "sectionId": "lookup",
  "language": "python",
  "snippet": "if comp in seen:\n    return seen[comp]",
  "action": "translate",
  "targetLanguage": "java"
}

// Response
{
  "explanation": "**Java equivalent:**\n```java\nif (seen.containsKey(comp)) {\n    return seen.get(comp);\n}\n```\n\n**Key differences:**\n- Python `in` → Java `containsKey()`\n- Python `seen[key]` → Java `seen.get(key)`\n- Java requires explicit types: `Map<Integer, Integer>`"
}
```

**`GET /syntax/recommend/two-sum`** — Get recommended lessons

```json
// Response
{
  "problemId": "two-sum",
  "lessons": ["hashmaps", "arrays-loops"]
}
```

---

## 9. Project Folder Structure Updates

```
InterviewCoach/
├── app/
│   └── api/
│       ├── execute/route.ts
│       ├── hint/route.ts
│       ├── review/route.ts
│       └── syntax/                       ← NEW
│           └── explain/route.ts          ← AI explain proxy
│
├── components/
│   ├── CodeEditor.tsx
│   ├── HintPanel.tsx
│   ├── ProblemPanel.tsx
│   ├── ProblemSelector.tsx
│   ├── ReviewPanel.tsx
│   ├── RightPanel.tsx                    ← MODIFIED (add Syntax tab)
│   ├── TestResults.tsx
│   └── syntax/                           ← NEW directory
│       ├── SyntaxPanel.tsx               ← Main syntax tab component
│       ├── LessonList.tsx                ← Lesson grid with recommendations
│       ├── LessonView.tsx                ← Single lesson with sections
│       ├── SyntaxSnippet.tsx             ← Code block with copy + translate
│       └── SyntaxAIHelper.tsx            ← AI explain/translate/ask UI
│
├── data/
│   ├── problems/                         (existing)
│   └── syntax/                           ← NEW directory
│       ├── tag-lesson-map.json           ← Problem tag → lesson mapping
│       └── lessons/
│           ├── index.json                ← Lesson list metadata
│           ├── hashmaps.json
│           ├── arrays-loops.json
│           ├── strings.json
│           ├── sorting.json
│           ├── stacks-queues.json
│           ├── sets.json
│           ├── recursion.json
│           ├── heaps.json
│           ├── trees.json
│           ├── graphs.json
│           ├── matrices.json
│           └── templates.json
│
├── lib/
│   ├── types.ts                          ← MODIFIED (add Syntax types)
│   ├── problems.ts
│   ├── storage.ts
│   └── syntax.ts                         ← NEW (lesson loader, recommender)
│
└── server/
    ├── main.py                           ← MODIFIED (add syntax endpoints)
    ├── models/
    │   └── schemas.py                    ← MODIFIED (add syntax schemas)
    └── services/
        ├── judge0.py
        ├── llm.py                        ← MODIFIED (add syntax AI function)
        └── prompts.py                    ← MODIFIED (add syntax prompts)
```

---

## 10. Step-by-Step Implementation Plan

### Phase 1 — MVP (target: ~3-4 days of work)

| Step | Task | Files |
|------|------|-------|
| **1.1** | Add Syntax types to `lib/types.ts` | `lib/types.ts` |
| **1.2** | Create lesson JSON files (start with 4: hashmaps, arrays-loops, stacks-queues, sorting) for 3 languages (Python, JS, Java) | `data/syntax/lessons/*.json`, `data/syntax/tag-lesson-map.json` |
| **1.3** | Create `lib/syntax.ts` — static loader functions: `getLessons()`, `getLesson(id)`, `getRecommendedLessons(tags)` | `lib/syntax.ts` |
| **1.4** | Build `SyntaxPanel.tsx` — lesson list view with language selector and recommended lessons | `components/syntax/SyntaxPanel.tsx` |
| **1.5** | Build `LessonList.tsx` — grid of lesson cards, recommended ones highlighted | `components/syntax/LessonList.tsx` |
| **1.6** | Build `LessonView.tsx` — renders sections with syntax-highlighted code blocks | `components/syntax/LessonView.tsx` |
| **1.7** | Build `SyntaxSnippet.tsx` — code block with copy button | `components/syntax/SyntaxSnippet.tsx` |
| **1.8** | Add "Syntax" tab to `RightPanel.tsx` | `components/RightPanel.tsx`, `app/page.tsx` |
| **1.9** | Add syntax AI prompt to `server/services/prompts.py` | `server/services/prompts.py` |
| **1.10** | Add `generate_syntax_explanation()` to `server/services/llm.py` | `server/services/llm.py` |
| **1.11** | Add Pydantic schemas for syntax requests | `server/models/schemas.py` |
| **1.12** | Add `/syntax/explain` endpoint to `server/main.py` | `server/main.py` |
| **1.13** | Add `/api/syntax/explain` proxy route | `app/api/syntax/explain/route.ts` |
| **1.14** | Build `SyntaxAIHelper.tsx` — explain / translate / ask UI | `components/syntax/SyntaxAIHelper.tsx` |
| **1.15** | Wire everything together, test end-to-end | All files |

### Phase 2 — Enhancements (after MVP ships)

| Feature | Description |
|---------|-------------|
| **More lessons** | Add remaining 8 lessons (sets, recursion, heaps, trees, graphs, matrices, templates, strings) |
| **More languages** | Add C++, Go, Rust snippets to all lessons |
| **Exercises** | Small interactive challenges per section (fill-in-the-blank, predict output) with Judge0 execution |
| **Progress tracking** | localStorage-based completion state per lesson/section |
| **Editor-aware AI** | "What syntax do I need?" button that reads the user's editor code and suggests relevant lessons |
| **Failed-test suggestions** | When tests fail, analyze stderr/output and recommend syntax lessons |
| **Search** | Search across all lessons and snippets |

---

## 11. Example Content

### 11.1 Python Dictionaries for Two Sum

**Lesson: `hashmaps.json`** (Python snippets only, abbreviated)

---

**Section: Creating a hashmap**

> A hashmap stores key→value pairs. In interviews, you almost always use it to track seen values, count occurrences, or map one value to another.

```python
# Empty dict
seen = {}

# Pre-filled
counts = {"a": 1, "b": 2}

# defaultdict — auto-initializes missing keys
from collections import defaultdict
freq = defaultdict(int)
freq["x"] += 1  # No KeyError, starts at 0
```

**Section: Insert and check keys**

> The core interview operation: check if a key exists, then insert.

```python
# Insert
seen[key] = value

# Check existence
if key in seen:
    return seen[key]

# Get with default (avoids KeyError)
val = seen.get(key, 0)

# Delete
del seen[key]
```

**Section: Looping over a hashmap**

```python
# Keys only
for key in seen:
    print(key)

# Keys and values
for key, val in seen.items():
    print(key, val)

# Just values
for val in seen.values():
    print(val)
```

**Section: Interview Pattern — Complement Lookup**

> The most common hashmap pattern in interviews. For each element, check if its complement exists. Used in Two Sum, pair sum, and target problems.

```python
seen = {}
for i, num in enumerate(nums):
    comp = target - num
    if comp in seen:
        return [seen[comp], i]
    seen[num] = i
```

**Section: Gotcha — Counter shortcut**

> When you need to count character or element frequencies, use `Counter` instead of building a dict manually.

```python
from collections import Counter

# Instead of this:
freq = {}
for ch in s:
    freq[ch] = freq.get(ch, 0) + 1

# Do this:
freq = Counter(s)
# freq["a"] → count of 'a'
```

---

### 11.2 JavaScript Arrays and Loops

**Lesson: `arrays-loops.json`** (JavaScript snippets only, abbreviated)

---

**Section: Declaring arrays**

```javascript
// Literal
const nums = [1, 2, 3, 4, 5];

// Fixed size (filled with 0)
const arr = new Array(n).fill(0);

// 2D array (m rows × n cols)
const grid = Array.from({length: m}, () => new Array(n).fill(0));
```

**Section: Accessing and modifying**

```javascript
const first = nums[0];
const last = nums[nums.length - 1];

nums.push(6);           // append to end
nums.pop();             // remove from end
nums.unshift(0);        // prepend (O(n))
nums.splice(i, 1);      // remove at index i
```

**Section: Looping patterns**

```javascript
// Standard for loop (use when you need the index)
for (let i = 0; i < nums.length; i++) {
    console.log(i, nums[i]);
}

// for...of (use when you only need the value)
for (const num of nums) {
    console.log(num);
}

// forEach with index
nums.forEach((num, i) => {
    console.log(i, num);
});

// While loop
let i = 0;
while (i < nums.length) {
    console.log(nums[i]);
    i++;
}
```

**Section: Slicing and copying**

```javascript
// Slice (does NOT modify original)
const sub = nums.slice(1, 4);    // [2, 3, 4]
const copy = nums.slice();       // shallow copy
const last3 = nums.slice(-3);    // last 3 elements

// Spread copy
const copy2 = [...nums];
```

**Section: Interview Pattern — Two-pointer iteration**

```javascript
let left = 0;
let right = nums.length - 1;

while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) {
        return [left, right];
    } else if (sum < target) {
        left++;
    } else {
        right--;
    }
}
```

---

### 11.3 BFS Queue Template in Python

**Lesson: `stacks-queues.json`** (Python snippets only, abbreviated)

---

**Section: Queue using deque**

> Python's `list.pop(0)` is O(n). Always use `collections.deque` for queue operations in interviews.

```python
from collections import deque

queue = deque()
queue.append(item)       # enqueue (right end)
front = queue.popleft()  # dequeue (left end)
len(queue)               # size
```

**Section: Interview Pattern — BFS on a graph**

> The standard BFS template. Memorize this — it appears in 30%+ of medium/hard problems.

```python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])

    while queue:
        node = queue.popleft()
        # process node here

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

**Section: Interview Pattern — BFS with level tracking**

> When you need to know the depth/level (e.g., shortest path, tree level-order traversal).

```python
from collections import deque

def bfs_levels(graph, start):
    visited = set([start])
    queue = deque([start])
    level = 0

    while queue:
        level_size = len(queue)  # nodes at this level
        for _ in range(level_size):
            node = queue.popleft()
            # process node at `level`

            for neighbor in graph[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        level += 1
```

**Section: Interview Pattern — BFS on a grid (matrix)**

> Same BFS but on a 2D grid. Used in "number of islands", "shortest path in maze", etc.

```python
from collections import deque

def bfs_grid(grid, start_row, start_col):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    visited.add((start_row, start_col))
    queue = deque([(start_row, start_col)])

    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    while queue:
        r, c = queue.popleft()
        # process (r, c)

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in visited:
                if grid[nr][nc] == 1:  # or whatever condition
                    visited.add((nr, nc))
                    queue.append((nr, nc))
```

**Section: Gotcha — DFS vs BFS choice**

> Use **BFS** when you need the shortest path or level-order. Use **DFS** when you need to explore all paths, detect cycles, or the problem is recursive in nature. In interviews, if the problem says "minimum" or "shortest", think BFS first.

---

*End of example content.*

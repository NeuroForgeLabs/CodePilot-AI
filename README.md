<p align="center">
  <h1 align="center">🎯 InterviewCoach</h1>
  <p align="center">
    <strong>AI-powered coding interview practice with multi-language execution and staged hints.</strong>
  </p>
  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api-endpoints">API</a> •
    <a href="#-tech-stack">Tech Stack</a>
  </p>
</p>

---

## ✨ Features

🧩 **10 Curated Problems** — Hand-picked challenges from Easy to Medium, covering arrays, hashmaps, dynamic programming, sliding window, stacks, and more.

🌐 **6 Programming Languages** — Write solutions in Python, JavaScript, TypeScript, Java, C#, or Go.

📝 **Monaco Editor** — The same editor powering VS Code, with syntax highlighting, bracket colorization, and font ligatures.

⚡ **Code Execution** — Run your code against visible and hidden test cases via Judge0, with real-time execution time and memory stats.

💡 **AI-Guided Hints** — Three modes to match your practice style:

| Mode | Style | Description |
|------|-------|-------------|
| 🔒 **Strict** | No hints | Pure interview simulation |
| 🎓 **Interviewer** | Socratic | Guiding questions that nudge without revealing |
| 📖 **Learning** | Direct | Pseudocode, partial snippets, and explanations |

Each mode supports **5 progressive hint levels** — from a subtle nudge to a detailed walkthrough.

🔍 **AI Code Review** — After running your code, get a senior-engineer-level debrief with:
- Overall feedback
- Time & space complexity analysis
- Edge cases to consider
- Actionable improvements

💾 **Auto-Save** — Your code is automatically saved to browser localStorage. Pick up right where you left off.

---

## 📸 How It Works

```
1️⃣  Pick a problem from the dropdown
2️⃣  Choose your language and write a solution
3️⃣  Hit Run ▶️ to execute against test cases
4️⃣  Stuck? Request a 💡 Hint at your comfort level
5️⃣  Get an AI 🔍 Review with complexity analysis & improvements
```

---

## 🚀 Quick Start

### 1️⃣ Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI or compatible provider API key |
| `OPENAI_BASE_URL` | ❌ | Default: `https://api.openai.com/v1` |
| `OPENAI_MODEL` | ❌ | Default: `gpt-4.1-mini` |
| `JUDGE0_URL` | ✅ | Judge0 instance URL |
| `JUDGE0_API_KEY` | ✅* | Required for RapidAPI-hosted Judge0 |

### 2️⃣ Start the Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3️⃣ Start the Frontend

```bash
npm install
npm run dev
```

Open 👉 [http://localhost:3000](http://localhost:3000)

### 4️⃣ (Optional) Start Infrastructure

```bash
docker compose up -d
```

> Starts Postgres & Redis — scaffolded for future features, not required for the current MVP.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser (localhost:3000)                    │
│                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐ │
│  │ 📋 Problem   │  │ 📝 Monaco     │  │ 📊 Results        │ │
│  │    Panel     │  │    Editor     │  │ 💡 Hints          │ │
│  │   (left)     │  │   (center)    │  │ 🔍 Review         │ │
│  └──────────────┘  └───────────────┘  └───────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
              POST /api/execute, /api/hint, /api/review
              (Next.js API routes — server-side proxy)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                FastAPI Backend (localhost:8000)               │
│                                                               │
│  ⚡ /execute  ──► Judge0 (code execution)                    │
│  💡 /hint     ──► OpenAI-compatible LLM                      │
│  🔍 /review   ──► OpenAI-compatible LLM                      │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Project Structure

```
InterviewCoach/
├── 🌐 app/                    Next.js App Router
│   ├── layout.tsx             Root layout (dark theme, Inter font)
│   ├── page.tsx               Main page & state orchestrator
│   └── api/                   Proxy routes → FastAPI
│       ├── execute/route.ts
│       ├── hint/route.ts
│       └── review/route.ts
├── 🧱 components/             React UI components
│   ├── CodeEditor.tsx         Monaco editor + language picker
│   ├── ProblemPanel.tsx       Problem description & examples
│   ├── ProblemSelector.tsx    Problem dropdown
│   ├── RightPanel.tsx         Tabbed panel (Tests/Hint/Review)
│   ├── TestResults.tsx        Execution results display
│   ├── HintPanel.tsx          Hint controls & display
│   └── ReviewPanel.tsx        AI review display
├── 📚 data/problems/          10 problem JSON definitions
├── 🔧 lib/                    Shared utilities
│   ├── types.ts               TypeScript interfaces
│   ├── problems.ts            Problem loader
│   └── storage.ts             localStorage helpers
├── 🐍 server/                 Python FastAPI backend
│   ├── main.py                Endpoints & CORS
│   ├── models/schemas.py      Pydantic models
│   └── services/
│       ├── judge0.py          Judge0 integration
│       ├── llm.py             LLM client
│       └── prompts.py         Prompt templates
└── 🐳 docker-compose.yml      Postgres + Redis (future)
```

---

## 🧩 Problems Included

| # | Problem | Difficulty | Tags |
|---|---------|------------|------|
| 1 | Two Sum | 🟢 Easy | `arrays` `hashmap` |
| 2 | Reverse String | 🟢 Easy | `strings` `two-pointers` |
| 3 | Valid Parentheses | 🟢 Easy | `stack` `strings` |
| 4 | Climbing Stairs | 🟢 Easy | `dynamic-programming` `recursion` |
| 5 | Binary Search | 🟢 Easy | `arrays` `binary-search` |
| 6 | Maximum Subarray | 🟡 Medium | `arrays` `dynamic-programming` |
| 7 | Merge Intervals | 🟡 Medium | `arrays` `sorting` |
| 8 | Longest Substring Without Repeating | 🟡 Medium | `strings` `sliding-window` `hashmap` |
| 9 | Product Except Self | 🟡 Medium | `arrays` |
| 10 | Linked List Cycle | 🟡 Medium | `linked-list` `two-pointers` |

---

## 📡 API Endpoints

### ⚡ `POST /execute`

Run code against test cases.

```json
// Request
{
  "problemId": "two-sum",
  "language": "python",
  "code": "def solve(nums, target):\n    ..."
}

// Response
{
  "passed": false,
  "summary": { "total": 4, "passed": 2, "failed": 2 },
  "tests": [{ "name": "visible-1", "passed": true, "..." }],
  "hiddenTests": [{ "name": "hidden-1", "passed": false, "..." }]
}
```

### 💡 `POST /hint`

Get an AI-guided hint.

```json
{
  "problemId": "two-sum",
  "language": "python",
  "code": "...",
  "hintLevel": 3,
  "mode": "interviewer",
  "history": []
}
```

### 🔍 `POST /review`

Get an AI code review.

```json
{
  "problemId": "two-sum",
  "language": "python",
  "code": "...",
  "results": { "summary": { "total": 4, "passed": 4, "failed": 0 } }
}
```

---

## 🔄 Using with Claude (or other providers)

The backend works with **any OpenAI-compatible API**. Just update your `.env.local`:

```env
# 🤖 Anthropic Claude
OPENAI_BASE_URL=https://api.anthropic.com/v1
OPENAI_API_KEY=sk-ant-...
OPENAI_MODEL=claude-sonnet-4-20250514

# 🏠 Local model (Ollama, LM Studio, vLLM)
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=not-needed
OPENAI_MODEL=llama3
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🌐 Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Monaco Editor |
| 🐍 Backend | Python FastAPI, Pydantic, Uvicorn |
| ⚡ Execution | Judge0 CE |
| 🤖 AI | OpenAI-compatible chat API (GPT, Claude, Llama, etc.) |
| 💾 Storage | Browser localStorage |
| 🐳 Infra | Docker Compose (Postgres + Redis scaffolded) |

---

## 📄 License

MIT

---

<p align="center">
  Built with ☕ and 🤖 — happy interviewing!
</p>

<p align="center">
  <h1 align="center">AI Interview Coach</h1>
  <p align="center">
    <strong>Open-source, AI-powered coding interview preparation platform with algorithm practice, interactive syntax training, and guided coaching.</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#contributing">Contributing</a>
  </p>
  <p align="center">
    Developed by <a href="https://www.linkedin.com/in/anvarbaltakhojayev/"><strong>Anvar Baltakhojayev</strong></a>
  </p>
</p>

---

## Features

**100 Curated Problems** — Challenges from Easy to Hard across 21 topic categories including arrays, trees, graphs, dynamic programming, backtracking, and more.

**9 Programming Languages** — Write and execute code in Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, and C#.

**Interactive Syntax Trainer** — 13 curriculum categories with ~500 hands-on exercises across all 9 languages. Learn data structure patterns and language syntax through guided practice with instant feedback.

**Monaco Editor** — The same editor powering VS Code, with syntax highlighting, bracket colorization, and font ligatures.

**Code Execution** — Run your code against visible and hidden test cases via Judge0, with real-time execution time and memory stats.

**AI-Guided Hints** — Three modes to match your practice style:

| Mode | Style | Description |
|------|-------|-------------|
| **Strict** | No hints | Pure interview simulation |
| **Interviewer** | Socratic | Guiding questions that nudge without revealing |
| **Learning** | Direct | Pseudocode, partial snippets, and explanations |

Each mode supports **5 progressive hint levels** — from a subtle nudge to a detailed walkthrough.

**AI Code Review** — After running your code, get a senior-engineer-level debrief with overall feedback, time and space complexity analysis, edge cases to consider, and actionable improvements.

**AI Mentor Chat** — Context-aware AI assistant with two personalities: coaching mode for problems (no spoilers) and tutoring mode for syntax (teaches freely with code examples).

**Auto-Save** — Your code is automatically saved to browser localStorage. Pick up right where you left off.

**Modern Landing Page** — Interactive homepage with animated hero, live code demo, mouse-parallax effects, and scroll-reveal animations.

---

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI or compatible provider API key |
| `OPENAI_BASE_URL` | No | Default: `https://api.openai.com/v1` |
| `OPENAI_MODEL` | No | Default: `gpt-4.1-mini` |
| `JUDGE0_URL` | Yes | Judge0 instance URL |
| `X_RAPIDAPI_KEY` | Yes* | Required for RapidAPI-hosted Judge0 |

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

Open [http://localhost:3000](http://localhost:3000)

### 4. (Optional) Start Infrastructure

```bash
docker compose up -d
```

> Starts Postgres & Redis — scaffolded for future features, not required for the current MVP.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Browser (localhost:3000)                        │
│                                                                    │
│  / ................ Landing page (overview, live demo, features)  │
│  /practice ........ Problem solving + Syntax trainer workspace   │
│  /contact ......... Contact page                                  │
│                                                                    │
│  ┌─ Practice: Problems View ──────────────────────────────────┐  │
│  │ 100 problems | Difficulty & topic filters | Search          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─ Practice: Workspace ──────────────────────────────────────┐  │
│  │ Problem Panel │ Monaco Editor │ Tests|Hint|Review|AI tabs   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─ Practice: Syntax Trainer ─────────────────────────────────┐  │
│  │ Learn|Reference │ 9 Languages │ 13 categories │ AI Chat     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  localStorage ◄── Auto-save code attempts (debounced 1s) ──►    │
└────────────────────────────┬───────────────────────────────────────┘
                             │
          POST /api/execute, /api/hint, /api/review,
          /api/syntax/explain, /api/syntax/check
          (Next.js API routes → FastAPI)
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (localhost:8000)                  │
│                                                                    │
│  POST /execute       ──► Judge0 (code execution, 9 languages)    │
│  POST /hint          ──► OpenAI-compatible LLM                    │
│  POST /review        ──► OpenAI-compatible LLM                    │
│  POST /syntax/explain ──► LLM (syntax explain / translate / ask) │
│  POST /syntax/check   ──► Judge0 + pattern checks + LLM feedback │
└──────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
InterviewCoach/
├── app/                          Next.js App Router
│   ├── layout.tsx                Root layout (Inter font, dark theme)
│   ├── page.tsx                  Landing / homepage
│   ├── practice/page.tsx         Practice workspace (Problems + Syntax)
│   ├── contact/page.tsx          Contact page
│   ├── globals.css               Global styles + animations
│   └── api/                      API proxy routes → FastAPI
│       ├── execute/route.ts
│       ├── hint/route.ts
│       ├── review/route.ts
│       └── syntax/
│           ├── explain/route.ts
│           └── check/route.ts
├── components/                   React UI components
│   ├── AIChatPanel.tsx           AI chat (dual mode: syntax/problem)
│   ├── CodeEditor.tsx            Monaco editor + language picker
│   ├── ProblemPanel.tsx          Problem description & examples
│   ├── ProblemsView.tsx          Problem browser with filters
│   ├── RightPanel.tsx            Tabbed panel (Tests/Hint/Review/AI)
│   ├── TestResults.tsx           Execution results display
│   ├── HintPanel.tsx             Hint controls & display
│   ├── ReviewPanel.tsx           AI review display
│   └── syntax/                   Syntax Trainer components
│       ├── SyntaxPanel.tsx       Main panel (Learn/Reference, language)
│       ├── LessonTrainer.tsx     Interactive trainer with progress
│       ├── TrainerSection.tsx    Exercise: explain → example → try → check
│       ├── ExerciseEditor.tsx    Monaco editor for exercises
│       ├── FeedbackPanel.tsx     Exercise result + AI feedback
│       ├── LessonView.tsx        Static reference lesson view
│       ├── LessonList.tsx        Reference lesson grid
│       └── SyntaxSnippet.tsx     Code snippet with copy button
├── data/
│   ├── problems/                 100 problem JSON definitions
│   └── syntax/
│       ├── lessons/              4 static reference lessons
│       └── trainer/              117 interactive trainer lessons
│           └── curriculum.json   13 category definitions
├── lib/                          Shared frontend utilities
│   ├── types.ts                  TypeScript type definitions
│   ├── problems.ts               Problem loader (100 problems)
│   ├── trainer.ts                Trainer lesson loader (117 lessons)
│   ├── syntax.ts                 Reference lesson loader
│   └── storage.ts                localStorage helpers
├── server/                       Python FastAPI backend
│   ├── main.py                   App entry point, 7 endpoints
│   ├── requirements.txt
│   ├── models/schemas.py         Pydantic request/response models
│   └── services/
│       ├── judge0.py             Judge0 integration (9 languages)
│       ├── llm.py                LLM client (hints, review, syntax)
│       └── prompts.py            Prompt templates
├── public/                       Static assets
│   └── favicon.svg               App favicon
└── docker-compose.yml            Postgres + Redis (scaffolded)
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, feature grid, live code demo, how it works, open source section |
| `/practice` | Practice | Full workspace: Problems list, Syntax trainer, coding workspace with AI tools |
| `/contact` | Contact | Contact cards for email, LinkedIn, and GitHub |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/execute` | Run code against test cases via Judge0 |
| `POST` | `/hint` | Generate AI hint (5 levels, 3 modes) |
| `POST` | `/review` | Generate AI code review (structured JSON) |
| `POST` | `/syntax/explain` | AI syntax explanation with dual mode |
| `POST` | `/syntax/check` | Exercise validation: Judge0 + pattern checks + AI feedback |
| `GET` | `/health` | Health check |
| `GET` | `/problems` | List all 100 problems |
| `GET` | `/problems/{id}` | Single problem details |

---

## Using with Claude or Other Providers

The backend works with **any OpenAI-compatible API**. Update your `.env.local`:

```env
# Anthropic Claude
OPENAI_BASE_URL=https://api.anthropic.com/v1
OPENAI_API_KEY=sk-ant-...
OPENAI_MODEL=claude-sonnet-4-20250514

# Local model (Ollama, LM Studio, vLLM)
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=not-needed
OPENAI_MODEL=llama3
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Monaco Editor |
| Backend | Python FastAPI, Pydantic, Uvicorn |
| Execution | Judge0 CE (9 languages) |
| AI | OpenAI-compatible chat API (GPT, Claude, Llama, etc.) |
| Storage | Browser localStorage |
| Infra | Docker Compose (Postgres + Redis scaffolded) |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT

---

<p align="center">
  Built by <a href="https://www.linkedin.com/in/anvarbaltakhojayev/">Anvar Baltakhojayev</a> — Full Stack AI Engineer
</p>

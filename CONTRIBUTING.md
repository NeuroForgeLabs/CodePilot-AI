# Contributing to AI Interview Coach

Thank you for your interest in contributing! This project is open source and community-driven. Whether you're fixing a bug, adding a new problem, improving the UI, or enhancing the AI — every contribution matters.

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/ai-interview-coach.git
   cd ai-interview-coach
   ```
3. **Set up the development environment** — follow the [Quick Start](README.md#quick-start) guide
4. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Judge0 instance (RapidAPI or self-hosted)
- An OpenAI API key (or any OpenAI-compatible provider)

### Running Locally

```bash
# Frontend
npm install
npm run dev

# Backend (in a separate terminal)
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend runs at `http://localhost:3000` and proxies API calls to the backend at `http://localhost:8000`.

---

## What You Can Contribute

### New Problems

Add a JSON file to `data/problems/`. Each problem needs:
- Unique ID matching the filename
- Title, difficulty (Easy/Medium/Hard), and topic tags
- Problem prompt with examples and constraints
- Starter code for all 6 editor languages (Python, JS, TS, Java, C#, Go)
- Visible and hidden test cases with per-language stdin support
- AI notes (core idea, common bugs, expected complexity)

Use any existing problem file as a template.

### New Syntax Trainer Lessons

Add a JSON file to `data/syntax/trainer/` following the naming convention `{language}-{category}.json`. Each lesson needs:
- 3-5 sections with explanations, code examples, and exercises
- Exercise validation rules (output matching and pattern checking)
- Optional hints

See `data/syntax/trainer/curriculum.json` for the 13 category definitions.

### UI Improvements

The frontend uses Next.js 14, React, Tailwind CSS, and Lucide icons. Key files:
- `app/page.tsx` — Landing page
- `app/practice/page.tsx` — Practice workspace
- `app/contact/page.tsx` — Contact page
- `app/globals.css` — Global styles and animations
- `components/` — All React components

### Backend Improvements

The backend uses Python FastAPI with Judge0 for code execution and OpenAI-compatible APIs for AI features. Key files:
- `server/main.py` — API endpoints
- `server/services/judge0.py` — Code execution
- `server/services/llm.py` — AI/LLM integration
- `server/services/prompts.py` — Prompt templates

### Bug Fixes

Check the [Issues](https://github.com/open-interview-ai/ai-interview-coach/issues) tab for open bugs. When submitting a fix, reference the issue number in your PR.

---

## Code Style

- **TypeScript** — Use strict types. Avoid `any`. Follow existing patterns.
- **React** — Functional components with hooks. No class components.
- **Tailwind CSS** — Use utility classes. Follow the existing dark theme (`#0f1117` background, `#161821` surface, `border-gray-800` borders, `brand-*` for blue accents).
- **Python** — Follow PEP 8. Use type hints. Pydantic models for request/response schemas.
- **No unnecessary dependencies** — Prefer built-in solutions. If you need a new package, explain why in the PR.

---

## Commit Messages

Use clear, concise commit messages that describe what changed and why:

```
feat: add binary tree zigzag traversal problem
fix: correct test case stdin for Java solutions
ui: improve code editor header with traffic light dots
docs: update README with new routing structure
```

---

## Pull Request Process

1. **Keep PRs focused** — One feature or fix per PR
2. **Test your changes** — Make sure the app builds (`npm run build`) and runs without errors
3. **Update documentation** — If your change affects the README or DOCUMENTATION.md, update them
4. **Write a clear PR description** — Explain what you changed, why, and how to test it
5. **Link related issues** — Reference any GitHub issues your PR addresses

---

## Project Structure at a Glance

```
app/              → Next.js pages and API routes
components/       → React UI components
data/problems/    → 100 algorithm problem definitions (JSON)
data/syntax/      → Syntax trainer lessons and curriculum (JSON)
lib/              → Shared TypeScript utilities and types
server/           → Python FastAPI backend
public/           → Static assets
```

---

## Contact

- **Email**: xadja35@gmail.com
- **LinkedIn**: [Anvar Baltakhojayev](https://www.linkedin.com/in/anvarbaltakhojayev/)
- **GitHub**: [Dante9988](https://github.com/Dante9988)

---

Thank you for helping make AI Interview Coach better for everyone!

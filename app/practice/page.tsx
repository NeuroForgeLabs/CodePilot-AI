"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import ProblemPanel from "@/components/ProblemPanel";
import ProblemsView from "@/components/ProblemsView";
import CodeEditor from "@/components/CodeEditor";
import RightPanel from "@/components/RightPanel";
import SyntaxPanel from "@/components/syntax/SyntaxPanel";
import AIChatPanel from "@/components/AIChatPanel";
import { getProblems, getProblem } from "@/lib/problems";
import { saveAttempt, getAttempt } from "@/lib/storage";
import type {
  Language,
  HintMode,
  ExecuteResponse,
  HintResponse,
  ReviewResponse,
  LessonSection,
  SyntaxLanguage,
} from "@/lib/types";
import { EDITOR_TO_SYNTAX_LANGUAGE } from "@/lib/types";
import {
  Play,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  ListChecks,
  Code2,
  ArrowLeft,
  Home,
  Mail,
} from "lucide-react";

type TopView = "problems" | "syntax" | "workspace";

const problems = getProblems();

export default function PracticePage() {
  const [topView, setTopView] = useState<TopView>("problems");
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id ?? "");
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"tests" | "hint" | "review" | "ai">("tests");

  const [executeResults, setExecuteResults] = useState<ExecuteResponse | null>(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);

  const [hintMode, setHintMode] = useState<HintMode>("interviewer");
  const [hintLevel, setHintLevel] = useState(1);
  const [hints, setHints] = useState<HintResponse[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [aiSection, setAiSection] = useState<LessonSection | null>(null);
  const [aiSyntaxLang, setAiSyntaxLang] = useState<SyntaxLanguage>(
    EDITOR_TO_SYNTAX_LANGUAGE[language]
  );

  const problem = getProblem(selectedProblemId);

  useEffect(() => {
    if (!problem) return;
    const saved = getAttempt(problem.id, language);
    if (saved) {
      setCode(saved.code);
    } else {
      const starter = problem.starterCode[language];
      setCode(starter || `// Write your ${language} solution here`);
    }
    setExecuteResults(null);
    setExecuteError(null);
    setHints([]);
    setHintError(null);
    setReview(null);
    setReviewError(null);
  }, [selectedProblemId, language, problem]);

  useEffect(() => {
    if (!problem) return;
    const timer = setTimeout(() => {
      saveAttempt(problem.id, language, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, problem, language]);

  useEffect(() => {
    setAiSyntaxLang(EDITOR_TO_SYNTAX_LANGUAGE[language]);
  }, [language]);

  const handleSelectProblem = useCallback((id: string) => {
    setSelectedProblemId(id);
    setTopView("workspace");
  }, []);

  const handleSectionFocus = useCallback((section: LessonSection | null, lang: SyntaxLanguage) => {
    setAiSection(section);
    setAiSyntaxLang(lang);
  }, []);

  const [trainerAIQuestion, setTrainerAIQuestion] = useState<string | null>(null);

  const handleTrainerAskAI = useCallback((context: { sectionTitle: string; code: string; exercisePrompt: string }) => {
    setAiSection(null);
    setTrainerAIQuestion(
      `I'm working on "${context.sectionTitle}".\n\nExercise: ${context.exercisePrompt}\n\nMy code:\n\`\`\`python\n${context.code}\n\`\`\`\n\nCan you help me understand what I need to do?`
    );
  }, []);

  const handleExecute = useCallback(async () => {
    if (!problem) return;
    setExecuteLoading(true);
    setExecuteError(null);
    setActiveTab("tests");
    try {
      const resp = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      const data = await resp.json();
      if (!resp.ok) setExecuteError(data.error || "Execution failed");
      else setExecuteResults(data);
    } catch (e) {
      setExecuteError(e instanceof Error ? e.message : "Failed to execute code");
    } finally {
      setExecuteLoading(false);
    }
  }, [problem, language, code]);

  const handleHint = useCallback(async () => {
    if (!problem || hintMode === "strict") return;
    setHintLoading(true);
    setHintError(null);
    setActiveTab("hint");
    const history = hints.flatMap((h, i) => [
      { role: "user" as const, content: `Give me a level ${i + 1} hint` },
      { role: "assistant" as const, content: h.hint },
    ]);
    try {
      const resp = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, code, hintLevel, mode: hintMode, history }),
      });
      const data = await resp.json();
      if (!resp.ok) setHintError(data.error || "Hint request failed");
      else setHints((prev) => [...prev, data]);
    } catch (e) {
      setHintError(e instanceof Error ? e.message : "Failed to get hint");
    } finally {
      setHintLoading(false);
    }
  }, [problem, language, code, hintLevel, hintMode, hints]);

  const handleReview = useCallback(async () => {
    if (!problem || !executeResults) return;
    setReviewLoading(true);
    setReviewError(null);
    setActiveTab("review");
    try {
      const resp = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, language, code, results: executeResults }),
      });
      const data = await resp.json();
      if (!resp.ok) setReviewError(data.error || "Review request failed");
      else setReview(data);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to get review");
    } finally {
      setReviewLoading(false);
    }
  }, [problem, language, code, executeResults]);

  const handleReset = useCallback(() => {
    if (!problem) return;
    setCode(problem.starterCode[language] || "");
    setExecuteResults(null);
    setExecuteError(null);
    setHints([]);
    setHintError(null);
    setReview(null);
    setReviewError(null);
  }, [problem, language]);

  const showAIPanel = topView === "syntax";

  return (
    <div className="flex h-screen flex-col bg-[#0f1117]">
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#161821] px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 mr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 text-white">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
                <line x1="14" y1="4" x2="10" y2="20" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              <span className="text-brand-400">AI Interview</span> Coach
            </h1>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <button
              onClick={() => setTopView("problems")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                topView === "problems"
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Problems
            </button>
            <button
              onClick={() => setTopView("syntax")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                topView === "syntax"
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Syntax
            </button>
            <span className="mx-1 h-4 w-px bg-gray-700" />
            <Link
              href="/contact"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact
            </Link>
          </nav>

          {topView === "workspace" && problem && (
            <div className="ml-2 flex items-center gap-2">
              <span className="text-gray-600">|</span>
              <button
                onClick={() => setTopView("problems")}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
              <span className="text-sm font-medium text-gray-200 truncate max-w-[250px]">
                {problem.title}
              </span>
            </div>
          )}
        </div>

        {topView === "workspace" && (
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 rounded-md border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button onClick={handleHint} disabled={hintLoading || hintMode === "strict"} className="flex items-center gap-1.5 rounded-md bg-amber-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Lightbulb className="h-3.5 w-3.5" />
              Hint
            </button>
            <button onClick={handleReview} disabled={reviewLoading || !executeResults} className="flex items-center gap-1.5 rounded-md bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <MessageSquare className="h-3.5 w-3.5" />
              Review
            </button>
            <button onClick={handleExecute} disabled={executeLoading} className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">
              <Play className="h-3.5 w-3.5" />
              Run
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {topView === "problems" && (
            <ProblemsView
              problems={problems}
              selectedId={selectedProblemId}
              onSelect={handleSelectProblem}
            />
          )}

          {topView === "syntax" && (
            <div className="h-full bg-[#161821]">
              <SyntaxPanel
                problemTags={problem?.tags ?? []}
                problemId={selectedProblemId}
                editorLanguage={language}
                onSectionFocus={handleSectionFocus}
                onAskAI={handleTrainerAskAI}
              />
            </div>
          )}

          {topView === "workspace" && problem && (
            <div className="flex h-full overflow-hidden">
              <div className="w-[340px] flex-shrink-0 border-r border-gray-800 bg-[#161821] overflow-hidden">
                <ProblemPanel problem={problem} />
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  language={language}
                  code={code}
                  onLanguageChange={setLanguage}
                  onCodeChange={setCode}
                />
              </div>
              <div className="w-[380px] flex-shrink-0 border-l border-gray-800 bg-[#161821] overflow-hidden">
                <RightPanel
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  executeResults={executeResults}
                  executeLoading={executeLoading}
                  executeError={executeError}
                  hintMode={hintMode}
                  hintLevel={hintLevel}
                  hints={hints}
                  hintLoading={hintLoading}
                  hintError={hintError}
                  onHintModeChange={setHintMode}
                  onHintLevelChange={setHintLevel}
                  onRequestHint={handleHint}
                  review={review}
                  reviewLoading={reviewLoading}
                  reviewError={reviewError}
                  onRequestReview={handleReview}
                  problemId={selectedProblemId}
                  problemTitle={problem?.title}
                  syntaxLanguage={aiSyntaxLang}
                />
              </div>
            </div>
          )}
        </div>

        {showAIPanel && (
          <div className="w-[300px] flex-shrink-0 border-l border-gray-800 overflow-hidden">
            <AIChatPanel
              syntaxSection={aiSection}
              syntaxLanguage={aiSyntaxLang}
              problemId={selectedProblemId}
              problemTitle={problem?.title}
              autoQuestion={trainerAIQuestion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

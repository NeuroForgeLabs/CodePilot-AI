"use client";

import { useState, useCallback, useEffect } from "react";
import ProblemSelector from "@/components/ProblemSelector";
import ProblemPanel from "@/components/ProblemPanel";
import CodeEditor from "@/components/CodeEditor";
import RightPanel from "@/components/RightPanel";
import { getProblems, getProblem } from "@/lib/problems";
import { saveAttempt, getAttempt } from "@/lib/storage";
import type {
  Language,
  HintMode,
  ExecuteResponse,
  HintResponse,
  ReviewResponse,
} from "@/lib/types";
import { Play, Lightbulb, MessageSquare, RotateCcw } from "lucide-react";

const problems = getProblems();

export default function Home() {
  const [selectedProblemId, setSelectedProblemId] = useState(
    problems[0]?.id ?? ""
  );
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"tests" | "hint" | "review">(
    "tests"
  );

  // Execute state
  const [executeResults, setExecuteResults] = useState<ExecuteResponse | null>(
    null
  );
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);

  // Hint state
  const [hintMode, setHintMode] = useState<HintMode>("interviewer");
  const [hintLevel, setHintLevel] = useState(1);
  const [hints, setHints] = useState<HintResponse[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Review state
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const problem = getProblem(selectedProblemId);

  // Load starter code or saved attempt when problem/language changes
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

  // Auto-save on code change (debounced)
  useEffect(() => {
    if (!problem) return;
    const timer = setTimeout(() => {
      saveAttempt(problem.id, language, code);
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, problem, language]);

  const handleExecute = useCallback(async () => {
    if (!problem) return;
    setExecuteLoading(true);
    setExecuteError(null);
    setActiveTab("tests");

    try {
      const resp = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setExecuteError(data.error || "Execution failed");
      } else {
        setExecuteResults(data);
      }
    } catch (e) {
      setExecuteError(
        e instanceof Error ? e.message : "Failed to execute code"
      );
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
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          hintLevel,
          mode: hintMode,
          history,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setHintError(data.error || "Hint request failed");
      } else {
        setHints((prev) => [...prev, data]);
      }
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
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          results: executeResults,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setReviewError(data.error || "Review request failed");
      } else {
        setReview(data);
      }
    } catch (e) {
      setReviewError(
        e instanceof Error ? e.message : "Failed to get review"
      );
    } finally {
      setReviewLoading(false);
    }
  }, [problem, language, code, executeResults]);

  const handleReset = useCallback(() => {
    if (!problem) return;
    const starter = problem.starterCode[language];
    setCode(starter || "");
    setExecuteResults(null);
    setExecuteError(null);
    setHints([]);
    setHintError(null);
    setReview(null);
    setReviewError(null);
  }, [problem, language]);

  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        No problems available.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0f1117]">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#161821] px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white tracking-tight">
            <span className="text-brand-400">Interview</span>Coach
          </h1>
          <ProblemSelector
            problems={problems}
            selected={selectedProblemId}
            onSelect={setSelectedProblemId}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={handleHint}
            disabled={hintLoading || hintMode === "strict"}
            className="flex items-center gap-1.5 rounded-md bg-amber-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Hint
          </button>
          <button
            onClick={handleReview}
            disabled={reviewLoading || !executeResults}
            className="flex items-center gap-1.5 rounded-md bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Review
          </button>
          <button
            onClick={handleExecute}
            disabled={executeLoading}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </button>
        </div>
      </header>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem description */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-800 bg-[#161821] overflow-hidden">
          <ProblemPanel problem={problem} />
        </div>

        {/* Center: Code editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            language={language}
            code={code}
            onLanguageChange={setLanguage}
            onCodeChange={setCode}
          />
        </div>

        {/* Right: Results/Hints/Review */}
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
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { TrainerSection as TrainerSectionType, ExerciseCheckResult } from "@/lib/types";
import SyntaxSnippet from "./SyntaxSnippet";
import ExerciseEditor from "./ExerciseEditor";
import FeedbackPanel from "./FeedbackPanel";
import { Play, Loader2, Lightbulb, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface TrainerSectionProps {
  section: TrainerSectionType;
  language: string;
  lessonId: string;
  isActive: boolean;
  isCompleted: boolean;
  onActivate: () => void;
  onComplete: () => void;
  onAskAI: (context: { sectionTitle: string; code: string; exercisePrompt: string }) => void;
}

export default function TrainerSectionComponent({
  section,
  language,
  lessonId,
  isActive,
  isCompleted,
  onActivate,
  onComplete,
  onAskAI,
}: TrainerSectionProps) {
  const [code, setCode] = useState(section.exercise.starterCode);
  const [result, setResult] = useState<ExerciseCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const resp = await fetch("/api/syntax/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          sectionId: section.id,
          language,
          code,
          expectedOutput: section.exercise.validation.find((v) => v.type === "output")?.expected || "",
          requiredPatterns: section.exercise.validation
            .filter((v) => v.type === "contains")
            .flatMap((v) => v.patterns || []),
          sectionTitle: section.title,
          exercisePrompt: section.exercise.prompt,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setResult({ passed: false, stdout: "", stderr: data.error || "Check failed", checks: [], aiFeedback: "" });
      } else {
        setResult(data);
        if (data.passed) onComplete();
      }
    } catch (e) {
      setResult({ passed: false, stdout: "", stderr: "Failed to reach server", checks: [], aiFeedback: "" });
    } finally {
      setChecking(false);
    }
  };

  const handleReset = () => {
    setCode(section.exercise.starterCode);
    setResult(null);
    setShowHint(false);
  };

  const stepNumber = section.order;

  return (
    <div className={`rounded-xl border transition-colors ${
      isCompleted
        ? "border-emerald-500/30 bg-emerald-500/5"
        : isActive
          ? "border-brand-500/30 bg-brand-500/5"
          : "border-gray-700/50 bg-gray-800/20"
    }`}>
      <button
        onClick={onActivate}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            isCompleted
              ? "bg-emerald-500 text-white"
              : isActive
                ? "bg-brand-500 text-white"
                : "bg-gray-700 text-gray-400"
          }`}>
            {isCompleted ? "✓" : stepNumber}
          </div>
          <span className={`text-sm font-medium ${isActive || isCompleted ? "text-gray-100" : "text-gray-400"}`}>
            {section.title}
          </span>
        </div>
        {isActive ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>

      {isActive && (
        <div className="border-t border-gray-700/50 px-5 py-5 space-y-5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {section.explanation}
          </p>

          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Example
            </div>
            <SyntaxSnippet code={section.example} language={language} />
          </div>

          <div className="border-t border-gray-700/30 pt-5">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Try it yourself
            </div>
            <p className="mb-3 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {section.exercise.prompt}
            </p>

            <ExerciseEditor
              code={code}
              language={language}
              onChange={setCode}
            />

            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleCheck}
                disabled={checking}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Check
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2 text-xs text-gray-300 hover:bg-gray-700 transition-all duration-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              {section.exercise.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-600/30 bg-amber-600/10 px-4 py-2 text-xs text-amber-400 hover:bg-amber-600/20 transition-all duration-200"
                >
                  <Lightbulb className="h-3 w-3" />
                  Hint
                </button>
              )}
              <button
                onClick={() => onAskAI({ sectionTitle: section.title, code, exercisePrompt: section.exercise.prompt })}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-xs text-brand-400 hover:bg-brand-500/20 transition-all duration-200"
              >
                Ask AI
              </button>
            </div>

            {showHint && section.exercise.hint && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 leading-relaxed">
                <Lightbulb className="inline h-3 w-3 mr-1.5" />
                {section.exercise.hint}
              </div>
            )}
          </div>

          {result && (
            <div className="border-t border-gray-700/30 pt-5">
              <FeedbackPanel result={result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

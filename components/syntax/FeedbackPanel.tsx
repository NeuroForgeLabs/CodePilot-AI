"use client";

import type { ExerciseCheckResult } from "@/lib/types";
import { CheckCircle2, XCircle, Sparkles, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface FeedbackPanelProps {
  result: ExerciseCheckResult;
}

export default function FeedbackPanel({ result }: FeedbackPanelProps) {
  return (
    <div className="space-y-3">
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
          result.passed
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}
      >
        {result.passed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        {result.passed ? "All checks passed!" : "Some checks failed"}
      </div>

      <div className="space-y-1.5">
        {result.checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
            )}
            <span className={check.passed ? "text-gray-300" : "text-red-300"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {(result.stdout || result.stderr) && (
        <div className="rounded-xl border border-gray-700 bg-[#0d0f15] overflow-hidden shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 border-b border-gray-800 px-3.5 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <Terminal className="ml-1 h-3 w-3 text-gray-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Output
            </span>
          </div>
          <pre className="px-4 py-3 text-xs leading-relaxed">
            {result.stdout && (
              <code className="text-gray-300">{result.stdout}</code>
            )}
            {result.stderr && (
              <code className="text-red-400 block mt-1">{result.stderr}</code>
            )}
          </pre>
        </div>
      )}

      {result.aiFeedback && (
        <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
            <Sparkles className="h-3 w-3" />
            AI Feedback
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-xs text-gray-300 leading-relaxed">
            <ReactMarkdown>{result.aiFeedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

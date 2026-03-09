"use client";

import { Problem } from "@/lib/types";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface ProblemPanelProps {
  problem: Problem;
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-5">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-gray-100">{problem.title}</h2>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              DIFFICULTY_COLORS[problem.difficulty]
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-500/10 border border-brand-500/20 px-2.5 py-0.5 text-[11px] text-brand-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
        {problem.prompt}
      </div>

      {problem.examples.length > 0 && (
        <div className="mb-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-200">Examples</h3>
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-700 bg-[#0d0f15] overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-gray-800 px-3.5 py-1.5">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" />
                  <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[10px] text-gray-600">Example {i + 1}</span>
              </div>
              <div className="px-4 py-3 text-sm font-mono space-y-1">
                <div>
                  <span className="text-gray-500">Input:  </span>
                  <code className="text-gray-200">{ex.input}</code>
                </div>
                <div>
                  <span className="text-gray-500">Output: </span>
                  <code className="text-emerald-400">{ex.output}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {problem.constraints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">
            Constraints
          </h3>
          <ul className="space-y-1 text-sm text-gray-400">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                <code className="text-gray-300">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

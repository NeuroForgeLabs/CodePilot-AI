"use client";

import { HintMode, HintResponse } from "@/lib/types";
import { Lightbulb, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MODE_OPTIONS: { value: HintMode; label: string; desc: string }[] = [
  {
    value: "interviewer",
    label: "Interviewer",
    desc: "Socratic hints, no direct code",
  },
  {
    value: "learning",
    label: "Learning",
    desc: "More direct, pseudocode OK",
  },
  { value: "strict", label: "Strict", desc: "No hints at all" },
];

interface HintPanelProps {
  mode: HintMode;
  hintLevel: number;
  hints: HintResponse[];
  loading: boolean;
  error: string | null;
  onModeChange: (mode: HintMode) => void;
  onHintLevelChange: (level: number) => void;
  onRequestHint: () => void;
}

export default function HintPanel({
  mode,
  hintLevel,
  hints,
  loading,
  error,
  onModeChange,
  onHintLevelChange,
  onRequestHint,
}: HintPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="space-y-3 border-b border-gray-700 p-4">
        {/* Mode selector */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
            Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onModeChange(opt.value)}
                className={`rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  mode === opt.value
                    ? "bg-brand-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "strict" && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Hints disabled in Strict mode
          </div>
        )}

        {/* Hint level */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
            Hint Level: {hintLevel}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={hintLevel}
            onChange={(e) => onHintLevelChange(Number(e.target.value))}
            className="w-full accent-brand-500"
            disabled={mode === "strict"}
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Subtle</span>
            <span>Direct</span>
          </div>
        </div>

        <button
          onClick={onRequestHint}
          disabled={loading || mode === "strict"}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4" />
          )}
          Get Hint
        </button>
      </div>

      {/* Hints display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {hints.length === 0 && !error && (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            Request a hint to get started
          </div>
        )}

        {hints.map((h, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-700 bg-gray-800/50 p-4"
          >
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
              Hint #{i + 1}
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
              <ReactMarkdown>{h.hint}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

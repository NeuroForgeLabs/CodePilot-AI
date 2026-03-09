"use client";

import { ExecuteResponse, HintMode, HintResponse, ReviewResponse } from "@/lib/types";
import TestResults from "./TestResults";
import HintPanel from "./HintPanel";
import ReviewPanel from "./ReviewPanel";
import { FlaskConical, Lightbulb, MessageSquare } from "lucide-react";

type Tab = "tests" | "hint" | "review";

const TABS: { key: Tab; label: string; icon: typeof FlaskConical }[] = [
  { key: "tests", label: "Tests", icon: FlaskConical },
  { key: "hint", label: "Hint", icon: Lightbulb },
  { key: "review", label: "Review", icon: MessageSquare },
];

interface RightPanelProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  executeResults: ExecuteResponse | null;
  executeLoading: boolean;
  executeError: string | null;
  hintMode: HintMode;
  hintLevel: number;
  hints: HintResponse[];
  hintLoading: boolean;
  hintError: string | null;
  onHintModeChange: (mode: HintMode) => void;
  onHintLevelChange: (level: number) => void;
  onRequestHint: () => void;
  review: ReviewResponse | null;
  reviewLoading: boolean;
  reviewError: string | null;
  onRequestReview: () => void;
}

export default function RightPanel({
  activeTab,
  onTabChange,
  executeResults,
  executeLoading,
  executeError,
  hintMode,
  hintLevel,
  hints,
  hintLoading,
  hintError,
  onHintModeChange,
  onHintLevelChange,
  onRequestHint,
  review,
  reviewLoading,
  reviewError,
  onRequestReview,
}: RightPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? "border-b-2 border-brand-500 text-brand-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "tests" && (
          <TestResults
            results={executeResults}
            loading={executeLoading}
            error={executeError}
          />
        )}
        {activeTab === "hint" && (
          <HintPanel
            mode={hintMode}
            hintLevel={hintLevel}
            hints={hints}
            loading={hintLoading}
            error={hintError}
            onModeChange={onHintModeChange}
            onHintLevelChange={onHintLevelChange}
            onRequestHint={onRequestHint}
          />
        )}
        {activeTab === "review" && (
          <ReviewPanel
            review={review}
            loading={reviewLoading}
            error={reviewError}
            onRequestReview={onRequestReview}
            hasResults={!!executeResults}
          />
        )}
      </div>
    </div>
  );
}

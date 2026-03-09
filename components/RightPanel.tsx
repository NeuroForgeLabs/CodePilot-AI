"use client";

import { ExecuteResponse, HintMode, HintResponse, ReviewResponse, SyntaxLanguage } from "@/lib/types";
import TestResults from "./TestResults";
import HintPanel from "./HintPanel";
import ReviewPanel from "./ReviewPanel";
import AIChatPanel from "./AIChatPanel";
import { FlaskConical, Lightbulb, MessageSquare, Sparkles } from "lucide-react";

type Tab = "tests" | "hint" | "review" | "ai";

const TABS: { key: Tab; label: string; icon: typeof FlaskConical }[] = [
  { key: "tests", label: "Tests", icon: FlaskConical },
  { key: "hint", label: "Hint", icon: Lightbulb },
  { key: "review", label: "Review", icon: MessageSquare },
  { key: "ai", label: "AI", icon: Sparkles },
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
  problemId: string;
  problemTitle?: string;
  syntaxLanguage: SyntaxLanguage;
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
  problemId,
  problemTitle,
  syntaxLanguage,
}: RightPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-800 bg-[#161821]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
              activeTab === key
                ? "border-b-2 border-brand-500 text-brand-400 bg-brand-500/5"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

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
        {activeTab === "ai" && (
          <AIChatPanel
            syntaxSection={null}
            syntaxLanguage={syntaxLanguage}
            problemId={problemId}
            problemTitle={problemTitle}
            mode="problem"
          />
        )}
      </div>
    </div>
  );
}

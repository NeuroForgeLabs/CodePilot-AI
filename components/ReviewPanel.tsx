"use client";

import { ReviewResponse } from "@/lib/types";
import {
  MessageSquare,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  Loader2,
} from "lucide-react";

interface ReviewPanelProps {
  review: ReviewResponse | null;
  loading: boolean;
  error: string | null;
  onRequestReview: () => void;
  hasResults: boolean;
}

export default function ReviewPanel({
  review,
  loading,
  error,
  onRequestReview,
  hasResults,
}: ReviewPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-700 p-4">
        <button
          onClick={onRequestReview}
          disabled={loading || !hasResults}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          Get AI Review
        </button>
        {!hasResults && (
          <p className="mt-2 text-xs text-gray-500 text-center">
            Run your code first to get a review
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!review && !error && (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            Run your code, then request a review
          </div>
        )}

        {review && (
          <div className="space-y-5">
            {/* Feedback */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
                <MessageSquare className="h-4 w-4 text-violet-400" />
                Feedback
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                {review.feedback}
              </p>
            </div>

            {/* Complexity */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
                <Clock className="h-4 w-4 text-brand-400" />
                Complexity
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3.5 text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Time</div>
                  <div className="text-sm font-mono font-bold text-brand-400">
                    {review.complexity.time}
                  </div>
                </div>
                <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-3.5 text-center">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Space</div>
                  <div className="text-sm font-mono font-bold text-brand-400">
                    {review.complexity.space}
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Cases */}
            {review.edgeCases.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Edge Cases
                </div>
                <ul className="space-y-1.5">
                  {review.edgeCases.map((ec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      {ec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {review.improvements.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                  Improvements
                </div>
                <ul className="space-y-1.5">
                  {review.improvements.map((imp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

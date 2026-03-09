"use client";

import type { LessonListItem } from "@/lib/types";
import { BookOpen, Sparkles } from "lucide-react";

interface LessonListProps {
  lessons: LessonListItem[];
  recommendedIds: string[];
  onSelect: (id: string) => void;
}

export default function LessonList({
  lessons,
  recommendedIds,
  onSelect,
}: LessonListProps) {
  const recommended = lessons.filter((l) => recommendedIds.includes(l.id));
  const rest = lessons.filter((l) => !recommendedIds.includes(l.id));

  return (
    <div className="space-y-5">
      {recommended.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Recommended for this problem
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recommended.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onSelect(lesson.id)}
                className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-left transition-colors hover:bg-amber-500/10"
              >
                <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                <span className="text-xs font-medium text-gray-200 leading-tight">
                  {lesson.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {recommended.length > 0 ? "All Lessons" : "Lessons"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(recommended.length > 0 ? rest : lessons).map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onSelect(lesson.id)}
              className="flex items-start gap-2 rounded-lg border border-gray-700 bg-gray-800/30 p-3 text-left transition-colors hover:bg-gray-700/50"
            >
              <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="text-xs font-medium text-gray-300 leading-tight">
                {lesson.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

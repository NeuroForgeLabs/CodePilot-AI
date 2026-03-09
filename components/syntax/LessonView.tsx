"use client";

import type { Lesson, LessonSection, SyntaxLanguage } from "@/lib/types";
import SyntaxSnippet from "./SyntaxSnippet";
import { ArrowLeft, BookOpen, Code2, Puzzle, AlertTriangle } from "lucide-react";

const SECTION_ICONS: Record<LessonSection["type"], typeof BookOpen> = {
  concept: BookOpen,
  snippet: Code2,
  pattern: Puzzle,
  gotcha: AlertTriangle,
};

const SECTION_COLORS: Record<LessonSection["type"], string> = {
  concept: "text-brand-400",
  snippet: "text-gray-400",
  pattern: "text-emerald-400",
  gotcha: "text-amber-400",
};

interface LessonViewProps {
  lesson: Lesson;
  language: SyntaxLanguage;
  onBack: () => void;
  onAskAI: (section: LessonSection) => void;
}

export default function LessonView({
  lesson,
  language,
  onBack,
  onAskAI,
}: LessonViewProps) {
  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors border-b border-gray-700 flex-shrink-0"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to lessons
      </button>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-100">{lesson.title}</h3>
          <p className="mt-1 text-xs text-gray-400 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {lesson.sections.map((section) => {
          const Icon = SECTION_ICONS[section.type];
          const iconColor = SECTION_COLORS[section.type];
          const snippet = section.snippets[language];

          return (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                  <h4 className="text-sm font-semibold text-gray-200">
                    {section.title}
                  </h4>
                </div>
                <button
                  onClick={() => onAskAI(section)}
                  className="text-[10px] font-medium text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Ask AI
                </button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                {section.explanation}
              </p>

              {snippet && (
                <SyntaxSnippet code={snippet} language={language} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

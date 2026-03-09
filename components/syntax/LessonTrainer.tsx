"use client";

import { useState } from "react";
import type { TrainerLesson } from "@/lib/types";
import TrainerSectionComponent from "./TrainerSection";
import { ArrowLeft, Trophy } from "lucide-react";

interface LessonTrainerProps {
  lesson: TrainerLesson;
  onBack: () => void;
  onAskAI: (context: { sectionTitle: string; code: string; exercisePrompt: string }) => void;
}

export default function LessonTrainer({
  lesson,
  onBack,
  onAskAI,
}: LessonTrainerProps) {
  const sorted = [...lesson.sections].sort((a, b) => a.order - b.order);
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleComplete = (sectionId: string) => {
    setCompleted((prev) => new Set(prev).add(sectionId));
    const currentIdx = sorted.findIndex((s) => s.id === sectionId);
    if (currentIdx < sorted.length - 1) {
      setTimeout(() => setActiveIdx(currentIdx + 1), 600);
    }
  };

  const allDone = completed.size === sorted.length;
  const progress = sorted.length > 0 ? Math.round((completed.size / sorted.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2.5 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium text-gray-500">
            {completed.size}/{sorted.length}
          </span>
          <div className="h-1.5 w-24 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="mb-2">
          <h3 className="text-base font-bold text-gray-100">{lesson.title}</h3>
          <p className="mt-1 text-xs text-gray-400 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {sorted.map((section, idx) => (
          <TrainerSectionComponent
            key={section.id}
            section={section}
            language={lesson.language}
            lessonId={lesson.id}
            isActive={activeIdx === idx}
            isCompleted={completed.has(section.id)}
            onActivate={() => setActiveIdx(idx)}
            onComplete={() => handleComplete(section.id)}
            onAskAI={onAskAI}
          />
        ))}

        {allDone && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-6">
            <Trophy className="h-8 w-8 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-400">
              Lesson complete!
            </p>
            <p className="text-xs text-gray-400">
              You've mastered {lesson.title} in Python.
            </p>
            <button
              onClick={onBack}
              className="mt-2 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              Choose next lesson
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import type { LessonSection, SyntaxLanguage } from "@/lib/types";
import { SYNTAX_LANGUAGES, EDITOR_TO_SYNTAX_LANGUAGE, type Language } from "@/lib/types";
import { getLessons, getLesson, getRecommendedLessonIds } from "@/lib/syntax";
import {
  getCurriculum,
  getTrainerLessons,
  getTrainerLesson,
  hasTrainerLesson,
  getTrainerLessonByCategory,
} from "@/lib/trainer";
import LessonList from "./LessonList";
import LessonView from "./LessonView";
import LessonTrainer from "./LessonTrainer";
import { GraduationCap, BookOpen, Lock, CheckCircle2 } from "lucide-react";

type SyntaxMode = "train" | "reference";

interface SyntaxPanelProps {
  problemTags: string[];
  problemId: string;
  editorLanguage: Language;
  onSectionFocus?: (section: LessonSection | null, language: SyntaxLanguage) => void;
  onAskAI?: (context: { sectionTitle: string; code: string; exercisePrompt: string }) => void;
}

export default function SyntaxPanel({
  problemTags,
  problemId,
  editorLanguage,
  onSectionFocus,
  onAskAI,
}: SyntaxPanelProps) {
  const [mode, setMode] = useState<SyntaxMode>("train");
  const [syntaxLang, setSyntaxLang] = useState<SyntaxLanguage>(
    EDITOR_TO_SYNTAX_LANGUAGE[editorLanguage]
  );
  const [selectedRefLessonId, setSelectedRefLessonId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);

  useEffect(() => {
    setSyntaxLang(EDITOR_TO_SYNTAX_LANGUAGE[editorLanguage]);
  }, [editorLanguage]);

  useEffect(() => {
    setSelectedRefLessonId(null);
    setSelectedTrainerId(null);
    onSectionFocus?.(null, syntaxLang);
  }, [problemId]);

  const refLessons = getLessons();
  const recommendedIds = getRecommendedLessonIds(problemTags);
  const selectedRefLesson = selectedRefLessonId ? getLesson(selectedRefLessonId) : null;

  const curriculum = getCurriculum();
  const trainerLessons = getTrainerLessons(syntaxLang);
  const trainerMap = new Map(trainerLessons.map((l) => [l.category, l]));
  const selectedTrainerLesson = selectedTrainerId ? getTrainerLesson(selectedTrainerId) : null;

  const handleLangChange = (lang: SyntaxLanguage) => {
    setSyntaxLang(lang);
    setSelectedRefLessonId(null);
    setSelectedTrainerId(null);
    onSectionFocus?.(null, lang);
  };

  const handleSelectCategory = (categoryId: string) => {
    const lesson = getTrainerLessonByCategory(syntaxLang, categoryId);
    if (lesson) {
      setSelectedTrainerId(lesson.id);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex gap-1 rounded-lg bg-gray-800/50 p-0.5">
          <button
            onClick={() => { setMode("train"); setSelectedRefLessonId(null); }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "train" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Learn
          </button>
          <button
            onClick={() => { setMode("reference"); setSelectedTrainerId(null); }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "reference" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Reference
          </button>
        </div>
        <select
          value={syntaxLang}
          onChange={(e) => handleLangChange(e.target.value as SyntaxLanguage)}
          className="rounded-md border border-gray-600 bg-gray-700 px-2.5 py-1 text-xs text-gray-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {SYNTAX_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-hidden">
        {mode === "train" && !selectedTrainerLesson && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-100">Syntax Trainer</h3>
              <p className="mt-1 text-xs text-gray-400">
                Master interview syntax step by step. Each lesson has explanations, examples, and exercises you run and check.
              </p>
              {trainerLessons.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="font-medium text-emerald-400">{trainerLessons.length}</span>
                  <span>of {curriculum.length} lessons available</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {curriculum.map((cat, idx) => {
                const lesson = trainerMap.get(cat.id);
                const available = !!lesson;

                return (
                  <button
                    key={cat.id}
                    onClick={() => available && handleSelectCategory(cat.id)}
                    disabled={!available}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      available
                        ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/50 hover:border-brand-500/30"
                        : "border-gray-800/30 bg-gray-800/10 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      available ? "bg-brand-500/20 text-brand-400" : "bg-gray-800 text-gray-600"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${available ? "text-gray-100" : "text-gray-500"}`}>
                        {cat.title}
                      </span>
                    </div>
                    {available ? (
                      <span className="text-[10px] text-gray-500">{lesson.sectionCount} exercises</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Lock className="h-3 w-3" />
                        Coming soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "train" && selectedTrainerLesson && (
          <LessonTrainer
            lesson={selectedTrainerLesson}
            onBack={() => setSelectedTrainerId(null)}
            onAskAI={onAskAI ?? (() => {})}
          />
        )}

        {mode === "reference" && !selectedRefLesson && (
          <div className="h-full overflow-y-auto p-4">
            <LessonList
              lessons={refLessons}
              recommendedIds={recommendedIds}
              onSelect={setSelectedRefLessonId}
            />
          </div>
        )}

        {mode === "reference" && selectedRefLesson && (
          <LessonView
            lesson={selectedRefLesson}
            language={syntaxLang}
            onBack={() => {
              setSelectedRefLessonId(null);
              onSectionFocus?.(null, syntaxLang);
            }}
            onAskAI={(section) => onSectionFocus?.(section, syntaxLang)}
          />
        )}
      </div>
    </div>
  );
}

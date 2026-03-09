"use client";

import { Language, LANGUAGES, MONACO_LANGUAGE_MAP } from "@/lib/types";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  language: Language;
  code: string;
  onLanguageChange: (lang: Language) => void;
  onCodeChange: (code: string) => void;
}

export default function CodeEditor({
  language,
  code,
  onLanguageChange,
  onCodeChange,
}: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col bg-[#0d0f15]">
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#161821] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Solution
          </span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language]}
          value={code}
          onChange={(val) => onCodeChange(val ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}

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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/50 px-4 py-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Solution
        </span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1.5 text-xs text-gray-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
            lineHeight: 21,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
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

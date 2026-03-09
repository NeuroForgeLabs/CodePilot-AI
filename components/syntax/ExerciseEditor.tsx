"use client";

import Editor from "@monaco-editor/react";

interface ExerciseEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  height?: string;
}

export default function ExerciseEditor({
  code,
  language,
  onChange,
  height = "260px",
}: ExerciseEditorProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-[#0d0f15] overflow-hidden shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-gray-800 px-3.5 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          {language}
        </span>
      </div>
      <Editor
        height={height}
        language={language}
        value={code}
        onChange={(val) => onChange(val ?? "")}
        theme="vs-dark"
        options={{
          fontSize: 13,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "on",
          automaticLayout: true,
          lineNumbers: "on",
          renderLineHighlight: "gutter",
          scrollbar: { vertical: "hidden", horizontal: "auto" },
          overviewRulerLanes: 0,
        }}
      />
    </div>
  );
}

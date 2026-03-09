"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface SyntaxSnippetProps {
  code: string;
  language: string;
}

export default function SyntaxSnippet({ code, language }: SyntaxSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative rounded-xl border border-gray-700 bg-[#0d0f15] overflow-hidden shadow-lg shadow-black/20">
      <div className="flex items-center justify-between border-b border-gray-800 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-6 text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

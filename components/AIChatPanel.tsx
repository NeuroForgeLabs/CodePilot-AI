"use client";

import { useState, useRef, useEffect } from "react";
import type { LessonSection, SyntaxLanguage, SyntaxExplainResponse } from "@/lib/types";
import { SYNTAX_LANGUAGES } from "@/lib/types";
import { Loader2, Sparkles, ArrowRightLeft, Send, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  syntaxSection: LessonSection | null;
  syntaxLanguage: SyntaxLanguage;
  problemId?: string;
  problemTitle?: string;
  autoQuestion?: string | null;
  mode?: "syntax" | "problem";
}

export default function AIChatPanel({
  syntaxSection,
  syntaxLanguage,
  problemId,
  problemTitle,
  autoQuestion,
  mode = "syntax",
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherLanguages = SYNTAX_LANGUAGES.filter((l) => l.value !== syntaxLanguage);
  const lastAutoRef = useRef<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (autoQuestion && autoQuestion !== lastAutoRef.current && !loading) {
      lastAutoRef.current = autoQuestion;
      callAI("ask", autoQuestion, undefined, autoQuestion);
    }
  }, [autoQuestion]);

  const callAI = async (
    action: "explain" | "translate" | "ask",
    userLabel: string,
    targetLang?: SyntaxLanguage,
    userQuestion?: string,
  ) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userLabel }]);

    const section = syntaxSection;
    try {
      const resp = await fetch("/api/syntax/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: section?.id || "general",
          sectionId: section?.id || "general",
          language: syntaxLanguage,
          snippet: section?.snippets[syntaxLanguage] || "",
          sectionTitle: section?.title || "",
          sectionExplanation: section?.explanation || "",
          action,
          targetLanguage: targetLang,
          question: userQuestion,
          problemId,
          mode,
        }),
      });

      const data: SyntaxExplainResponse = await resp.json();
      if (!resp.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "Something went wrong." }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.explanation }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: e instanceof Error ? e.message : "Failed to reach AI." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    callAI("ask", q, undefined, q);
  };

  const contextLabel = syntaxSection
    ? `Viewing: ${syntaxSection.title}`
    : problemTitle
      ? `Problem: ${problemTitle}`
      : null;

  return (
    <div className="flex h-full flex-col bg-[#161821]">
      <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI Assistant
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {contextLabel && (
        <div className="border-b border-gray-800 px-3 py-1.5 text-[10px] text-gray-500 truncate">
          {contextLabel}
        </div>
      )}

      {syntaxSection && (
        <div className="border-b border-gray-800 px-3 py-2 flex flex-wrap gap-1.5 flex-shrink-0">
          <button
            onClick={() => callAI("explain", `Explain "${syntaxSection.title}" simpler`)}
            disabled={loading}
            className="flex items-center gap-1 rounded-md bg-gray-700/80 px-2 py-1 text-[11px] font-medium text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-40"
          >
            <Sparkles className="h-3 w-3" />
            Explain simpler
          </button>
          {otherLanguages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => callAI("translate", `Show in ${lang.label}`, lang.value)}
              disabled={loading}
              className="flex items-center gap-1 rounded-md bg-gray-700/80 px-2 py-1 text-[11px] font-medium text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-40"
            >
              <ArrowRightLeft className="h-3 w-3" />
              {lang.label}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 px-4">
            <Sparkles className="h-6 w-6 mb-2 text-gray-600" />
            <p className="text-xs leading-relaxed">
              {syntaxSection
                ? `Click "Explain simpler" or ask a question about ${syntaxSection.title}.`
                : mode === "problem"
                  ? "Ask about syntax or approach — I'll guide you without giving the answer."
                  : "Ask anything about syntax, patterns, or the current problem."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600/20 text-brand-200 border border-brand-500/20"
                  : "bg-gray-800/80 text-gray-300 border border-gray-700/50"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none text-xs">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg bg-gray-800/80 border border-gray-700/50 px-3 py-2 text-xs text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 px-3 py-2.5 flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={syntaxSection ? `Ask about ${syntaxSection.title}...` : mode === "problem" ? "Ask for syntax help (no spoilers)..." : "Ask about syntax or this problem..."}
            className="flex-1 rounded-md border border-gray-600 bg-gray-800/50 px-2.5 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-md bg-brand-600 px-2.5 py-1.5 text-white hover:bg-brand-700 transition-colors disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

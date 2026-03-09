"use client";

import { ProblemListItem } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

interface ProblemSelectorProps {
  problems: ProblemListItem[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function ProblemSelector({
  problems,
  selected,
  onSelect,
}: ProblemSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = problems.find((p) => p.id === selected);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-700 transition-colors border border-gray-700"
      >
        <span className={DIFFICULTY_COLORS[current?.difficulty ?? "Easy"]}>
          {current?.difficulty}
        </span>
        <span className="truncate max-w-[200px]">{current?.title}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-700 bg-gray-800 shadow-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {problems.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelect(p.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-700 transition-colors ${
                  p.id === selected ? "bg-gray-700/50" : ""
                }`}
              >
                <span
                  className={`text-xs font-semibold w-14 ${DIFFICULTY_COLORS[p.difficulty]}`}
                >
                  {p.difficulty}
                </span>
                <span className="flex-1 text-gray-100">{p.title}</span>
                <div className="flex gap-1">
                  {p.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

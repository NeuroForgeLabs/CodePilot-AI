"use client";

import { useState, useMemo } from "react";
import type { ProblemListItem } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
type DiffFilter = (typeof DIFFICULTIES)[number];

const TOPIC_ORDER = [
  "All Topics",
  "arrays", "strings", "hash-table", "dynamic-programming", "sorting",
  "tree", "graph", "binary-search", "two-pointers", "sliding-window",
  "stack", "heap", "linked-list", "backtracking", "matrix",
  "greedy", "math", "bit-manipulation", "recursion", "bfs",
];

const TOPIC_LABELS: Record<string, string> = {
  "All Topics": "All Topics",
  "arrays": "Array",
  "strings": "String",
  "hash-table": "Hash Table",
  "dynamic-programming": "DP",
  "sorting": "Sorting",
  "tree": "Tree",
  "graph": "Graph",
  "binary-search": "Binary Search",
  "two-pointers": "Two Pointers",
  "sliding-window": "Sliding Window",
  "stack": "Stack",
  "heap": "Heap",
  "linked-list": "Linked List",
  "backtracking": "Backtracking",
  "matrix": "Matrix",
  "greedy": "Greedy",
  "math": "Math",
  "bit-manipulation": "Bit Manipulation",
  "recursion": "Recursion",
  "bfs": "BFS",
};

const DIFF_BADGE: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

const DIFF_DOT: Record<string, string> = {
  Easy: "bg-emerald-400",
  Medium: "bg-amber-400",
  Hard: "bg-red-400",
};

interface ProblemsViewProps {
  problems: ProblemListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ProblemsView({
  problems,
  selectedId,
  onSelect,
}: ProblemsViewProps) {
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("All");
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [search, setSearch] = useState("");

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problems) {
      for (const tag of p.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }, [problems]);

  const availableTopics = useMemo(() => {
    return TOPIC_ORDER.filter(
      (t) => t === "All Topics" || (topicCounts[t] && topicCounts[t] > 0)
    );
  }, [topicCounts]);

  const filtered = problems.filter((p) => {
    if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
    if (topicFilter !== "All Topics" && !p.tags.includes(topicFilter)) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const counts = {
    All: problems.length,
    Easy: problems.filter((p) => p.difficulty === "Easy").length,
    Medium: problems.filter((p) => p.difficulty === "Medium").length,
    Hard: problems.filter((p) => p.difficulty === "Hard").length,
  };

  return (
    <div className="flex h-full flex-col bg-[#0f1117]">
      <div className="border-b border-gray-800 bg-[#161821] px-6 py-5">
        <h2 className="text-xl font-bold text-gray-100 mb-1">Problems</h2>
        <p className="text-sm text-gray-400">
          {problems.length} problems across {Object.keys(topicCounts).length} topics. Select one to start coding.
        </p>
      </div>

      <div className="border-b border-gray-800 bg-[#161821] px-6 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  diffFilter === d
                    ? d === "All"
                      ? "bg-brand-600 text-white"
                      : d === "Easy"
                        ? "bg-emerald-600 text-white"
                        : d === "Medium"
                          ? "bg-amber-600 text-white"
                          : "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                }`}
              >
                {d} ({counts[d]})
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or tags..."
            className="ml-auto w-64 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {availableTopics.map((topic) => {
            const count = topic === "All Topics" ? problems.length : topicCounts[topic] || 0;
            const label = TOPIC_LABELS[topic] || topic;
            return (
              <button
                key={topic}
                onClick={() => setTopicFilter(topic)}
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  topicFilter === topic
                    ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                    : "bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {label}
                <span className="ml-1 text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-800/50">
          {filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex w-full items-center gap-4 px-6 py-3.5 text-left transition-colors hover:bg-gray-800/50 ${
                p.id === selectedId ? "bg-brand-500/5 border-l-2 border-l-brand-500" : ""
              }`}
            >
              <span className="w-6 text-center text-xs text-gray-500 font-mono">
                {i + 1}
              </span>

              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${DIFF_DOT[p.difficulty]}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-gray-100 truncate">
                    {p.title}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${DIFF_BADGE[p.difficulty]}`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500"
                    >
                      {TOPIC_LABELS[tag] || tag}
                    </span>
                  ))}
                </div>
              </div>

              {p.id === selectedId && (
                <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0" />
              )}
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500">
              No problems match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

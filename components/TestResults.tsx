"use client";

import { ExecuteResponse } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Loader2,
} from "lucide-react";

interface TestResultsProps {
  results: ExecuteResponse | null;
  loading: boolean;
  error: string | null;
}

export default function TestResults({
  results,
  loading,
  error,
}: TestResultsProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Running tests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 text-sm">
        Click <strong className="text-gray-400 mx-1">Run</strong> to execute
        your code against the test cases.
      </div>
    );
  }

  const { summary, tests, hiddenTests } = results;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Summary */}
      <div
        className={`flex items-center gap-4 border-b border-gray-700 px-4 py-3 ${
          results.passed
            ? "bg-emerald-500/5"
            : "bg-red-500/5"
        }`}
      >
        {results.passed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400" />
        )}
        <div>
          <span
            className={`text-sm font-semibold ${
              results.passed ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {results.passed ? "All Tests Passed" : "Some Tests Failed"}
          </span>
          <span className="ml-3 text-xs text-gray-400">
            {summary.passed}/{summary.total} passed
          </span>
        </div>
      </div>

      {/* Visible tests */}
      <div className="p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Visible Tests
        </h4>
        {tests.map((test, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${
              test.passed
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {test.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="font-medium text-gray-200">{test.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                {test.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {test.time}s
                  </span>
                )}
                {test.memory && (
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    {test.memory}KB
                  </span>
                )}
              </div>
            </div>
            {!test.passed && (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-400">Expected: </span>
                  <code className="text-emerald-400">
                    {test.expectedStdout}
                  </code>
                </div>
                <div>
                  <span className="text-gray-400">Got: </span>
                  <code className="text-red-400">
                    {test.stdout || "(empty)"}
                  </code>
                </div>
                {test.stderr && (
                  <div>
                    <span className="text-gray-400">Stderr: </span>
                    <code className="text-orange-400">{test.stderr}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hidden tests summary */}
      {hiddenTests.length > 0 && (
        <div className="border-t border-gray-700 p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Hidden Tests
          </h4>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-300">
              {hiddenTests.filter((t) => t.passed).length}/{hiddenTests.length}{" "}
              passed
            </span>
            <div className="flex gap-1">
              {hiddenTests.map((t, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    t.passed ? "bg-emerald-400" : "bg-red-400"
                  }`}
                  title={t.name}
                />
              ))}
            </div>
          </div>
          {hiddenTests.some((t) => !t.passed) && (
            <p className="text-xs text-gray-500">
              Some hidden tests failed. Consider edge cases in your solution.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

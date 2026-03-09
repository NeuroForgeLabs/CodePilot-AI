export interface ProblemExample {
  input: string;
  output: string;
}

export interface TestCase {
  stdin: string;
  expectedStdout: string;
}

export interface StarterCode {
  python: string;
  javascript: string;
  typescript: string;
  java: string;
  csharp: string;
  go: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  prompt: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: StarterCode;
  visibleTests: TestCase[];
}

export interface ProblemListItem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

export type Language = keyof StarterCode;

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
];

export const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  csharp: "csharp",
  go: "go",
};

export type HintMode = "strict" | "interviewer" | "learning";

export interface TestResult {
  name: string;
  passed: boolean;
  stdout: string;
  stderr: string;
  expectedStdout: string;
  time: string | null;
  memory: string | null;
}

export interface ExecuteResponse {
  passed: boolean;
  summary: { total: number; passed: number; failed: number };
  tests: TestResult[];
  hiddenTests: TestResult[];
  error?: string;
}

export interface HintResponse {
  hint: string;
  error?: string;
}

export interface ReviewResponse {
  feedback: string;
  complexity: { time: string; space: string };
  edgeCases: string[];
  improvements: string[];
  error?: string;
}

export interface Attempt {
  problemId: string;
  language: Language;
  code: string;
  timestamp: number;
}

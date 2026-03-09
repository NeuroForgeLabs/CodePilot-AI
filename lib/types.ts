export interface ProblemExample {
  input: string;
  output: string;
}

export interface TestCase {
  stdin: string | Record<string, string>;
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

// --- Syntax Tab ---

export type SyntaxLanguage =
  | "python" | "javascript" | "typescript" | "java"
  | "csharp" | "go" | "c" | "cpp" | "rust";

export const SYNTAX_LANGUAGES: { value: SyntaxLanguage; label: string }[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export const EDITOR_TO_SYNTAX_LANGUAGE: Record<Language, SyntaxLanguage> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  csharp: "csharp",
  go: "go",
};

export type SyntaxSnippets = Partial<Record<SyntaxLanguage, string>>;

export interface LessonSection {
  id: string;
  title: string;
  type: "concept" | "snippet" | "pattern" | "gotcha";
  explanation: string;
  snippets: SyntaxSnippets;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: LessonSection[];
}

export interface LessonListItem {
  id: string;
  title: string;
  order: number;
}

export interface SyntaxExplainResponse {
  explanation: string;
  error?: string;
}

// --- Curriculum ---

export interface CurriculumCategory {
  id: string;
  title: string;
  order: number;
}

// --- Interactive Syntax Trainer ---

export interface ExerciseValidation {
  type: "output" | "contains" | "regex";
  expected?: string;
  patterns?: string[];
  message?: string;
}

export interface Exercise {
  prompt: string;
  starterCode: string;
  validation: ExerciseValidation[];
  testCode: string;
  hint?: string;
}

export interface TrainerSection {
  id: string;
  title: string;
  explanation: string;
  example: string;
  exercise: Exercise;
  order: number;
}

export interface TrainerLesson {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  order: number;
  sections: TrainerSection[];
}

export interface TrainerLessonListItem {
  id: string;
  title: string;
  category: string;
  language: string;
  sectionCount: number;
  order: number;
}

export interface ExerciseCheckResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  checks: { label: string; passed: boolean }[];
  aiFeedback?: string;
  error?: string;
}

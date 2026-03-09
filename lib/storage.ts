import { Attempt, Language } from "./types";

const STORAGE_KEY = "interviewcoach_attempts";

export function saveAttempt(
  problemId: string,
  language: Language,
  code: string
): void {
  if (typeof window === "undefined") return;
  const attempts = getAttempts();
  const key = `${problemId}:${language}`;
  const existing = attempts.findIndex(
    (a) => a.problemId === problemId && a.language === language
  );
  const attempt: Attempt = { problemId, language, code, timestamp: Date.now() };

  if (existing >= 0) {
    attempts[existing] = attempt;
  } else {
    attempts.push(attempt);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // localStorage full or unavailable
  }
}

export function getAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAttempt(
  problemId: string,
  language: Language
): Attempt | null {
  const attempts = getAttempts();
  return (
    attempts.find(
      (a) => a.problemId === problemId && a.language === language
    ) ?? null
  );
}

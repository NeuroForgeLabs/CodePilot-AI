from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal


class ExecuteRequest(BaseModel):
    problemId: str
    language: str
    code: str


class TestResult(BaseModel):
    name: str
    passed: bool
    stdout: str = ""
    stderr: str = ""
    expectedStdout: str = ""
    time: str | None = None
    memory: str | None = None


class ExecuteSummary(BaseModel):
    total: int
    passed: int
    failed: int


class ExecuteResponse(BaseModel):
    passed: bool
    summary: ExecuteSummary
    tests: list[TestResult]
    hiddenTests: list[TestResult]


class HintRequest(BaseModel):
    problemId: str
    language: str
    code: str
    hintLevel: int = Field(ge=1, le=5)
    mode: Literal["strict", "interviewer", "learning"]
    history: list[dict] = Field(default_factory=list)


class HintResponse(BaseModel):
    hint: str


class ReviewRequest(BaseModel):
    problemId: str
    language: str
    code: str
    results: dict


class ComplexityInfo(BaseModel):
    time: str
    space: str


class ReviewResponse(BaseModel):
    feedback: str
    complexity: ComplexityInfo
    edgeCases: list[str]
    improvements: list[str]


class SyntaxExplainRequest(BaseModel):
    lessonId: str
    sectionId: str
    language: str
    snippet: str
    sectionTitle: str = ""
    sectionExplanation: str = ""
    action: Literal["explain", "translate", "ask"]
    targetLanguage: str | None = None
    question: str | None = None
    problemId: str | None = None
    mode: Literal["syntax", "problem"] = "syntax"


class SyntaxExplainResponse(BaseModel):
    explanation: str


class ExerciseCheckRequest(BaseModel):
    lessonId: str
    sectionId: str
    language: str
    code: str
    expectedOutput: str | None = None
    requiredPatterns: list[str] = Field(default_factory=list)
    sectionTitle: str = ""
    exercisePrompt: str = ""


class CheckDetail(BaseModel):
    label: str
    passed: bool


class ExerciseCheckResponse(BaseModel):
    passed: bool
    stdout: str = ""
    stderr: str = ""
    checks: list[CheckDetail]
    aiFeedback: str = ""

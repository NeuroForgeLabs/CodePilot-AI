"""
Chunking utilities for future use.
Split large code or conversation history into manageable chunks
for LLM context window management.
"""
from __future__ import annotations


def chunk_text(text: str, max_chars: int = 4000, overlap: int = 200) -> list[str]:
    if len(text) <= max_chars:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks

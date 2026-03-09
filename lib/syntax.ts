import type { Lesson, LessonListItem } from "./types";

import hashmaps from "@/data/syntax/lessons/hashmaps.json";
import arraysLoops from "@/data/syntax/lessons/arrays-loops.json";
import stacksQueues from "@/data/syntax/lessons/stacks-queues.json";
import sorting from "@/data/syntax/lessons/sorting.json";
import tagLessonMap from "@/data/syntax/tag-lesson-map.json";

const ALL_LESSONS: Lesson[] = [
  hashmaps,
  arraysLoops,
  stacksQueues,
  sorting,
] as unknown as Lesson[];

const TAG_MAP: Record<string, string[]> = tagLessonMap;

export function getLessons(): LessonListItem[] {
  return ALL_LESSONS
    .map(({ id, title, order }) => ({ id, title, order }))
    .sort((a, b) => a.order - b.order);
}

export function getLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getRecommendedLessonIds(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const lessons = TAG_MAP[tag] ?? [];
    for (const lessonId of lessons) {
      if (!seen.has(lessonId)) {
        seen.add(lessonId);
        result.push(lessonId);
      }
    }
  }

  return result;
}

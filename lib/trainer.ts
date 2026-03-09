import type { TrainerLesson, TrainerLessonListItem, CurriculumCategory } from "./types";

import curriculum from "@/data/syntax/trainer/curriculum.json";

// Python
import pythonVariablesTypes from "@/data/syntax/trainer/python-variables-types.json";
import pythonArraysLoops from "@/data/syntax/trainer/python-arrays-loops.json";
import pythonStrings from "@/data/syntax/trainer/python-strings.json";
import pythonFunctions from "@/data/syntax/trainer/python-functions.json";
import pythonHashmaps from "@/data/syntax/trainer/python-hashmaps.json";
import pythonSets from "@/data/syntax/trainer/python-sets.json";
import pythonSorting from "@/data/syntax/trainer/python-sorting.json";
import pythonStacksQueues from "@/data/syntax/trainer/python-stacks-queues.json";
import pythonHeaps from "@/data/syntax/trainer/python-heaps.json";
import pythonRecursion from "@/data/syntax/trainer/python-recursion.json";
import pythonTrees from "@/data/syntax/trainer/python-trees.json";
import pythonGraphs from "@/data/syntax/trainer/python-graphs.json";
import pythonInterviewTemplates from "@/data/syntax/trainer/python-interview-templates.json";

// JavaScript
import jsVariablesTypes from "@/data/syntax/trainer/javascript-variables-types.json";
import jsArraysLoops from "@/data/syntax/trainer/javascript-arrays-loops.json";
import jsStrings from "@/data/syntax/trainer/javascript-strings.json";
import jsFunctions from "@/data/syntax/trainer/javascript-functions.json";
import jsHashmaps from "@/data/syntax/trainer/javascript-hashmaps.json";
import jsSets from "@/data/syntax/trainer/javascript-sets.json";
import jsSorting from "@/data/syntax/trainer/javascript-sorting.json";
import jsStacksQueues from "@/data/syntax/trainer/javascript-stacks-queues.json";
import jsHeaps from "@/data/syntax/trainer/javascript-heaps.json";
import jsRecursion from "@/data/syntax/trainer/javascript-recursion.json";
import jsTrees from "@/data/syntax/trainer/javascript-trees.json";
import jsGraphs from "@/data/syntax/trainer/javascript-graphs.json";
import jsInterviewTemplates from "@/data/syntax/trainer/javascript-interview-templates.json";

// TypeScript
import tsVariablesTypes from "@/data/syntax/trainer/typescript-variables-types.json";
import tsArraysLoops from "@/data/syntax/trainer/typescript-arrays-loops.json";
import tsStrings from "@/data/syntax/trainer/typescript-strings.json";
import tsFunctions from "@/data/syntax/trainer/typescript-functions.json";
import tsHashmaps from "@/data/syntax/trainer/typescript-hashmaps.json";
import tsSets from "@/data/syntax/trainer/typescript-sets.json";
import tsSorting from "@/data/syntax/trainer/typescript-sorting.json";
import tsStacksQueues from "@/data/syntax/trainer/typescript-stacks-queues.json";
import tsHeaps from "@/data/syntax/trainer/typescript-heaps.json";
import tsRecursion from "@/data/syntax/trainer/typescript-recursion.json";
import tsTrees from "@/data/syntax/trainer/typescript-trees.json";
import tsGraphs from "@/data/syntax/trainer/typescript-graphs.json";
import tsInterviewTemplates from "@/data/syntax/trainer/typescript-interview-templates.json";

// Java
import javaVariablesTypes from "@/data/syntax/trainer/java-variables-types.json";
import javaArraysLoops from "@/data/syntax/trainer/java-arrays-loops.json";
import javaStrings from "@/data/syntax/trainer/java-strings.json";
import javaFunctions from "@/data/syntax/trainer/java-functions.json";
import javaHashmaps from "@/data/syntax/trainer/java-hashmaps.json";
import javaSets from "@/data/syntax/trainer/java-sets.json";
import javaSorting from "@/data/syntax/trainer/java-sorting.json";
import javaStacksQueues from "@/data/syntax/trainer/java-stacks-queues.json";
import javaHeaps from "@/data/syntax/trainer/java-heaps.json";
import javaRecursion from "@/data/syntax/trainer/java-recursion.json";
import javaTrees from "@/data/syntax/trainer/java-trees.json";
import javaGraphs from "@/data/syntax/trainer/java-graphs.json";
import javaInterviewTemplates from "@/data/syntax/trainer/java-interview-templates.json";

// C++
import cppVariablesTypes from "@/data/syntax/trainer/cpp-variables-types.json";
import cppArraysLoops from "@/data/syntax/trainer/cpp-arrays-loops.json";
import cppStrings from "@/data/syntax/trainer/cpp-strings.json";
import cppFunctions from "@/data/syntax/trainer/cpp-functions.json";
import cppHashmaps from "@/data/syntax/trainer/cpp-hashmaps.json";
import cppSets from "@/data/syntax/trainer/cpp-sets.json";
import cppSorting from "@/data/syntax/trainer/cpp-sorting.json";
import cppStacksQueues from "@/data/syntax/trainer/cpp-stacks-queues.json";
import cppHeaps from "@/data/syntax/trainer/cpp-heaps.json";
import cppRecursion from "@/data/syntax/trainer/cpp-recursion.json";
import cppTrees from "@/data/syntax/trainer/cpp-trees.json";
import cppGraphs from "@/data/syntax/trainer/cpp-graphs.json";
import cppInterviewTemplates from "@/data/syntax/trainer/cpp-interview-templates.json";

// C
import cVariablesTypes from "@/data/syntax/trainer/c-variables-types.json";
import cArraysLoops from "@/data/syntax/trainer/c-arrays-loops.json";
import cStrings from "@/data/syntax/trainer/c-strings.json";
import cFunctions from "@/data/syntax/trainer/c-functions.json";
import cHashmaps from "@/data/syntax/trainer/c-hashmaps.json";
import cSets from "@/data/syntax/trainer/c-sets.json";
import cSorting from "@/data/syntax/trainer/c-sorting.json";
import cStacksQueues from "@/data/syntax/trainer/c-stacks-queues.json";
import cHeaps from "@/data/syntax/trainer/c-heaps.json";
import cRecursion from "@/data/syntax/trainer/c-recursion.json";
import cTrees from "@/data/syntax/trainer/c-trees.json";
import cGraphs from "@/data/syntax/trainer/c-graphs.json";
import cInterviewTemplates from "@/data/syntax/trainer/c-interview-templates.json";

// C#
import csVariablesTypes from "@/data/syntax/trainer/csharp-variables-types.json";
import csArraysLoops from "@/data/syntax/trainer/csharp-arrays-loops.json";
import csStrings from "@/data/syntax/trainer/csharp-strings.json";
import csFunctions from "@/data/syntax/trainer/csharp-functions.json";
import csHashmaps from "@/data/syntax/trainer/csharp-hashmaps.json";
import csSets from "@/data/syntax/trainer/csharp-sets.json";
import csSorting from "@/data/syntax/trainer/csharp-sorting.json";
import csStacksQueues from "@/data/syntax/trainer/csharp-stacks-queues.json";
import csHeaps from "@/data/syntax/trainer/csharp-heaps.json";
import csRecursion from "@/data/syntax/trainer/csharp-recursion.json";
import csTrees from "@/data/syntax/trainer/csharp-trees.json";
import csGraphs from "@/data/syntax/trainer/csharp-graphs.json";
import csInterviewTemplates from "@/data/syntax/trainer/csharp-interview-templates.json";

// Go
import goVariablesTypes from "@/data/syntax/trainer/go-variables-types.json";
import goArraysLoops from "@/data/syntax/trainer/go-arrays-loops.json";
import goStrings from "@/data/syntax/trainer/go-strings.json";
import goFunctions from "@/data/syntax/trainer/go-functions.json";
import goHashmaps from "@/data/syntax/trainer/go-hashmaps.json";
import goSets from "@/data/syntax/trainer/go-sets.json";
import goSorting from "@/data/syntax/trainer/go-sorting.json";
import goStacksQueues from "@/data/syntax/trainer/go-stacks-queues.json";
import goHeaps from "@/data/syntax/trainer/go-heaps.json";
import goRecursion from "@/data/syntax/trainer/go-recursion.json";
import goTrees from "@/data/syntax/trainer/go-trees.json";
import goGraphs from "@/data/syntax/trainer/go-graphs.json";
import goInterviewTemplates from "@/data/syntax/trainer/go-interview-templates.json";

// Rust
import rustVariablesTypes from "@/data/syntax/trainer/rust-variables-types.json";
import rustArraysLoops from "@/data/syntax/trainer/rust-arrays-loops.json";
import rustStrings from "@/data/syntax/trainer/rust-strings.json";
import rustFunctions from "@/data/syntax/trainer/rust-functions.json";
import rustHashmaps from "@/data/syntax/trainer/rust-hashmaps.json";
import rustSets from "@/data/syntax/trainer/rust-sets.json";
import rustSorting from "@/data/syntax/trainer/rust-sorting.json";
import rustStacksQueues from "@/data/syntax/trainer/rust-stacks-queues.json";
import rustHeaps from "@/data/syntax/trainer/rust-heaps.json";
import rustRecursion from "@/data/syntax/trainer/rust-recursion.json";
import rustTrees from "@/data/syntax/trainer/rust-trees.json";
import rustGraphs from "@/data/syntax/trainer/rust-graphs.json";
import rustInterviewTemplates from "@/data/syntax/trainer/rust-interview-templates.json";

const ALL_TRAINER_LESSONS: TrainerLesson[] = [
  // Python
  pythonVariablesTypes, pythonArraysLoops, pythonStrings, pythonFunctions,
  pythonHashmaps, pythonSets, pythonSorting, pythonStacksQueues,
  pythonHeaps, pythonRecursion, pythonTrees, pythonGraphs, pythonInterviewTemplates,
  // JavaScript
  jsVariablesTypes, jsArraysLoops, jsStrings, jsFunctions,
  jsHashmaps, jsSets, jsSorting, jsStacksQueues,
  jsHeaps, jsRecursion, jsTrees, jsGraphs, jsInterviewTemplates,
  // TypeScript
  tsVariablesTypes, tsArraysLoops, tsStrings, tsFunctions,
  tsHashmaps, tsSets, tsSorting, tsStacksQueues,
  tsHeaps, tsRecursion, tsTrees, tsGraphs, tsInterviewTemplates,
  // Java
  javaVariablesTypes, javaArraysLoops, javaStrings, javaFunctions,
  javaHashmaps, javaSets, javaSorting, javaStacksQueues,
  javaHeaps, javaRecursion, javaTrees, javaGraphs, javaInterviewTemplates,
  // C++
  cppVariablesTypes, cppArraysLoops, cppStrings, cppFunctions,
  cppHashmaps, cppSets, cppSorting, cppStacksQueues,
  cppHeaps, cppRecursion, cppTrees, cppGraphs, cppInterviewTemplates,
  // C
  cVariablesTypes, cArraysLoops, cStrings, cFunctions,
  cHashmaps, cSets, cSorting, cStacksQueues,
  cHeaps, cRecursion, cTrees, cGraphs, cInterviewTemplates,
  // C#
  csVariablesTypes, csArraysLoops, csStrings, csFunctions,
  csHashmaps, csSets, csSorting, csStacksQueues,
  csHeaps, csRecursion, csTrees, csGraphs, csInterviewTemplates,
  // Go
  goVariablesTypes, goArraysLoops, goStrings, goFunctions,
  goHashmaps, goSets, goSorting, goStacksQueues,
  goHeaps, goRecursion, goTrees, goGraphs, goInterviewTemplates,
  // Rust
  rustVariablesTypes, rustArraysLoops, rustStrings, rustFunctions,
  rustHashmaps, rustSets, rustSorting, rustStacksQueues,
  rustHeaps, rustRecursion, rustTrees, rustGraphs, rustInterviewTemplates,
] as unknown as TrainerLesson[];

const CURRICULUM: CurriculumCategory[] = curriculum as CurriculumCategory[];

const categoryOrder = new Map(CURRICULUM.map((c) => [c.id, c.order]));

export function getCurriculum(): CurriculumCategory[] {
  return CURRICULUM;
}

export function getTrainerLessons(language?: string): TrainerLessonListItem[] {
  return ALL_TRAINER_LESSONS
    .filter((l) => !language || l.language === language)
    .map(({ id, title, category, language: lang, sections, order }) => ({
      id,
      title,
      category,
      language: lang,
      sectionCount: sections.length,
      order: categoryOrder.get(category) ?? order,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getTrainerLesson(id: string): TrainerLesson | undefined {
  return ALL_TRAINER_LESSONS.find((l) => l.id === id);
}

export function hasTrainerLesson(language: string, category: string): boolean {
  return ALL_TRAINER_LESSONS.some(
    (l) => l.language === language && l.category === category
  );
}

export function getTrainerLessonByCategory(
  language: string,
  category: string
): TrainerLesson | undefined {
  return ALL_TRAINER_LESSONS.find(
    (l) => l.language === language && l.category === category
  );
}

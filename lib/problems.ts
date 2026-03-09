import { Problem, ProblemListItem } from "./types";

import twoSum from "@/data/problems/two-sum.json";
import reverseString from "@/data/problems/reverse-string.json";
import validParentheses from "@/data/problems/valid-parentheses.json";
import maximumSubarray from "@/data/problems/maximum-subarray.json";
import mergeIntervals from "@/data/problems/merge-intervals.json";
import climbingStairs from "@/data/problems/climbing-stairs.json";
import binarySearch from "@/data/problems/binary-search.json";
import longestSubstring from "@/data/problems/longest-substring-without-repeating.json";
import productExceptSelf from "@/data/problems/product-except-self.json";
import linkedListCycle from "@/data/problems/linked-list-cycle.json";

const ALL_PROBLEMS: Problem[] = [
  twoSum,
  reverseString,
  validParentheses,
  climbingStairs,
  binarySearch,
  maximumSubarray,
  mergeIntervals,
  longestSubstring,
  productExceptSelf,
  linkedListCycle,
] as unknown as Problem[];

export function getProblems(): ProblemListItem[] {
  return ALL_PROBLEMS.map(({ id, title, difficulty, tags }) => ({
    id,
    title,
    difficulty,
    tags,
  }));
}

export function getProblem(id: string): Problem | undefined {
  return ALL_PROBLEMS.find((p) => p.id === id);
}

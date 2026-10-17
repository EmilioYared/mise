import type { Priority } from "./types";

export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const DEFAULT_PRIORITY: Priority = "medium";

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Tasks saved before priorities existed have none: treat them as Medium. */
export function normalizePriority(value: unknown): Priority {
  return PRIORITIES.includes(value as Priority)
    ? (value as Priority)
    : DEFAULT_PRIORITY;
}

/** Sorts High before Medium before Low. */
export function byPriority(
  a: { priority: Priority },
  b: { priority: Priority },
) {
  return RANK[a.priority] - RANK[b.priority];
}

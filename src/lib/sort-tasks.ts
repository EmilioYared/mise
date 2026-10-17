import { byPriority } from "./priority";
import type { Task } from "./types";

export type SortMode = "due" | "priority";

/** Open tasks first, then by the chosen order, with the other as tie-break. */
export function sortTasks(tasks: Task[], mode: SortMode): Task[] {
  const byDue = (a: Task, b: Task) => a.dueDate.localeCompare(b.dueDate);
  const [first, second] =
    mode === "due" ? [byDue, byPriority] : [byPriority, byDue];

  return [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      first(a, b) ||
      second(a, b) ||
      a.title.localeCompare(b.title),
  );
}

import { describe, expect, it } from "vitest";
import { sortTasks } from "./sort-tasks";
import type { Task } from "./types";

function task(
  id: string,
  dueDate: string,
  priority: Task["priority"],
  done = false,
): Task {
  return { id, title: id, ownerId: "u", storeId: "s", dueDate, priority, done };
}

const tasks = [
  task("a", "2026-03-10", "low"),
  task("b", "2026-03-09", "medium"),
  task("c", "2026-03-11", "high"),
  task("d", "2026-03-08", "high", true),
];

describe("sortTasks", () => {
  it("sorts by due date, with done tasks last", () => {
    expect(sortTasks(tasks, "due").map((t) => t.id)).toEqual([
      "b",
      "a",
      "c",
      "d",
    ]);
  });

  it("sorts by priority, with done tasks last", () => {
    expect(sortTasks(tasks, "priority").map((t) => t.id)).toEqual([
      "c",
      "b",
      "a",
      "d",
    ]);
  });

  it("does not change the original array", () => {
    sortTasks(tasks, "priority");
    expect(tasks[0].id).toBe("a");
  });
});

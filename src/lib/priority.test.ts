import { describe, expect, it } from "vitest";
import { byPriority, normalizePriority } from "./priority";
import type { Priority } from "./types";

describe("normalizePriority", () => {
  it("keeps valid priorities", () => {
    expect(normalizePriority("high")).toBe("high");
    expect(normalizePriority("low")).toBe("low");
  });

  it("treats missing or unknown values as medium", () => {
    expect(normalizePriority(undefined)).toBe("medium");
    expect(normalizePriority("urgent")).toBe("medium");
  });
});

describe("byPriority", () => {
  it("sorts high, then medium, then low", () => {
    const tasks: { priority: Priority }[] = [
      { priority: "low" },
      { priority: "high" },
      { priority: "medium" },
    ];
    expect(tasks.sort(byPriority).map((t) => t.priority)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });
});

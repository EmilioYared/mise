import { describe, expect, it } from "vitest";
import { formatDue, isOverdue, todayIn } from "./dates";

const LA = "America/Los_Angeles";
const NY = "America/New_York";

// 8 PM on March 9 in Los Angeles (PDT, UTC-7) is already March 10 in UTC.
const evenInLA = new Date("2026-03-10T03:00:00Z");

describe("todayIn", () => {
  it("uses the store's calendar date, not UTC", () => {
    expect(evenInLA.toISOString().slice(0, 10)).toBe("2026-03-10");
    expect(todayIn(LA, evenInLA)).toBe("2026-03-09");
  });

  it("gives different stores their own date at the same instant", () => {
    expect(todayIn(NY, evenInLA)).toBe("2026-03-09");
    expect(todayIn("Asia/Beirut", evenInLA)).toBe("2026-03-10");
  });
});

describe("isOverdue", () => {
  it("does not flag a task due today at 8 PM in Los Angeles", () => {
    expect(isOverdue("2026-03-09", LA, evenInLA)).toBe(false);
  });

  it("flags a task due yesterday", () => {
    expect(isOverdue("2026-03-08", LA, evenInLA)).toBe(true);
  });

  it("does not flag a task due in the future", () => {
    expect(isOverdue("2026-03-10", LA, evenInLA)).toBe(false);
  });

  it("works in winter time too (PST, UTC-8)", () => {
    // 4:30 PM on Jan 15 in LA is 00:30 on Jan 16 in UTC.
    const winterEvening = new Date("2026-01-16T00:30:00Z");
    expect(isOverdue("2026-01-15", LA, winterEvening)).toBe(false);
    expect(isOverdue("2026-01-14", LA, winterEvening)).toBe(true);
  });

  it("turns overdue right after midnight in the store's zone", () => {
    const justAfterMidnightLA = new Date("2026-03-10T07:01:00Z");
    expect(isOverdue("2026-03-09", LA, justAfterMidnightLA)).toBe(true);
  });
});

describe("formatDue", () => {
  it("names nearby days relative to the store's today", () => {
    expect(formatDue("2026-03-09", LA, evenInLA)).toBe("Today");
    expect(formatDue("2026-03-10", LA, evenInLA)).toBe("Tomorrow");
    expect(formatDue("2026-03-08", LA, evenInLA)).toBe("Yesterday");
  });

  it("shows a short date otherwise", () => {
    expect(formatDue("2026-03-20", LA, evenInLA)).toBe("Mar 20");
  });
});

/** Today's calendar date ("YYYY-MM-DD") in the given IANA time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // "en-CA" formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/**
 * A task is overdue when its due date is before today *in the store's time
 * zone*. Not UTC (toISOString), and not the viewer's device, so a manager in
 * another city sees the same answer as the staff member.
 */
export function isOverdue(
  dueDate: string,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  // YYYY-MM-DD strings sort in date order.
  return dueDate < todayIn(timeZone, now);
}

/** "Today", "Tomorrow", "Yesterday", or a short date like "Mar 9". */
export function formatDue(
  dueDate: string,
  timeZone: string,
  now: Date = new Date(),
): string {
  const today = todayIn(timeZone, now);
  const offset = daysBetween(today, dueDate);
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  if (offset === -1) return "Yesterday";
  // Noon UTC keeps the calendar date stable whatever zone formats it.
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dueDate}T12:00:00Z`));
}

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

// A live query result remembers which query it came from, so switching users
// never shows the previous user's data for a moment.
export type Result<T> =
  { key: string; value: T } | { key: string; error: Error };

export type Loadable<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; value: T };

export function resolve<T>(result: Result<T> | null, key: string): Loadable<T> {
  if (!result || result.key !== key) return { status: "loading" };
  if ("error" in result) return { status: "error", error: result.error };
  return { status: "ready", value: result.value };
}

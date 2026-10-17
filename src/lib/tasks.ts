"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firebase } from "@/lib/firebase/client";
import { normalizePriority } from "@/lib/priority";
import type { Priority, Task, UserProfile } from "@/lib/types";

export type TaskInput = {
  title: string;
  dueDate: string;
  priority: Priority;
  ownerId: string;
};

// A result remembers which query it came from, so switching users never shows
// the previous user's tasks for a moment.
type Result<T> = { key: string; value: T } | { key: string; error: Error };

export type Loadable<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; value: T };

function resolve<T>(result: Result<T> | null, key: string): Loadable<T> {
  if (!result || result.key !== key) return { status: "loading" };
  if ("error" in result) return { status: "error", error: result.error };
  return { status: "ready", value: result.value };
}

/**
 * Live list of the tasks this person can see: their own, or the whole store's
 * for a manager. The query matches the security rules, which don't filter
 * results; a query asking for more than the rules allow is rejected.
 */
export function useTasks(profile: UserProfile): Loadable<Task[]> {
  const isManager = profile.role === "manager";
  const key = isManager ? `store:${profile.storeId}` : `owner:${profile.uid}`;
  const [result, setResult] = useState<Result<Task[]> | null>(null);

  useEffect(() => {
    const tasks = collection(firebase().db, "tasks");
    const q = isManager
      ? query(tasks, where("storeId", "==", profile.storeId))
      : query(tasks, where("ownerId", "==", profile.uid));

    return onSnapshot(
      q,
      (snap) =>
        setResult({
          key,
          value: snap.docs.map((d) => {
            const data = d.data();
            return {
              ...data,
              id: d.id,
              priority: normalizePriority(data.priority),
            } as Task;
          }),
        }),
      (error) => setResult({ key, error }),
    );
  }, [key, isManager, profile.storeId, profile.uid]);

  return resolve(result, key);
}

/** People a task can be assigned to: the store's team for a manager. */
export function useAssignees(profile: UserProfile): UserProfile[] {
  const isManager = profile.role === "manager";
  const [result, setResult] = useState<Result<UserProfile[]> | null>(null);

  useEffect(() => {
    if (!isManager) return;
    const q = query(
      collection(firebase().db, "users"),
      where("storeId", "==", profile.storeId),
    );
    return onSnapshot(
      q,
      (snap) =>
        setResult({
          key: profile.storeId,
          value: snap.docs.map(
            (d) => ({ ...d.data(), uid: d.id }) as UserProfile,
          ),
        }),
      (error) => setResult({ key: profile.storeId, error }),
    );
  }, [isManager, profile.storeId]);

  const team = resolve(result, profile.storeId);
  if (!isManager || team.status !== "ready") return [profile];
  return [...team.value].sort((a, b) => a.name.localeCompare(b.name));
}

export function createTask(storeId: string, input: TaskInput) {
  return addDoc(collection(firebase().db, "tasks"), {
    ...input,
    storeId,
    done: false,
  });
}

export function updateTask(
  task: Task,
  changes: Partial<Pick<Task, "title" | "dueDate" | "priority" | "done">>,
) {
  // Always write the priority, so editing a task saved before priorities
  // existed also gives it the default.
  return updateDoc(doc(firebase().db, "tasks", task.id), {
    priority: task.priority,
    ...changes,
  });
}

export function deleteTask(id: string) {
  return deleteDoc(doc(firebase().db, "tasks", id));
}

/** Puts a deleted task back under the same id (the undo in the toast). */
export function restoreTask({ id, ...task }: Task) {
  return setDoc(doc(firebase().db, "tasks", id), task);
}

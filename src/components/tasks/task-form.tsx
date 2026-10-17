"use client";

import { useState, type FormEvent } from "react";
import { todayIn } from "@/lib/dates";
import { DEFAULT_PRIORITY, PRIORITIES, PRIORITY_LABEL } from "@/lib/priority";
import type { TaskInput } from "@/lib/tasks";
import type { Priority, Task, UserProfile } from "@/lib/types";

type Props = {
  /** The task being edited; omit to create a new one. */
  task?: Task;
  me: UserProfile;
  assignees: UserProfile[];
  timeZone: string;
  onSubmit: (input: TaskInput) => Promise<unknown>;
  onCancel: () => void;
};

export function TaskForm({
  task,
  me,
  assignees,
  timeZone,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? todayIn(timeZone));
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? DEFAULT_PRIORITY,
  );
  const [ownerId, setOwnerId] = useState(task?.ownerId ?? me.uid);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAssign = me.role === "manager" && !task;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim(), dueDate, priority, ownerId });
    } catch (err) {
      console.error(err);
      setError("Couldn't save the task. Please try again.");
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Task</span>
        <input
          autoFocus
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Count walk-in inventory"
          className={field}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Due</span>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={field}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={field}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>

        {canAssign && (
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Assign to</span>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className={field}
            >
              {assignees.map((person) => (
                <option key={person.uid} value={person.uid}>
                  {person.uid === me.uid ? `${person.name} (me)` : person.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {saving ? "Saving…" : task ? "Save" : "Add task"}
        </button>
      </div>
    </form>
  );
}

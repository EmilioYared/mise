"use client";

import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { todayIn } from "@/lib/dates";
import { DEFAULT_PRIORITY, PRIORITIES, PRIORITY_LABEL } from "@/lib/priority";
import type { TaskInput } from "@/lib/tasks";
import type { Priority, Task, UserProfile } from "@/lib/types";

const PRIORITY_ON: Record<Priority, string> = {
  high: "bg-expo text-white border-expo",
  medium: "bg-mustard text-ink border-mustard",
  low: "bg-steel-deep text-ink border-steel-deep",
};

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
    "w-full rounded-lg border-2 border-steel-deep bg-ticket px-3 py-2.5 focus:border-tape focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Task</span>
        <input
          autoFocus
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Count walk-in inventory"
          className={`${field} font-display text-2xl font-bold`}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold">Priority</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {PRIORITIES.map((p) => (
            <motion.button
              key={p}
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-pressed={priority === p}
              onClick={() => setPriority(p)}
              className={`rounded-lg border-2 py-2 font-semibold transition-colors ${
                priority === p
                  ? PRIORITY_ON[p]
                  : "border-steel-deep text-ink-soft hover:border-rail"
              }`}
            >
              {PRIORITY_LABEL[p]}
            </motion.button>
          ))}
        </div>
      </fieldset>

      <div className={`grid gap-4 ${canAssign ? "sm:grid-cols-2" : ""}`}>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Due</span>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={field}
          />
        </label>

        {canAssign && (
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Assign to</span>
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
        <p role="alert" className="text-sm font-medium text-expo">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-dashed border-steel-deep pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2.5 font-medium text-ink-soft hover:bg-steel"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={saving || !title.trim()}
          className="rounded-lg bg-tape px-5 py-2.5 font-semibold text-white shadow-[0_2px_0_#1d4fa8] disabled:opacity-50"
        >
          {saving ? "Saving…" : task ? "Save changes" : "Add task"}
        </motion.button>
      </div>
    </form>
  );
}

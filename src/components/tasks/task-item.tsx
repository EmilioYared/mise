"use client";

import { formatDue, isOverdue } from "@/lib/dates";
import { PRIORITY_LABEL } from "@/lib/priority";
import type { Task } from "@/lib/types";

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

type Props = {
  task: Task;
  timeZone: string;
  /** Shown to managers, who see the whole store's tasks. */
  ownerName?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskItem({
  task,
  timeZone,
  ownerName,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const overdue = !task.done && isOverdue(task.dueDate, timeZone);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
        className="size-4 accent-zinc-900 dark:accent-white"
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate ${task.done ? "text-zinc-400 line-through" : ""}`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
          <span className={overdue ? "font-medium text-red-600" : undefined}>
            {overdue ? "Overdue · " : ""}
            {formatDue(task.dueDate, timeZone)}
          </span>
          {ownerName && <span>· {ownerName}</span>}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}
      >
        {PRIORITY_LABEL[task.priority]}
      </span>

      <button
        onClick={onEdit}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="text-sm text-zinc-500 hover:text-red-600"
      >
        Delete
      </button>
    </li>
  );
}

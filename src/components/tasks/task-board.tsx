"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sortTasks, type SortMode } from "@/lib/sort-tasks";
import {
  createTask,
  deleteTask,
  restoreTask,
  updateTask,
  useAssignees,
  useTasks,
} from "@/lib/tasks";
import type { Store, Task, UserProfile } from "@/lib/types";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";

type Props = { profile: UserProfile; store: Store };

export function TaskBoard({ profile, store }: Props) {
  const tasks = useTasks(profile);
  const assignees = useAssignees(profile);
  const [sort, setSort] = useState<SortMode>("due");
  // "new" for the create form, a task id while editing that task.
  const [editing, setEditing] = useState<string | null>(null);

  const isManager = profile.role === "manager";
  const names = new Map(assignees.map((p) => [p.uid, p.name]));

  function handleToggle(task: Task) {
    updateTask(task, { done: !task.done }).catch((err) => {
      console.error(err);
      toast.error("Couldn't update the task. Please try again.");
    });
  }

  // Firestore updates the live list straight away, before the server answers,
  // and puts the task back by itself if the server rejects the delete.
  async function handleDelete(task: Task) {
    const toastId = toast("Task deleted", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () =>
          restoreTask(task).catch((err) => {
            console.error(err);
            toast.error("Couldn't restore the task.");
          }),
      },
    });
    try {
      await deleteTask(task.id);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Couldn't delete the task. Please try again.");
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {isManager ? `${store.name} tasks` : "My tasks"}
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-500">
            Sort by{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            >
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <button
            onClick={() => setEditing("new")}
            disabled={editing === "new"}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            New task
          </button>
        </div>
      </div>

      {editing === "new" && (
        <div className="mt-4">
          <TaskForm
            me={profile}
            assignees={assignees}
            timeZone={store.timeZone}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await createTask(store.id, input);
              setEditing(null);
              toast.success("Task added");
            }}
          />
        </div>
      )}

      <div className="mt-4">
        {tasks.status === "loading" && (
          <p className="text-sm text-zinc-500">Loading tasks…</p>
        )}

        {tasks.status === "error" && (
          <p role="alert" className="text-sm text-red-600">
            Couldn&apos;t load tasks. Check your connection and refresh.
          </p>
        )}

        {tasks.status === "ready" &&
          tasks.value.length === 0 &&
          editing !== "new" && (
            <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
              No tasks yet. Add the first one.
            </p>
          )}

        {tasks.status === "ready" && tasks.value.length > 0 && (
          <ul className="grid gap-2">
            {sortTasks(tasks.value, sort).map((task) =>
              editing === task.id ? (
                <li key={task.id}>
                  <TaskForm
                    task={task}
                    me={profile}
                    assignees={assignees}
                    timeZone={store.timeZone}
                    onCancel={() => setEditing(null)}
                    onSubmit={async ({ title, dueDate, priority }) => {
                      await updateTask(task, { title, dueDate, priority });
                      setEditing(null);
                    }}
                  />
                </li>
              ) : (
                <TaskItem
                  key={task.id}
                  task={task}
                  timeZone={store.timeZone}
                  ownerName={isManager ? names.get(task.ownerId) : undefined}
                  onToggle={() => handleToggle(task)}
                  onEdit={() => setEditing(task.id)}
                  onDelete={() => handleDelete(task)}
                />
              ),
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { isOverdue } from "@/lib/dates";
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
import { useNow } from "@/lib/use-now";
import { ShiftBoard } from "./shift-board";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";

type Filter = "open" | "overdue" | "done";

// How long a finished ticket stays in view, so its stamp can land.
const LINGER_MS = 1100;
// After a filter change the list keeps its old height while tickets swap,
// then eases down to its new height.
const HOLD_MS = 350;
const RELEASE_MS = 600;

type Props = { profile: UserProfile; store: Store };

export function TaskBoard({ profile, store }: Props) {
  const tasks = useTasks(profile);
  const assignees = useAssignees(profile);
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("open");
  const [sort, setSort] = useState<SortMode>("due");
  // "new" for the create sheet, a task id while editing that task.
  const [editing, setEditing] = useState<string | null>(null);
  const [lingering, setLingering] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const holdTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // While set, the list keeps at least this height.
  const [heldHeight, setHeldHeight] = useState<number>();
  const [releasing, setReleasing] = useState(false);

  const isManager = profile.role === "manager";
  const names = new Map(assignees.map((p) => [p.uid, p.name]));
  const all = tasks.status === "ready" ? tasks.value : [];
  const overdueOf = (t: Task) =>
    !t.done && isOverdue(t.dueDate, store.timeZone, now);

  const counts = {
    open: all.filter((t) => !t.done).length,
    overdue: all.filter(overdueOf).length,
    done: all.filter((t) => t.done).length,
  };

  // A ticket that was just finished keeps its place while its stamp lands,
  // so it's sorted as if it were still open.
  const shown = all.filter((t) => {
    if (filter === "open") return !t.done || lingering.includes(t.id);
    if (filter === "overdue") return overdueOf(t);
    return t.done;
  });
  const byId = new Map(shown.map((t) => [t.id, t]));
  const visible = sortTasks(
    shown.map((t) => (lingering.includes(t.id) ? { ...t, done: false } : t)),
    sort,
  ).map((t) => byId.get(t.id)!);
  const editingTask = all.find((t) => t.id === editing);

  function handleToggle(task: Task) {
    if (!task.done) {
      setLingering((ids) => [...ids, task.id]);
      setTimeout(
        () => setLingering((ids) => ids.filter((id) => id !== task.id)),
        LINGER_MS,
      );
    }
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

  // Switching to a shorter list would make the page shorter than the scroll
  // position, and the browser would snap up in a single frame. Instead the
  // list holds its old height while the tickets swap, then eases down to the
  // new height, and the page follows it smoothly.
  function changeFilter(next: Filter) {
    if (next === filter) return;
    holdTimers.current.forEach(clearTimeout);
    setReleasing(false);
    if (listRef.current) setHeldHeight(listRef.current.offsetHeight);
    setFilter(next);

    holdTimers.current = [
      setTimeout(() => {
        // Ease to the new list's own height, so the page shrinks evenly
        // over the whole transition rather than all at the end.
        const children = [...(listRef.current?.children ?? [])];
        const natural = children.reduce(
          (sum, el) => sum + (el as HTMLElement).offsetHeight,
          0,
        );
        setReleasing(true);
        setHeldHeight(natural);
      }, HOLD_MS),
      setTimeout(() => {
        setReleasing(false);
        setHeldHeight(undefined);
      }, HOLD_MS + RELEASE_MS),
    ];
  }

  const closeSheet = () => setEditing(null);

  return (
    <>
      <ShiftBoard {...counts} />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Segmented
          label="Show"
          value={filter}
          onChange={changeFilter}
          options={[
            { value: "open", label: "To do", count: counts.open },
            { value: "overdue", label: "Overdue", count: counts.overdue },
            { value: "done", label: "Done", count: counts.done },
          ]}
        />
        <div className="flex items-center gap-3">
          <Segmented
            label="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              { value: "due", label: "Due date" },
              { value: "priority", label: "Priority" },
            ]}
          />
          <motion.button
            onClick={() => setEditing("new")}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-tape px-4 py-2.5 font-semibold text-white shadow-[0_2px_0_#1d4fa8] hover:brightness-110"
          >
            New task
          </motion.button>
        </div>
      </div>

      <div
        ref={listRef}
        className={`mt-6 ${
          releasing
            ? "transition-[min-height] duration-600 ease-in-out motion-reduce:transition-none"
            : ""
        }`}
        style={heldHeight !== undefined ? { minHeight: heldHeight } : undefined}
      >
        {tasks.status === "loading" && (
          <p className="text-sm text-ink-soft">Loading tasks…</p>
        )}

        {tasks.status === "error" && (
          <p role="alert" className="text-sm text-expo">
            Couldn&apos;t load tasks. Check your connection and refresh.
          </p>
        )}

        {tasks.status === "ready" && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  timeZone={store.timeZone}
                  now={now}
                  ownerName={isManager ? names.get(task.ownerId) : undefined}
                  onToggle={() => handleToggle(task)}
                  onEdit={() => setEditing(task.id)}
                  onDelete={() => handleDelete(task)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}

        {tasks.status === "ready" && visible.length === 0 && (
          <EmptyState filter={filter} onNew={() => setEditing("new")} />
        )}
      </div>

      <Sheet
        open={editing !== null}
        title={editingTask ? "Edit task" : "New task"}
        onClose={closeSheet}
      >
        <TaskForm
          key={editing ?? "closed"}
          task={editingTask}
          me={profile}
          assignees={assignees}
          timeZone={store.timeZone}
          onCancel={closeSheet}
          onSubmit={async (input) => {
            if (editingTask) {
              const { title, dueDate, priority } = input;
              await updateTask(editingTask, { title, dueDate, priority });
              toast.success("Task updated");
            } else {
              await createTask(store.id, input);
              toast.success("Task added");
            }
            closeSheet();
          }}
        />
      </Sheet>
    </>
  );
}

function EmptyState({ filter, onNew }: { filter: Filter; onNew: () => void }) {
  const copy = {
    open: "Nothing left on the rail. Add a task, or enjoy the quiet.",
    overdue: "Nothing overdue. Every ticket is on time.",
    done: "Nothing done yet. Finish a task and it lands here.",
  }[filter];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-steel-deep px-6 py-14 text-center"
    >
      <p className="font-display text-3xl font-black">{copy}</p>
      {filter === "open" && (
        <button
          onClick={onNew}
          className="mt-5 rounded-lg bg-ink px-4 py-2.5 font-semibold text-steel"
        >
          New task
        </button>
      )}
    </motion.div>
  );
}

type Option<T> = { value: T; label: string; count?: number };

/** A row of choices with a pill that slides to the selected one. */
function Segmented<T extends string>(props: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  const id = props.label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div
      role="radiogroup"
      aria-label={props.label}
      className="flex rounded-full bg-steel-deep/70 p-1"
    >
      {props.options.map((option) => {
        const active = option.value === props.value;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={active}
            onClick={() => props.onChange(option.value)}
            className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-full bg-ticket shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">
              {option.label}
              {option.count !== undefined && (
                <span className="ml-1.5 text-ink-soft tabular-nums">
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

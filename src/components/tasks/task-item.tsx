"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type Ref } from "react";
import { Burst } from "@/components/ui/burst";
import { Stamp } from "@/components/ui/stamp";
import { formatDue, isOverdue } from "@/lib/dates";
import { PRIORITY_LABEL } from "@/lib/priority";
import type { Task } from "@/lib/types";

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  high: "bg-expo text-white",
  medium: "bg-mustard text-ink",
  low: "bg-steel-deep text-ink-soft",
};

/** A small, stable tilt per ticket, so the board looks hand-hung. */
function tiltFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 25) - 12) / 10; // -1.2° to 1.2°
}

type Props = {
  task: Task;
  timeZone: string;
  now: Date;
  /** Shown to managers, who see the whole store's tasks. */
  ownerName?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** AnimatePresence's popLayout mode measures the item through this. */
  ref?: Ref<HTMLLIElement>;
};

export function TaskItem({
  task,
  timeZone,
  now,
  ownerName,
  onToggle,
  onEdit,
  onDelete,
  ref,
}: Props) {
  const [bursts, setBursts] = useState(0);
  const overdue = !task.done && isOverdue(task.dueDate, timeZone, now);
  const tilt = tiltFor(task.id);

  function toggle() {
    if (!task.done) setBursts((n) => n + 1);
    onToggle();
  }

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: -60, rotate: tilt * 5 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      exit={{
        opacity: 0,
        y: 80,
        rotate: tilt * 8,
        scale: 0.85,
        transition: { duration: 0.28, ease: "easeIn" },
      }}
      whileHover={{ y: -4, rotate: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <article
        className={`ticket-edge relative flex h-full flex-col bg-ticket px-5 pt-7 pb-4 shadow-[0_12px_20px_-12px_rgba(27,33,39,0.5)] ${
          overdue ? "ring-2 ring-expo ring-inset" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${PRIORITY_STYLE[task.priority]}`}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
          {ownerName && <span className="text-ink-soft">{ownerName}</span>}
        </div>

        <h3
          className={`mt-3 font-display text-[1.7rem] leading-[1.02] font-bold ${
            task.done ? "text-ink-soft line-through decoration-2" : ""
          }`}
        >
          {task.title}
        </h3>

        <p
          className={`mt-2 text-sm ${overdue ? "font-semibold text-expo" : "text-ink-soft"}`}
        >
          {overdue ? "Overdue, due " : "Due "}
          {formatDue(task.dueDate, timeZone, now).toLowerCase()}
        </p>

        <AnimatePresence>
          {task.done && (
            <motion.div
              key="stamp"
              className="absolute top-10 right-4"
              exit={{ opacity: 0 }}
            >
              <Stamp label="Done" tone="basil" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-between border-t border-dashed border-steel-deep pt-3">
          <div className="relative">
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.85 }}
              aria-label={
                task.done
                  ? `Mark "${task.title}" as not done`
                  : `Mark "${task.title}" as done`
              }
              aria-pressed={task.done}
              className={`grid size-11 place-items-center rounded-full border-2 transition-colors ${
                task.done
                  ? "border-basil bg-basil text-white"
                  : "border-ink-soft/40 text-transparent hover:border-basil hover:text-basil"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
            {bursts > 0 && <Burst key={bursts} />}
          </div>

          <div className="flex gap-1 text-sm">
            <button
              onClick={onEdit}
              className="rounded-md px-2.5 py-1.5 text-ink-soft hover:bg-steel hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded-md px-2.5 py-1.5 text-ink-soft hover:bg-expo/10 hover:text-expo"
            >
              Delete
            </button>
          </div>
        </div>
      </article>
    </motion.li>
  );
}

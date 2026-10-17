"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { isOverdue } from "@/lib/dates";

// One evening, from 3 PM to 11:45 PM in Los Angeles (Monday March 9, 2026).
const START = Date.parse("2026-03-09T22:00:00Z");
const STEP_MINUTES = 15;
const STEPS = 35;
const DUE = "2026-03-09";

const STORES = [
  { name: "Downtown LA", timeZone: "America/Los_Angeles" },
  { name: "Brooklyn", timeZone: "America/New_York" },
];

function clock(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(now);
}

function weekday(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(
    now,
  );
}

/**
 * Drag through an evening and watch a task due "today" in two stores. The
 * real isOverdue() from the app decides each store's status; the naive UTC
 * check (the bug this replaces) is shown alongside it.
 */
export function TimeScrubber() {
  const [step, setStep] = useState(20); // 8 PM in Los Angeles
  const now = new Date(START + step * STEP_MINUTES * 60_000);
  const utcSaysOverdue = DUE < now.toISOString().slice(0, 10);

  return (
    <div className="font-text">
      <div className="grid gap-6 sm:grid-cols-2">
        {STORES.map((store) => (
          <StoreTicket
            key={store.timeZone}
            name={store.name}
            time={clock(now, store.timeZone)}
            day={weekday(now, store.timeZone)}
            overdue={isOverdue(DUE, store.timeZone, now)}
          />
        ))}
      </div>

      <label className="mt-10 block">
        <span className="text-sm text-ink-soft">
          Drag to move through the evening
        </span>
        <input
          type="range"
          min={0}
          max={STEPS}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          aria-valuetext={`${clock(now, STORES[0].timeZone)} in Los Angeles, ${clock(now, STORES[1].timeZone)} in Brooklyn`}
          className="scrubber mt-3 w-full"
        />
      </label>

      <p className="mt-6 max-w-[62ch] text-ink-soft">
        A plain UTC check would call this task{" "}
        <strong className={utcSaysOverdue ? "text-expo" : "text-ink"}>
          {utcSaysOverdue ? "overdue in both stores" : "on time"}
        </strong>{" "}
        right now, because UTC has{" "}
        {utcSaysOverdue
          ? "already moved on to Tuesday"
          : "not reached Tuesday yet"}
        . Mise asks each store&apos;s own clock, so a manager in Brooklyn and a
        cook in Los Angeles see the same answer.
      </p>
    </div>
  );
}

function StoreTicket(props: {
  name: string;
  time: string;
  day: string;
  overdue: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <article className="ticket-edge relative bg-ticket px-6 pt-7 pb-6 text-ink shadow-[0_10px_18px_-10px_rgba(27,33,39,0.45)]">
      <p className="text-sm text-ink-soft">{props.name}</p>
      <p className="mt-1 font-display text-6xl leading-none font-bold tabular-nums">
        {props.time}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{props.day}</p>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-dashed border-steel-deep pt-4">
        <div>
          <p className="font-medium">Close-out checklist</p>
          <p className="text-sm text-ink-soft">Due Monday</p>
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={String(props.overdue)}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { scale: 1.6, opacity: 0, rotate: -12 }
            }
            animate={{ scale: 1, opacity: 1, rotate: props.overdue ? -6 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className={`rounded border-2 px-2 py-0.5 font-display text-lg font-bold ${
              props.overdue
                ? "border-expo text-expo"
                : "border-ink-soft/40 text-ink-soft"
            }`}
          >
            {props.overdue ? "Overdue" : "On time"}
          </motion.span>
        </AnimatePresence>
      </div>
    </article>
  );
}

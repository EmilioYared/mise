"use client";

import { AnimatePresence, motion } from "motion/react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { Stamp } from "@/components/ui/stamp";

type Props = { open: number; overdue: number; done: number };

/**
 * The scoreboard over the pass: how much of the shift's work is cleared,
 * styled like a kitchen display screen.
 */
export function ShiftBoard({ open, overdue, done }: Props) {
  const total = open + done;
  const cleared = total === 0 ? 0 : done / total;
  const clean = total > 0 && open === 0;

  return (
    <section
      aria-label="Shift progress"
      className="relative mt-6 overflow-hidden rounded-2xl bg-ink px-5 py-5 text-steel sm:px-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="min-w-56 flex-1">
          <p className="text-sm text-rail">Tickets cleared</p>
          <p className="mt-1 font-display text-5xl leading-none font-black">
            <RollingNumber value={done} />
            <span className="text-rail"> / {total}</span>
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-soft/50">
            <motion.div
              className="h-full rounded-full bg-basil"
              initial={false}
              animate={{ width: `${cleared * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <dl className="flex gap-8">
          <Stat label="Open" value={open} />
          <Stat label="Overdue" value={overdue} alert={overdue > 0} />
          <Stat label="Done" value={done} />
        </dl>
      </div>

      <AnimatePresence>
        {clean && (
          <motion.div
            key="clean"
            className="absolute top-4 right-5"
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Stamp label="Clean pass" tone="basil" className="bg-ink" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Stat(props: { label: string; value: number; alert?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-rail">{props.label}</dt>
      <dd
        className={`font-display text-4xl leading-none font-black ${props.alert ? "text-[#ff6b7a]" : ""}`}
      >
        <RollingNumber value={props.value} />
      </dd>
    </div>
  );
}

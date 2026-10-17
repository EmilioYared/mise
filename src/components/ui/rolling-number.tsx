"use client";

import { AnimatePresence, motion } from "motion/react";

/** A number that rolls up or down, like a scoreboard, when it changes. */
export function RollingNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

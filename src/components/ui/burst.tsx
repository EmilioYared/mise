"use client";

import { motion } from "motion/react";

const PIECES = 10;
const COLORS = ["bg-tape", "bg-basil", "bg-mustard", "bg-expo"];

/**
 * A small burst of confetti from the centre of its parent. Render it with a
 * new key each time it should fire.
 */
export function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2;
        const distance = 46 + (i % 3) * 14;
        return (
          <motion.span
            key={i}
            className={`absolute top-1/2 left-1/2 size-2 rounded-[2px] ${COLORS[i % COLORS.length]}`}
            initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 0.4,
              opacity: 0,
              rotate: 180,
            }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}

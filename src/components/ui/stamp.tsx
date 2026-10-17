"use client";

import { motion } from "motion/react";

const TONE = {
  basil: "border-basil text-basil",
  expo: "border-expo text-expo",
  ink: "border-ink-soft text-ink-soft",
};

type Props = {
  label: string;
  tone: keyof typeof TONE;
  className?: string;
};

/** A rubber stamp that slams onto a ticket. */
export function Stamp({ label, tone, className = "" }: Props) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 2.2, opacity: 0, rotate: -24 }}
      animate={{ scale: 1, opacity: 1, rotate: -10 }}
      transition={{ type: "spring", stiffness: 520, damping: 18 }}
      className={`pointer-events-none inline-block rounded-md border-[3px] px-2.5 py-0.5 font-display text-2xl font-black tracking-wide mix-blend-multiply ${TONE[tone]} ${className}`}
    >
      {label}
    </motion.span>
  );
}

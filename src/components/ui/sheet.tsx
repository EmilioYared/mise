"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A blank ticket that slides up over the board, for creating and editing.
 * Escape or a click outside closes it.
 */
export function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="ticket-edge relative w-full max-w-lg bg-ticket px-5 pt-8 pb-6 shadow-[0_24px_48px_-12px_rgba(27,33,39,0.5)] sm:px-7"
            initial={{ y: "110%", rotate: 2 }}
            animate={{ y: 0, rotate: 0 }}
            exit={{ y: "110%", rotate: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h2 className="font-display text-3xl font-black">{title}</h2>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

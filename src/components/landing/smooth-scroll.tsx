"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Smooth scrolling for the landing page only. Skipped entirely for people who
 * ask for reduced motion (and during server rendering, where it's unknown).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion !== false) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.12 }}>
      {children}
    </ReactLenis>
  );
}

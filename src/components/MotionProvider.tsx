"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Framer Motion (published as `motion`) with lazy-loaded DOM features to keep the
 * bundle small. `reducedMotion="user"` honours the visitor's OS setting.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

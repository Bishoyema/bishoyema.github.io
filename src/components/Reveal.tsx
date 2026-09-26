"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Travel distance in px. */
  y?: number;
};

/** Fades content up once as it scrolls into view. Visible without JS via the <noscript> rule in the layout. */
export function Reveal({ children, className, delay = 0, y = 28 }: Props) {
  return (
    <m.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </m.div>
  );
}

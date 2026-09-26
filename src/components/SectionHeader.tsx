import type { ReactNode } from "react";
import { cn } from "@/lib/site";
import { Reveal } from "./Reveal";

type Props = {
  index?: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  className?: string;
};

export function SectionLabel({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="label flex items-center gap-3 text-mute">
      {index && <span className="tabular text-paper">{index}</span>}
      {index && <span aria-hidden className="h-px w-8 bg-line-strong" />}
      <span>{children}</span>
    </p>
  );
}

export function SectionHeader({ index, label, title, intro, id, className }: Props) {
  return (
    <Reveal className={cn("grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end md:gap-8", className)}>
      <div className="md:col-span-8 lg:col-span-7">
        <SectionLabel index={index}>{label}</SectionLabel>
        <h2 id={id} className="mt-5 font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.9] text-balance">
          {title}
        </h2>
      </div>
      {intro && (
        <div className="max-w-md text-[1.0625rem] leading-relaxed text-mute md:col-span-4 md:col-start-9 lg:col-span-4 lg:col-start-9">
          {intro}
        </div>
      )}
    </Reveal>
  );
}

/** Serif italic accent inside display headlines. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-accent text-[1.06em] tracking-[-0.02em]">{children}</span>;
}

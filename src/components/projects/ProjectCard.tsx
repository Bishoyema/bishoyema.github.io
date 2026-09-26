import Link from "next/link";
import type { Project } from "@/data/projects";
import { formatTime } from "@/lib/media-prefs";
import { cn } from "@/lib/site";
import { ArrowRight, Play } from "../Icons";
import { CardMedia } from "./CardMedia";

export function TypeBadge({ project, className }: { project: Project; className?: string }) {
  if (project.type !== "Concept Project") return null;
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[0.625rem] text-ink",
        className,
      )}
    >
      Concept Project
    </span>
  );
}

export function ProjectCard({ project, index, className }: { project: Project; index: number; className?: string }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-ink-2 ring-1 ring-line">
        <CardMedia project={project} />
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <TypeBadge project={project} />
          {project.film && (
            <span className="label ml-auto inline-flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[0.625rem] text-paper backdrop-blur-md">
              <Play width={10} height={10} />
              Film · {formatTime(project.film.duration)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-4">
        <span className="label tabular text-paper">{number}</span>
        <p className="label text-mute">{project.tags.slice(0, 2).join(" · ")}</p>
      </div>

      <h3 className="mt-3 font-display text-[clamp(1.875rem,3.4vw,2.75rem)] leading-[0.95] text-balance">
        <Link
          href={`/work/${project.slug}/`}
          className="after:absolute after:inset-0 after:z-10 after:rounded-[1.25rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal"
        >
          {project.title}
        </Link>
      </h3>

      <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-mute">{project.summary}</p>

      <ul aria-label="Tools used" className="mt-5 flex flex-wrap gap-2">
        {project.tools.map((tool) => (
          <li key={tool} className="rounded-full border border-line px-3 py-1 text-xs text-mute">
            {tool}
          </li>
        ))}
      </ul>

      <span
        aria-hidden
        className="mt-6 inline-flex items-center gap-2 border-b border-line-strong pb-1 text-[0.9375rem] font-medium transition-colors duration-300 group-hover:border-paper"
      >
        View Project
        <ArrowRight width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </article>
  );
}

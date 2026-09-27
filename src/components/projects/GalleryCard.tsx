import Link from "next/link";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/site";
import { ArrowRight } from "../Icons";
import { ResponsiveImage } from "../ResponsiveImage";
import { TypeBadge } from "./ProjectCard";

/**
 * Full-width work card for a post series: every post is shown on the home page,
 * so visitors see the whole series without opening the case study.
 */
export function GalleryCard({ project, index, className }: { project: Project; index: number; className?: string }) {
  const number = String(index + 1).padStart(2, "0");
  const posts = project.variants ?? [];

  return (
    <article className={cn("group relative", className)}>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 md:gap-y-8 lg:gap-x-6">
        {posts.map((post) => (
          <li key={post.label}>
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-ink-2 ring-1 ring-line md:rounded-2xl">
              <ResponsiveImage
                image={post.image}
                sizes="(min-width: 1440px) 26rem, (min-width: 768px) 30vw, 46vw"
                className="h-full w-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.02]"
              />
            </div>
            <p className="label mt-3 text-[0.625rem] leading-snug text-mute md:text-[0.6875rem]">
              {post.label} · <span className="text-paper">{post.title}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="label tabular text-paper">{number}</span>
        <p className="label text-mute">{project.tags.slice(0, 2).join(" · ")}</p>
        <TypeBadge project={project} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-12 gap-y-3 lg:grid-cols-12 lg:items-end">
        <h3 className="font-display text-[clamp(1.875rem,3.4vw,2.75rem)] leading-[0.95] text-balance lg:col-span-5">
          <Link
            href={`/work/${project.slug}/`}
            className="after:absolute after:inset-0 after:z-10 after:rounded-[1.25rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal"
          >
            {project.title}
          </Link>
        </h3>
        <p className="max-w-xl text-[1.0625rem] leading-relaxed text-mute lg:col-span-7">{project.summary}</p>
      </div>

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

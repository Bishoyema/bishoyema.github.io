"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { hasFinePointer } from "@/lib/media-prefs";
import { ResponsiveImage } from "../ResponsiveImage";
import { LoopVideo } from "../video/LoopVideo";

const sizes = "(min-width: 1440px) 40rem, (min-width: 768px) 46vw, 92vw";

/** Card artwork. Film projects play their silent teaser while the card is hovered (mouse only). */
export function CardMedia({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const card = ref.current?.closest("article");
    if (!card || !project.film) return;
    const enter = () => hasFinePointer() && setHovered(true);
    const leave = () => setHovered(false);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", enter);
    card.addEventListener("focusout", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", enter);
      card.removeEventListener("focusout", leave);
    };
  }, [project.film]);

  return (
    <div ref={ref} className="h-full w-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]">
      {project.film ? (
        <LoopVideo
          src={project.film.teaser}
          poster={project.cover}
          sizes={sizes}
          trigger="manual"
          active={hovered}
          startAt={project.previewStart}
          className="h-full w-full"
        />
      ) : (
        <ResponsiveImage image={project.cover} sizes={sizes} alt="" className="h-full w-full" />
      )}
    </div>
  );
}

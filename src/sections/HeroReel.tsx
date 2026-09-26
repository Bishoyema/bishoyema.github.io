"use client";

import Link from "next/link";
import { useState } from "react";
import { films, images } from "@/data/media";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { LoopVideo } from "@/components/video/LoopVideo";
import { Play } from "@/components/Icons";

function timecode(seconds: number) {
  const s = Math.floor(seconds);
  const frames = Math.floor((seconds - s) * 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:00:${pad(s)}:${pad(frames)}`;
}

/** Corner marks of a camera viewfinder. */
function Viewfinder() {
  const corner = "absolute size-4 border-paper/70";
  return (
    <span aria-hidden className="pointer-events-none absolute inset-3 z-10">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}

/**
 * Hero visual: three pieces of work fanned out like reels on a table.
 * Only the centre card plays video, and only after the page has loaded.
 */
export function HeroReel() {
  const [time, setTime] = useState(0);

  return (
    <div className="group/reel relative mx-auto aspect-[1/1.02] w-full max-w-[21rem] sm:max-w-[26rem] lg:max-w-[33rem]">
      <Link
        href="/work/skincare-launch-ad/"
        aria-label="Skincare Launch Ad, concept project"
        className="absolute left-[1%] top-[17%] z-10 w-[39%] animate-card-in transition-[translate] duration-700 ease-out-expo [--r:-8deg] [animation-delay:520ms] group-hover/reel:-translate-x-3"
      >
        <span className="block overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-line-strong">
          <ResponsiveImage image={films.skincare.poster} sizes="(min-width: 1024px) 13rem, 36vw" priority />
        </span>
      </Link>

      <Link
        href="/work/impactx-ai-video-launch/"
        aria-label="30 Days of Content campaign"
        className="absolute right-[1%] top-[10%] z-10 w-[43%] animate-card-in transition-[translate] duration-700 ease-out-expo [--r:7deg] [animation-delay:620ms] group-hover/reel:translate-x-3"
      >
        <span className="block overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-line-strong">
          <ResponsiveImage image={images.aiVideoA} sizes="(min-width: 1024px) 15rem, 40vw" priority />
        </span>
      </Link>

      <Link
        href="/#showreel"
        className="absolute left-1/2 top-[1%] z-20 w-[51%] -translate-x-1/2 animate-card-in [animation-delay:400ms]"
      >
        <LoopVideo
          src={films.brand.teaser}
          poster={films.brand.teaserPoster}
          sizes="(min-width: 1024px) 17rem, 52vw"
          deferUntilLoad
          priority
          onTime={setTime}
          className="aspect-[9/16] rounded-[1.25rem] shadow-[0_40px_80px_-24px_rgb(0_0_0/0.9),0_0_0_1px_rgb(243_240_234/0.16)]"
        >
          <Viewfinder />
          <span
            aria-hidden
            className="absolute inset-x-5 top-5 z-10 flex items-center justify-between text-[0.625rem] font-medium tracking-[0.12em] text-paper"
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-signal animate-rec" />
              REC
            </span>
            <span className="tabular opacity-80">{timecode(time)}</span>
          </span>
          <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-16">
            <span className="label block text-[0.625rem] text-paper/70">Featured film</span>
            <span className="mt-1 flex items-center justify-between gap-3">
              <span className="font-display text-[1.375rem] leading-none text-paper">ImpactX Brand Film</span>
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover/reel:scale-110"
              >
                <Play width={14} height={14} className="translate-x-px" />
              </span>
            </span>
          </span>
        </LoopVideo>
      </Link>
    </div>
  );
}

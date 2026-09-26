"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ImageAsset } from "@/data/media";
import { useAutoplayAllowed, usePageLoaded } from "@/lib/use-browser-state";
import { cn } from "@/lib/site";
import { ResponsiveImage } from "../ResponsiveImage";

type Props = {
  src: string;
  poster: ImageAsset;
  sizes: string;
  className?: string;
  /** "view": plays while on screen. "manual": plays while `active` is true (hover previews). */
  trigger?: "view" | "manual";
  active?: boolean;
  /** Start (and restart) playback at this point of the loop, in seconds. */
  startAt?: number;
  /** Wait for the window load event before fetching, so the video never competes with first paint. */
  deferUntilLoad?: boolean;
  priority?: boolean;
  onTime?: (seconds: number) => void;
  children?: ReactNode;
};

/**
 * Silent looping preview. Shows an optimised poster immediately, fetches the
 * video only when it should play, and fades it in on the first frame.
 */
export function LoopVideo({
  src,
  poster,
  sizes,
  className,
  trigger = "view",
  active = false,
  startAt = 0,
  deferUntilLoad = false,
  priority = false,
  onTime,
  children,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const allowed = useAutoplayAllowed();
  const pageLoaded = usePageLoaded();
  const [inView, setInView] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const loaded = !deferUntilLoad || pageLoaded;

  useEffect(() => {
    if (trigger !== "view") return;
    const element = wrapRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [trigger]);

  const shouldPlay = allowed && loaded && (trigger === "view" ? inView : active);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      if (!video.getAttribute("src")) {
        video.src = src;
        if (startAt > 0) video.currentTime = startAt;
      }
      video.muted = true;
      video.play().catch(() => {
        /* Autoplay refused (e.g. iOS Low Power Mode): the poster stays. */
      });
    } else {
      video.pause();
      if (trigger === "manual" && video.readyState > 0) video.currentTime = startAt;
    }
  }, [shouldPlay, src, trigger, startAt]);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)}>
      <ResponsiveImage image={poster} sizes={sizes} priority={priority} alt="" className="absolute inset-0" />
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setShowVideo(true)}
        onTimeUpdate={onTime ? (event) => onTime(event.currentTarget.currentTime) : undefined}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          showVideo ? "opacity-100" : "opacity-0",
        )}
      />
      {children}
    </div>
  );
}

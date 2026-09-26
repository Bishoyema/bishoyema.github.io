"use client";

import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { imageUrl, type FilmAsset } from "@/data/media";
import { formatTime } from "@/lib/media-prefs";
import { useAutoplayAllowed } from "@/lib/use-browser-state";
import { cn } from "@/lib/site";
import { Play, SoundOff } from "../Icons";
import { ResponsiveImage } from "../ResponsiveImage";

export type FilmPlayerHandle = {
  /** Plays the full film with sound from `seconds`. Call from a click handler. */
  playFrom: (seconds?: number) => void;
};

type Props = {
  film: FilmAsset;
  /** Autoplay the short silent teaser while the player is on screen. */
  preview?: boolean;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Reports playback time while the full film is playing. */
  onTime?: (seconds: number) => void;
  ref?: Ref<FilmPlayerHandle>;
};

type Mode = "idle" | "preview" | "full";

const PLAY_EVENT = "portfolio:film-play";

/**
 * Vertical film player.
 * - idle:    optimised poster + play button, nothing downloaded
 * - preview: silent teaser loop while on screen (skipped for reduced motion / data saver)
 * - full:    full film with sound and native controls, loaded only on request
 * Only one film plays with sound at a time, and it pauses when scrolled away.
 */
export function FilmPlayer({ film, preview = false, sizes, className, priority = false, onTime, ref }: Props) {
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const allowed = useAutoplayAllowed();
  const [inView, setInView] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const modeRef = useRef<Mode>("idle");
  const inViewRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const posterImage = preview ? film.teaserPoster : film.poster;

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.3), {
      threshold: [0, 0.3, 0.6],
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Silent preview while on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode === "full" || !preview) return;
    if (allowed && inView) {
      if (video.dataset.source !== "teaser") {
        video.src = film.teaser;
        video.dataset.source = "teaser";
      }
      video.muted = true;
      video.loop = true;
      video
        .play()
        .then(() => setMode((current) => (current === "full" ? current : "preview")))
        .catch(() => {});
    } else {
      video.pause();
    }
  }, [preview, allowed, inView, mode, film.teaser]);

  // Pause the full film when it leaves the screen (only on the transition out of view).
  useEffect(() => {
    inViewRef.current = inView;
    if (!inView && modeRef.current === "full") videoRef.current?.pause();
  }, [inView]);

  // Only one film with sound at a time.
  useEffect(() => {
    const onOtherFilm = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) videoRef.current?.pause();
    };
    if (mode !== "full") return;
    window.addEventListener(PLAY_EVENT, onOtherFilm);
    return () => window.removeEventListener(PLAY_EVENT, onOtherFilm);
  }, [id, mode]);

  const playFrom = useCallback(
    (seconds = 0) => {
      const video = videoRef.current;
      if (!video) return;
      if (video.dataset.source !== "full") {
        video.src = film.src;
        video.dataset.source = "full";
        pendingSeek.current = seconds > 0 ? seconds : null;
      } else {
        video.currentTime = seconds;
      }
      video.loop = false;
      video.muted = false;
      video.controls = true;
      modeRef.current = "full";
      setMode("full");
      if (!inViewRef.current) wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
      video.play().catch(() => {
        // Sound refused by the browser: play muted instead; the native controls can unmute.
        video.muted = true;
        video.play().catch(() => {});
      });
    },
    [film.src, id],
  );

  useImperativeHandle(ref, () => ({ playFrom }), [playFrom]);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && pendingSeek.current !== null) {
      video.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
  };

  const onEnded = () => {
    const video = videoRef.current;
    if (!video || mode !== "full") return;
    video.controls = false;
    video.muted = true;
    setMode("idle");
  };

  const isFull = mode === "full";

  return (
    <div
      ref={wrapRef}
      className={cn("group/film relative isolate overflow-hidden rounded-[1.25rem] bg-ink-2 ring-1 ring-line", className)}
      style={{ aspectRatio: `${film.width} / ${film.height}` }}
    >
      <ResponsiveImage image={posterImage} sizes={sizes} priority={priority} alt="" className="absolute inset-0" />

      <video
        ref={videoRef}
        playsInline
        preload="none"
        poster={imageUrl(posterImage, "webp", Math.max(...posterImage.widths))}
        aria-label={film.title}
        onLoadedMetadata={onLoadedMetadata}
        onPlaying={() => setHasFrame(true)}
        onTimeUpdate={isFull && onTime ? (event) => onTime(event.currentTarget.currentTime) : undefined}
        onEnded={onEnded}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          isFull || hasFrame ? "opacity-100" : "opacity-0",
        )}
      />

      {!isFull && (
        <button
          type="button"
          onClick={() => playFrom(0)}
          aria-label={`Play ${film.title} with sound, ${formatTime(film.duration)}`}
          className="absolute inset-0 flex cursor-pointer flex-col justify-between p-4 text-left sm:p-5"
        >
          <span className="flex items-center justify-between gap-3">
            {mode === "preview" ? (
              <span className="label inline-flex items-center gap-2 rounded-full bg-ink/55 px-3 py-1.5 text-[0.6875rem] text-paper backdrop-blur-md">
                <SoundOff width={14} height={14} />
                Preview
              </span>
            ) : (
              <span />
            )}
            <span className="label tabular rounded-full bg-ink/55 px-3 py-1.5 text-[0.6875rem] text-paper backdrop-blur-md">
              {formatTime(film.duration)}
            </span>
          </span>

          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

          <span className="relative flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-paper text-ink shadow-[0_8px_30px_rgb(0_0_0/0.35)] transition-transform duration-500 ease-out group-hover/film:scale-110 sm:size-16">
              <Play width={22} height={22} className="translate-x-[1px]" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.9375rem] font-medium text-paper">Watch with sound</span>
              <span className="block text-sm text-paper/70">{film.title}</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

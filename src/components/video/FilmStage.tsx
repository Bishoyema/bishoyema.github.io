"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/site";
import { FilmPlayer, type FilmPlayerHandle } from "./FilmPlayer";

type FilmStageValue = {
  playerRef: RefObject<FilmPlayerHandle | null>;
  /** Current playback time of the full film, or null before it has been played. */
  time: number | null;
  setTime: (seconds: number) => void;
  playFrom: (seconds: number) => void;
};

const FilmStageContext = createContext<FilmStageValue | null>(null);

function useFilmStage() {
  const value = use(FilmStageContext);
  if (!value) throw new Error("Film stage components must be rendered inside <FilmStage>.");
  return value;
}

/** Connects one player with chapter / storyboard buttons rendered anywhere inside it. */
export function FilmStage({ children }: { children: ReactNode }) {
  const playerRef = useRef<FilmPlayerHandle | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const playFrom = useCallback((seconds: number) => playerRef.current?.playFrom(seconds), []);
  const value = useMemo(() => ({ playerRef, time, setTime, playFrom }), [time, playFrom]);
  return <FilmStageContext value={value}>{children}</FilmStageContext>;
}

export function StagePlayer(props: Omit<ComponentProps<typeof FilmPlayer>, "ref" | "onTime">) {
  const { playerRef, setTime } = useFilmStage();
  return <FilmPlayer {...props} ref={playerRef} onTime={setTime} />;
}

type ChapterButtonProps = {
  seconds: number;
  /** Start of the following chapter, used to highlight the chapter currently playing. */
  until?: number;
  className?: string;
  children: ReactNode;
};

export function ChapterButton({ seconds, until, className, children }: ChapterButtonProps) {
  const { time, playFrom } = useFilmStage();
  const active = time !== null && time >= seconds - 0.05 && (until === undefined || time < until - 0.05);
  return (
    <button
      type="button"
      onClick={() => playFrom(seconds)}
      aria-current={active ? "true" : undefined}
      data-active={active ? "" : undefined}
      className={cn("group/chapter", className)}
    >
      <span className="sr-only">Play from </span>
      {children}
    </button>
  );
}

export function PlayFilmButton({ className, children }: { className?: string; children: ReactNode }) {
  const { playFrom } = useFilmStage();
  return (
    <button type="button" onClick={() => playFrom(0)} className={className}>
      {children}
    </button>
  );
}

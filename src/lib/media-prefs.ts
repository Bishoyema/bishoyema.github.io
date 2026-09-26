/** Client-only helpers deciding whether silent previews may autoplay. */

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

/** Previews autoplay unless the visitor asked for reduced motion or data saving. */
export function canAutoplayPreviews(): boolean {
  return !prefersReducedMotion() && !prefersReducedData();
}

/** True on devices with a real hover-capable pointer (not touch). */
export function hasFinePointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

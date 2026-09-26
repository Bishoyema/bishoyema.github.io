import { useSyncExternalStore } from "react";
import { canAutoplayPreviews } from "./media-prefs";

/** Client-only hooks for browser state. Server render assumes "no" so markup is identical before hydration. */

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether silent previews may autoplay (respects reduced motion and data saver). */
export function useAutoplayAllowed(): boolean {
  return useSyncExternalStore(subscribeToMotionPreference, canAutoplayPreviews, () => false);
}

function subscribeToLoad(onChange: () => void) {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
}

/** True once the window `load` event has fired (all critical resources are in). */
export function usePageLoaded(): boolean {
  return useSyncExternalStore(subscribeToLoad, () => document.readyState === "complete", () => false);
}

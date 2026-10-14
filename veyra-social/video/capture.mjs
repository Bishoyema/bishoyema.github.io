// Captures the Veyra AI reel frame by frame from stage.html.
// Needs the portfolio built (`npm run build`) and served at http://localhost:4173 (`npm start`-style:
// `npx serve out -l 4173`), plus `ffmpeg` and the `playwright` package with Chromium.
// Usage: node veyra-social/video/capture.mjs <framesDir> [t1 t2 ...]   (times = test frames only)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const reelDir = path.join(root, "out", "_reel");
const framesDir = path.resolve(process.argv[2] ?? path.join(here, "frames"));
const testTimes = process.argv.slice(3).map(Number);
const FPS = 30;
const DURATION = 20;

// Serve the stage, its fonts and seekable WebM copies of the teasers next to the site.
mkdirSync(reelDir, { recursive: true });
mkdirSync(framesDir, { recursive: true });
copyFileSync(path.join(here, "stage.html"), path.join(reelDir, "stage.html"));
cpSync(path.join(root, "veyra-social", "src", "fonts"), path.join(reelDir, "fonts"), { recursive: true });
copyFileSync(path.join(root, "veyra-social", "src", "fonts.css"), path.join(reelDir, "fonts.css"));
for (const name of ["brand-film-teaser", "skincare-film-teaser", "serum-reel-teaser", "serum-ingredients-teaser"]) {
  const out = path.join(reelDir, `${name}.webm`);
  if (existsSync(out)) continue;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(root, "public", "media", "videos", `${name}.mp4`),
    "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "24", "-g", "4", "-row-mt", "1", out]);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("http://localhost:4173/_reel/stage.html", { waitUntil: "load" });
await page.waitForTimeout(2500);
console.log("setup", JSON.stringify(await page.evaluate(() => window.setupStage())));

const times = testTimes.length ? testTimes : Array.from({ length: FPS * DURATION }, (_, i) => i / FPS);
const started = Date.now();
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  await page.evaluate((time) => window.renderFrame(time), t);
  const name = testTimes.length ? `test_${t.toFixed(2)}.jpg` : `f_${String(i).padStart(4, "0")}.jpg`;
  await page.screenshot({ path: path.join(framesDir, name), type: "jpeg", quality: 93 });
  if (i % 60 === 0) console.log(`frame ${i}/${times.length} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
}
console.log("done", times.length, "frames in", ((Date.now() - started) / 1000).toFixed(0), "s");
await browser.close();

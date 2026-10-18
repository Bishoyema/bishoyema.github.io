// Captures the Veyra AI reel frame by frame from stage.html.
// Needs the portfolio built (`npm run build`) and served at http://localhost:4173
// (`npx serve out -l 4173`), plus the `playwright` package with Chromium.
// Usage: node veyra-social/video/capture.mjs <framesDir> [t1 t2 ...]   (times = single test frames, no blur)
// A full render resumes where an interrupted one stopped: earlier frames are replayed without
// saving, so scroll reveals inside the sites start at exactly the same moments.
// PREVIEW="from,to" (seconds) renders only that stretch, the same way.
//
// Fast moves are rendered as several sub-frames inside a 180° shutter and averaged later by
// blend.py, which gives natural motion blur instead of jumpy, strobing frames.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const reelDir = path.join(root, "out", "_reel");
const framesDir = path.resolve(process.argv[2] ?? path.join(here, "frames"));
const testTimes = process.argv.slice(3).map(Number);
const FPS = 30;
const DURATION = 30;
const SHUTTER = 0.5 / FPS;

// Serve the stage, fonts and character renders next to the site (same origin as the iframes).
mkdirSync(reelDir, { recursive: true });
mkdirSync(framesDir, { recursive: true });
copyFileSync(path.join(here, "stage.html"), path.join(reelDir, "stage.html"));
cpSync(path.join(root, "veyra-social", "src", "fonts"), path.join(reelDir, "fonts"), { recursive: true });
copyFileSync(path.join(root, "veyra-social", "src", "fonts.css"), path.join(reelDir, "fonts.css"));
cpSync(path.join(root, "veyra-social", "src", "character"), path.join(reelDir, "char"), { recursive: true });
// The concept sites play inside the laptop and the phone (build them first: npm run build in concepts/).
for (const name of ["oudelle", "wavy"]) {
  const src = path.join(root, "veyra-social", "concepts", name), dst = path.join(reelDir, "concepts", name);
  mkdirSync(dst, { recursive: true });
  for (const f of ["index.html", "style.css", "fonts.css", "concept.js"]) copyFileSync(path.join(src, f), path.join(dst, f));
  cpSync(path.join(src, "fonts"), path.join(dst, "fonts"), { recursive: true });
}

// Software WebGL so the concept site's 3D scene renders in headless Chromium.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(120000); // three software-rendered 3D scenes can make one screenshot slow
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("http://localhost:4173/_reel/stage.html", { waitUntil: "load" });
await page.waitForTimeout(2500);
console.log("setup", JSON.stringify(await page.evaluate(() => window.setupStage())));

const times = testTimes.length ? testTimes : Array.from({ length: FPS * DURATION }, (_, i) => i / FPS);
const frameBase = (i) => (testTimes.length ? `test_${times[i].toFixed(2)}` : `f_${String(i).padStart(4, "0")}`);
const samples = (t) => (testTimes.length ? 1 : page.evaluate((time) => window.samplesAt(time), t));
async function frameDone(i) {
  const n = await samples(times[i]);
  if (n === 1) return existsSync(path.join(framesDir, `${frameBase(i)}.jpg`));
  return existsSync(path.join(framesDir, `${frameBase(i)}.jpg`)) || Array.from({ length: n }, (_, k) => `${frameBase(i)}.sub${k}.png`).every((f) => existsSync(path.join(framesDir, f)));
}
async function shoot(file) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await page.screenshot({ path: file, type: file.endsWith(".png") ? "png" : "jpeg", ...(file.endsWith(".jpg") ? { quality: 94 } : {}) });
    } catch (e) {
      if (attempt === 3) throw e;
      console.error(`screenshot retry ${attempt}: ${e.message.split("\n")[0]}`);
    }
  }
}
const preview = (process.env.PREVIEW || "").split(",").map(Number);
let start = 0, stop = times.length;
if (preview.length === 2) [start, stop] = [Math.floor(preview[0] * FPS), Math.min(times.length, Math.ceil(preview[1] * FPS))];
if (!testTimes.length) while (start < stop && (await frameDone(start))) start++;
if (start) console.log(`resuming at frame ${start}`);
for (let i = 0; i < start; i++) await page.evaluate((time) => window.renderFrame(time), times[i]);
const started = Date.now();
for (let i = start; i < stop; i++) {
  const t = times[i];
  const n = await samples(t);
  for (let k = 0; k < n; k++) {
    const tk = n === 1 ? t : t + ((k + 0.5) / n - 0.5) * SHUTTER;
    await page.evaluate((time) => window.renderFrame(time), tk);
    await shoot(path.join(framesDir, n === 1 ? `${frameBase(i)}.jpg` : `${frameBase(i)}.sub${k}.png`));
  }
  if (i % 60 === 0) console.log(`frame ${i}/${times.length} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
}
console.log("done", times.length, "frames in", ((Date.now() - started) / 1000).toFixed(0), "s");
await browser.close();

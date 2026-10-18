// Captures the Veyra AI reel frame by frame from stage.html.
// Needs the portfolio built (`npm run build`) and served at http://localhost:4173
// (`npx serve out -l 4173`), plus the `playwright` package with Chromium.
// Usage: node veyra-social/video/capture.mjs <framesDir> [t1 t2 ...]   (times = single test frames, no blur)
//
// Fast moves are rendered as several sub-frames inside a 180° shutter and averaged later by
// blend.py, which gives natural motion blur instead of jumpy, strobing frames.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const reelDir = path.join(root, "out", "_reel");
const framesDir = path.resolve(process.argv[2] ?? path.join(here, "frames"));
const testTimes = process.argv.slice(3).map(Number);
const FPS = 30;
const DURATION = 28.5;
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
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("http://localhost:4173/_reel/stage.html", { waitUntil: "load" });
await page.waitForTimeout(2500);
console.log("setup", JSON.stringify(await page.evaluate(() => window.setupStage())));

const times = testTimes.length ? testTimes : Array.from({ length: FPS * DURATION }, (_, i) => i / FPS);
const started = Date.now();
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  const base = testTimes.length ? `test_${t.toFixed(2)}` : `f_${String(i).padStart(4, "0")}`;
  const n = testTimes.length ? 1 : await page.evaluate((time) => window.samplesAt(time), t);
  for (let k = 0; k < n; k++) {
    const tk = n === 1 ? t : t + ((k + 0.5) / n - 0.5) * SHUTTER;
    await page.evaluate((time) => window.renderFrame(time), tk);
    const name = n === 1 ? `${base}.jpg` : `${base}.sub${k}.png`;
    await page.screenshot({ path: path.join(framesDir, name), type: name.endsWith(".png") ? "png" : "jpeg", ...(name.endsWith(".jpg") ? { quality: 94 } : {}) });
  }
  if (i % 60 === 0) console.log(`frame ${i}/${times.length} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
}
console.log("done", times.length, "frames in", ((Date.now() - started) / 1000).toFixed(0), "s");
await browser.close();

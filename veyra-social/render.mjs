// Renders every post in src/posts.html to out/*.png (2160 x 2700, i.e. 1080 x 1350 at 2x)
// and the Instagram carousel to out/linkedin-carousel.pdf for a LinkedIn document post.
// Usage: node veyra-social/render.mjs   (needs the `playwright` package and Chromium)
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "out");
mkdirSync(outDir, { recursive: true });

const names = {
  "ig-1": "instagram-1-cover",
  "ig-2": "instagram-2-problem",
  "ig-3": "instagram-3-case-study",
  "ig-4": "instagram-4-results",
  "ig-5": "instagram-5-cta",
  fb: "facebook-post",
  li: "linkedin-post",
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.join(here, "src", "posts.html")).href, { waitUntil: "load" });
await page.waitForFunction(() => document.documentElement.dataset.ready === "1");

// Fail loudly if text spills out of a frame or overlaps another text block.
const issues = await page.evaluate(() => {
  const found = [];
  document.querySelectorAll(".frame").forEach((frame) => {
    const box = frame.getBoundingClientRect();
    frame.querySelectorAll("h1, h2, p, .swipe, .chip, .pill, .tag, .logo, .stat, .ring .label").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.left < box.left + 30 || r.right > box.right - 30 || r.top < box.top + 30 || r.bottom > box.bottom - 30) {
        found.push(`${frame.id}: "${el.textContent.trim().slice(0, 40)}" is outside the safe area`);
      }
    });
  });
  return found;
});
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
}

const files = [];
for (const [id, name] of Object.entries(names)) {
  const file = path.join(outDir, `${name}.png`);
  await page.locator(`#${id}`).screenshot({ path: file });
  files.push(file);
  console.log("wrote", path.relative(process.cwd(), file));
}

// LinkedIn document carousel: the five Instagram slides as a 5-page PDF.
const slides = files.slice(0, 5).map((f) => pathToFileURL(f).href);
const html = `<!doctype html><style>@page{size:1080px 1350px;margin:0}html,body{margin:0}img{display:block;width:1080px;height:1350px;break-after:page}</style>${slides.map((s) => `<img src="${s}">`).join("")}`;
const tmp = path.join(outDir, ".carousel.html");
writeFileSync(tmp, html);
const pdfPage = await browser.newPage();
await pdfPage.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await pdfPage.pdf({ path: path.join(outDir, "linkedin-carousel.pdf"), width: "1080px", height: "1350px", printBackground: true });
unlinkSync(tmp);
console.log("wrote", path.relative(process.cwd(), path.join(outDir, "linkedin-carousel.pdf")));

await browser.close();

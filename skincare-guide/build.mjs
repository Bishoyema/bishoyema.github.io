// Builds Skincare-Science-Essentials.pdf from src/guide.html with headless Chromium.
// Usage: node skincare-guide/build.mjs   (needs the `playwright` package)
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const source = pathToFileURL(path.join(here, "src", "guide.html")).href;
const output = process.argv[2] ?? path.join(here, "Skincare-Science-Essentials.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(source, { waitUntil: "load" });
await page.waitForFunction(() => document.documentElement.dataset.ready === "1");
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });

// Fail loudly if any page's content runs past its bottom margin or a font failed to load.
const report = await page.evaluate(() => {
  const mm = 96 / 25.4;
  const issues = [];
  document.querySelectorAll(".page").forEach((p, i) => {
    const limit = p.getBoundingClientRect().bottom - 14 * mm;
    let worst = 0;
    p.querySelectorAll("*").forEach((el) => {
      if (el.closest(".foot") || el.closest(".cover-top") || el.classList.contains("cover-bottom")) return;
      const b = el.getBoundingClientRect().bottom;
      if (b > limit) worst = Math.max(worst, b - limit);
    });
    if (worst > 0.5) issues.push(`page ${i + 1} overflows by ${(worst / mm).toFixed(1)}mm`);
  });
  const fonts = [...document.fonts].map((f) => `${f.family}:${f.status}`);
  return { issues, fonts, pages: document.querySelectorAll(".page").length };
});

console.log(`pages: ${report.pages}`);
console.log(`fonts: ${[...new Set(report.fonts)].join(", ")}`);
if (report.issues.length) console.log(`layout issues:\n  ${report.issues.join("\n  ")}`);

await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
await browser.close();
console.log(`wrote ${output}`);
if (report.issues.length) process.exitCode = 1;

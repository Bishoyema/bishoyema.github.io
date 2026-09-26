#!/usr/bin/env node
/**
 * Live site check: tests the PUBLIC website in a real Chrome browser.
 * Runs on GitHub's servers through the "Live site check" workflow
 * (Actions → Live site check → Run workflow → paste the site URL).
 *
 * Usage: node scripts/live-check.mjs <url> [<url> ...]
 * With several URLs, the first one that serves this portfolio is checked.
 * Locally, set CHROME_PATH to a Chrome/Chromium binary. Requires `playwright-core`
 * (the workflow installs it; it is not a project dependency).
 */
import { chromium } from "playwright-core";

const PROFILE = {
  email: "peshoyemad43@gmail.com",
  whatsapp: "https://wa.me/971562397680",
  linkedin: "https://www.linkedin.com/in/beshoy-emad-1063b02a9",
};
const PAGES = [
  "/",
  "/work/impactx-brand-film/",
  "/work/skincare-launch-ad/",
  "/work/impactx-brand-launch/",
  "/work/impactx-ai-video-launch/",
  "/work/impactx-ai-automation-launch/",
];
const FILES = ["/sitemap.xml", "/robots.txt", "/og.jpg", "/icon.svg", "/favicon.ico"];
const VIDEOS = ["brand-film.mp4", "brand-film-teaser.mp4", "skincare-film.mp4", "skincare-film-teaser.mp4"];

let failures = 0;
let warnings = 0;
const pass = (msg) => console.log(`PASS  ${msg}`);
const warn = (msg) => {
  warnings++;
  console.log(`WARN  ${msg}`);
};
const check = (condition, msg) => {
  if (condition) pass(msg);
  else {
    failures++;
    console.log(`FAIL  ${msg}`);
  }
};

async function servesPortfolio(url) {
  try {
    const response = await fetch(`${url}/`, { redirect: "follow" });
    return response.ok && (await response.text()).includes("Bishoy Emad");
  } catch {
    return false;
  }
}

const candidates = process.argv.slice(2).flatMap((arg) => arg.split(/[\s,]+/)).filter(Boolean).map((u) => u.replace(/\/+$/, ""));
if (!candidates.length) {
  console.error("Usage: node scripts/live-check.mjs <site-url>");
  process.exit(2);
}
let SITE = "";
for (const url of candidates) {
  if (await servesPortfolio(url)) {
    SITE = url;
    break;
  }
  console.log(`info  ${url} does not serve the portfolio (yet)`);
}
if (!SITE) {
  console.log("FAIL  none of the URLs serve the portfolio");
  process.exit(1);
}
console.log(`\nChecking ${SITE}\n`);

// ---------------------------------------------------------------- 1. Pages, files and videos over HTTP
for (const path of [...PAGES, ...FILES]) {
  const response = await fetch(SITE + path);
  check(response.status === 200, `GET ${path} → ${response.status}`);
}
for (const file of VIDEOS) {
  const url = `${SITE}/media/videos/${file}`;
  const head = await fetch(url, { method: "HEAD" });
  const size = Number(head.headers.get("content-length") ?? 0);
  const ranged = await fetch(url, { headers: { Range: "bytes=0-1" } });
  check(
    head.status === 200 && /video\/mp4/.test(head.headers.get("content-type") ?? "") && size > 100_000 && ranged.status === 206,
    `video ${file}: ${head.status}, ${head.headers.get("content-type")}, ${Math.round(size / 1024)} KB, byte ranges ${ranged.status === 206 ? "supported" : `NOT supported (${ranged.status})`}`,
  );
}
const missing = await fetch(`${SITE}/work/this-page-does-not-exist/`);
check(missing.status === 404, `unknown page returns 404 (${missing.status})`);

// ---------------------------------------------------------------- 2. External contact links
try {
  const wa = await fetch(PROFILE.whatsapp, { redirect: "manual" });
  if ([200, 301, 302, 303, 307, 308].includes(wa.status)) pass(`WhatsApp link responds (${wa.status}${wa.headers.get("location") ? ` → ${wa.headers.get("location").slice(0, 70)}` : ""})`);
  else warn(`WhatsApp link returned ${wa.status}; open ${PROFILE.whatsapp} on a phone to confirm`);
} catch (error) {
  warn(`WhatsApp link could not be reached from the checker (${error.message})`);
}
try {
  const li = await fetch(PROFILE.linkedin, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" } });
  if (li.status === 404) check(false, `LinkedIn profile not found (404): ${PROFILE.linkedin}`);
  else if (li.ok) pass(`LinkedIn profile responds (${li.status}, ${li.url.slice(0, 80)})`);
  else warn(`LinkedIn answered ${li.status} (LinkedIn blocks automated visitors); open the profile once in a browser to confirm`);
} catch (error) {
  warn(`LinkedIn could not be reached from the checker (${error.message})`);
}

// ---------------------------------------------------------------- 3. Real browser: desktop
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" });
const shots = {};

const videoState = (page, selector) =>
  page.$eval(selector, (v) => ({ src: v.currentSrc || "", paused: v.paused, muted: v.muted, time: v.currentTime, controls: v.controls }));
const waitForPlayback = (page, selector, minTime = 0.4) =>
  page
    .waitForFunction(([s, t]) => { const v = document.querySelector(s); return v && !v.paused && v.currentTime > t; }, [selector, minTime], { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${SITE}/`, { waitUntil: "load" });
  check((await page.locator("h1").textContent())?.includes("Bishoy"), "desktop: home page renders the headline");
  check(await waitForPlayback(page, "#top video"), "desktop: hero film preview plays");
  await page.waitForTimeout(1200);
  shots.desktop = (await page.screenshot({ type: "jpeg", quality: 45, scale: "css" })).toString("base64");

  for (const [label, id] of [["Work", "work"], ["Services", "services"], ["About", "about"], ["Contact", "contact"]]) {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: label }).click();
    await page.waitForTimeout(1400);
    const top = await page.$eval(`#${id}`, (el) => Math.round(el.getBoundingClientRect().top));
    check(top >= 0 && top < 160, `desktop: menu “${label}” scrolls to its section`);
  }

  await page.evaluate(() => document.querySelector("#showreel video").scrollIntoView({ block: "center", behavior: "instant" }));
  check(await waitForPlayback(page, "#showreel video"), "desktop: featured film preview plays when scrolled into view");
  await page.locator("#showreel").getByRole("button", { name: /Watch with sound/ }).first().click();
  const playing = await waitForPlayback(page, "#showreel video", 0.5);
  const film = await videoState(page, "#showreel video");
  check(playing && film.src.endsWith("brand-film.mp4") && !film.muted && film.controls, "desktop: “Watch with sound” plays the full brand film with sound and controls");
  await page.getByRole("button", { name: /^Play from 0:20/ }).click();
  await page.waitForTimeout(2000);
  const seek = await videoState(page, "#showreel video");
  check(seek.time >= 20 && seek.time < 26, `desktop: chapter 0:20 jumps the film (now at ${seek.time.toFixed(1)}s)`);

  await page.goto(`${SITE}/#contact`, { waitUntil: "load" });
  const contact = page.locator("#contact");
  check((await contact.getByRole("link", { name: /Email me/ }).getAttribute("href"))?.startsWith(`mailto:${PROFILE.email}`), `desktop: “Email me” opens an email to ${PROFILE.email}`);
  await contact.getByRole("button", { name: "AI video", exact: true }).click();
  const whatsappHref = await contact.getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
  check(whatsappHref?.startsWith(`${PROFILE.whatsapp}?text=`) && decodeURIComponent(whatsappHref).includes("ai video"), "desktop: WhatsApp button opens a chat with a pre-written message");
  check((await contact.getByRole("link", { name: /LinkedIn/ }).getAttribute("href")) === PROFILE.linkedin, "desktop: LinkedIn button points to the profile");

  await page.goto(`${SITE}/work/impactx-brand-film/`, { waitUntil: "load" });
  await page.getByRole("button", { name: /^Play from 0:30/ }).click();
  await page.waitForTimeout(2500);
  const frame = await videoState(page, "article video");
  check(!frame.paused && frame.time >= 30 && frame.time < 36, `desktop: case-study key frame plays the film from 0:30 (now at ${frame.time.toFixed(1)}s)`);

  check(errors.length === 0, `desktop: no browser errors${errors.length ? ` (${errors.slice(0, 3).join(" | ")})` : ""}`);
  await context.close();
}

// ---------------------------------------------------------------- 4. Real browser: phones and tablet
for (const device of [
  { name: "phone 390px", width: 390, height: 844 },
  { name: "small phone 360px", width: 360, height: 740 },
  { name: "tablet 820px", width: 820, height: 1180 },
]) {
  const context = await browser.newContext({ viewport: { width: device.width, height: device.height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${SITE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `${device.name}: page fits the screen (no sideways scrolling)`);

  const menu = page.getByRole("button", { name: "Open menu" });
  const box = await menu.boundingBox();
  check(box && box.width >= 44 && box.height >= 44, `${device.name}: menu button is visible and easy to tap`);
  await menu.tap();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await dialog.waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  check(await dialog.isVisible(), `${device.name}: menu opens`);
  await dialog.getByRole("link", { name: /Work/ }).tap();
  await page.waitForTimeout(1600);
  const top = await page.$eval("#work", (el) => Math.round(el.getBoundingClientRect().top));
  check(!(await dialog.isVisible().catch(() => false)) && top >= 0 && top < 160, `${device.name}: menu link closes the menu and goes to Work`);

  if (device.width === 390) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(600);
    shots.mobile = (await page.screenshot({ type: "jpeg", quality: 45, scale: "css" })).toString("base64");
    await page.evaluate(() => document.querySelectorAll("#ai-video video")[0].scrollIntoView({ block: "center", behavior: "instant" }));
    await page.locator("#ai-video").getByRole("button", { name: /Watch with sound.*ImpactX/ }).tap();
    check(await waitForPlayback(page, "#ai-video li:first-child video", 0.5), `${device.name}: tapping a film plays it`);
  }
  check(errors.length === 0, `${device.name}: no browser errors${errors.length ? ` (${errors.slice(0, 3).join(" | ")})` : ""}`);
  await context.close();
}

await browser.close();

// ---------------------------------------------------------------- Screenshots (base64 JPEG, for remote review)
for (const [name, data] of Object.entries(shots)) {
  console.log(`\n---SCREENSHOT ${name} BEGIN---`);
  for (let i = 0; i < data.length; i += 4000) console.log(data.slice(i, i + 4000));
  console.log(`---SCREENSHOT ${name} END---`);
}

console.log(`\nSite: ${SITE}`);
console.log(failures ? `RESULT: ${failures} check(s) failed, ${warnings} warning(s)` : `RESULT: all checks passed${warnings ? `, ${warnings} warning(s)` : ""}`);
// Set the exit code instead of calling process.exit(), which can cut off output still being written to a pipe.
process.exitCode = failures ? 1 : 0;

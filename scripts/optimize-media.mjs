#!/usr/bin/env node
/**
 * Builds the web-optimised media used by the site into public/media/.
 *
 * The original uploads at the repository root are only ever READ.
 * They are never modified, moved, renamed or deleted.
 *
 * Requirements: `sharp` (dev dependency) and `ffmpeg` on your PATH.
 * Usage:        npm run media
 *
 * Output (all committed, so deploys never need to run this):
 *   public/media/images/<name>-<width>.{avif,webp}  + <name>-<maxWidth>.jpg fallback
 *   public/media/videos/<film>.mp4                  byte-identical copy of the original film
 *   public/media/videos/<film>-teaser.mp4           short silent loop used for previews
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const IMAGES = path.join(root, "public/media/images");
const VIDEOS = path.join(root, "public/media/videos");

/** Campaign posters, 880×1168 originals. */
const posters = [
  { src: "35780.jpg", name: "impactx-key-visual" },
  { src: "35779.jpg", name: "impactx-ai-video-a" },
  { src: "35776.jpg", name: "impactx-ai-video-b" },
  { src: "35778.jpg", name: "impactx-automation-a" },
  { src: "35777.jpg", name: "impactx-automation-b" },
];

/** Poster frames supplied with the films, 480×854 originals. */
const filmPosters = [
  { src: "brand-story.jpg", name: "brand-film-poster" },
  { src: "skincare-ad.jpg", name: "skincare-film-poster" },
];

/**
 * Films. `teaser` lists [start, end] seconds stitched into a short silent loop.
 * Segments avoid on-screen text glitches in the source (brand film 0:42 and end card).
 * `stills` are frame grabs used for the storyboard / shot list in the case studies.
 */
const films = [
  {
    src: "brand-story.mp4",
    name: "brand-film",
    fps: 24,
    teaser: [
      [17.0, 19.3],
      [25.0, 28.0],
      [31.0, 33.5],
      [36.9, 40.0],
    ],
    stills: [6.5, 11.5, 18.0, 26.5, 33.0, 38.5, 46.0],
  },
  {
    src: "skincare-ad.mp4",
    name: "skincare-film",
    fps: 30,
    teaser: [
      [11.0, 13.4],
      [16.5, 18.9],
      [22.4, 25.4],
      [0.4, 3.4],
    ],
    stills: [2.0, 7.5, 12.0, 18.0, 24.5],
  },
];

async function writeResponsive(input, name, widths) {
  const max = Math.max(...widths);
  for (const width of widths) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });
    await base.clone().avif({ quality: 58, effort: 6 }).toFile(path.join(IMAGES, `${name}-${width}.avif`));
    await base.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(IMAGES, `${name}-${width}.webp`));
    if (width === max) {
      await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(IMAGES, `${name}-${width}.jpg`));
    }
  }
  console.log(`  image  ${name}  [${widths.join(", ")}]`);
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
}

function buildTeaser(input, output, segments, fps) {
  const parts = segments
    .map(([start, end], i) => `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`)
    .join(";");
  const inputs = segments.map((_, i) => `[v${i}]`).join("");
  const graph = `${parts};${inputs}concat=n=${segments.length}:v=1:a=0,fps=${fps},format=yuv420p[out]`;
  ffmpeg([
    "-i", input,
    "-filter_complex", graph,
    "-map", "[out]",
    "-an",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "30",
    "-profile:v", "high",
    "-level", "3.1",
    "-movflags", "+faststart",
    output,
  ]);
}

async function main() {
  mkdirSync(IMAGES, { recursive: true });
  mkdirSync(VIDEOS, { recursive: true });
  const scratch = mkdtempSync(path.join(tmpdir(), "portfolio-media-"));

  try {
    console.log("Posters");
    for (const p of posters) await writeResponsive(path.join(root, p.src), p.name, [440, 880]);

    console.log("Film posters");
    for (const p of filmPosters) await writeResponsive(path.join(root, p.src), p.name, [240, 480]);

    console.log("Films");
    for (const film of films) {
      const input = path.join(root, film.src);

      copyFileSync(input, path.join(VIDEOS, `${film.name}.mp4`));
      console.log(`  video  ${film.name}.mp4 (copy of ${film.src})`);

      const teaser = path.join(VIDEOS, `${film.name}-teaser.mp4`);
      buildTeaser(input, teaser, film.teaser, film.fps);
      console.log(`  video  ${film.name}-teaser.mp4`);

      const teaserFrame = path.join(scratch, `${film.name}-teaser.png`);
      ffmpeg(["-i", teaser, "-frames:v", "1", teaserFrame]);
      await writeResponsive(teaserFrame, `${film.name}-teaser-poster`, [240, 480]);

      for (const [i, t] of film.stills.entries()) {
        const frame = path.join(scratch, `${film.name}-${i}.png`);
        ffmpeg(["-ss", String(t), "-i", input, "-frames:v", "1", frame]);
        await writeResponsive(frame, `${film.name}-still-${i + 1}`, [240, 480]);
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

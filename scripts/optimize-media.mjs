#!/usr/bin/env node
/**
 * Builds the web-optimised media used by the site into public/media/.
 *
 * The original uploads at the repository root are only ever READ.
 * They are never modified, moved, renamed or deleted.
 *
 * Requirements: `sharp` (dev dependency) and `ffmpeg` on your PATH.
 * Usage:        npm run media               (everything)
 *               npm run media -- <name>     (only assets whose name contains <name>)
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

/**
 * The detailed automation poster shows a third-party app logo inside its mock chat interface.
 * The web copy covers it with a neutral "reply sent" icon drawn in the poster's own icon style
 * (thin ring, dark centre, white line icon). The original file is never changed.
 */
const neutralReplyIcon = (() => {
  const [cx, cy] = [580.5, 473.5];
  const [sx, sy] = [0.85, 1.05]; // the glass panel is seen in perspective
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="1168">
  <defs>
    <radialGradient id="g" cx="0.45" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#1f4a43"/>
      <stop offset="1" stop-color="#113b3a"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.7"/></filter>
  </defs>
  <ellipse cx="${cx}" cy="${cy}" rx="15.9" ry="22.2" fill="url(#g)" filter="url(#soft)"/>
  <g transform="translate(${cx - 12 * sx} ${cy - 12 * sy}) scale(${sx} ${sy})" fill="none" stroke="#dfe5e1" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 4.5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7l-4.5 3.5v-3.5H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z"/>
    <path d="m8.6 11.1 2.4 2.4 4.6-4.6"/>
  </g>
</svg>`;
})();

/** Campaign posters, 880×1168 originals. */
const posters = [
  { src: "35780.jpg", name: "impactx-key-visual" },
  { src: "35779.jpg", name: "impactx-ai-video-a" },
  { src: "35776.jpg", name: "impactx-ai-video-b" },
  { src: "35778.jpg", name: "impactx-automation-a", overlay: neutralReplyIcon },
  { src: "35777.jpg", name: "impactx-automation-b" },
];

/** The serum films are 1080×1920, so their frames also get a sharper 960 size. */
const HD_FRAME_WIDTHS = [240, 480, 960];

/** Poster frames supplied with the films, 480×854 originals (1080×1920 for the serum films). */
const filmPosters = [
  { src: "brand-story.jpg", name: "brand-film-poster" },
  { src: "skincare-ad.jpg", name: "skincare-film-poster" },
  { src: "serum-launch-reel.jpg", name: "serum-reel-poster", widths: HD_FRAME_WIDTHS },
  { src: "serum-ingredient-film.jpg", name: "serum-ingredients-poster", widths: HD_FRAME_WIDTHS },
];

/**
 * Films. `teaser` lists [start, end] seconds stitched into a short silent loop.
 * Segments avoid on-screen text glitches in the source (brand film 0:42 and end card).
 * `stills` are frame grabs used for the storyboard / shot list in the case studies.
 * Optional: `teaserWidth` scales the loop down (1080×1920 films preview at 720 wide),
 * `stillWidths` replaces the default [240, 480] still sizes.
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
  {
    src: "serum-launch-reel.mp4",
    name: "serum-reel",
    fps: 24,
    teaserWidth: 720,
    stillWidths: HD_FRAME_WIDTHS,
    teaser: [
      [1.0, 3.5],
      [5.2, 7.4],
      [8.6, 11.6],
      [15.3, 18.0],
    ],
    stills: [1.5, 6.5, 9.5, 11.5, 13.5, 17.5],
  },
  {
    src: "serum-ingredient-film.mp4",
    name: "serum-ingredients",
    fps: 24,
    teaserWidth: 720,
    stillWidths: HD_FRAME_WIDTHS,
    teaser: [
      [0.0, 2.1],
      [2.4, 3.4],
      [4.3, 5.3],
      [5.4, 8.1],
      [8.6, 10.5],
      [13.1, 15.0],
    ],
    stills: [1.25, 2.75, 5.0, 7.25, 10.125, 11.75, 14.0],
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

/** Original file, or an in-memory copy with the overlay applied (the original is only read). */
async function posterInput(poster) {
  const input = path.join(root, poster.src);
  if (!poster.overlay) return input;
  return sharp(input).composite([{ input: Buffer.from(poster.overlay), top: 0, left: 0 }]).png().toBuffer();
}

const only = process.argv[2];
const selected = (name) => !only || name.includes(only);

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
}

function buildTeaser(input, output, segments, fps, width) {
  const parts = segments
    .map(([start, end], i) => `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}]`)
    .join(";");
  const inputs = segments.map((_, i) => `[v${i}]`).join("");
  const scale = width ? `,scale=${width}:-2:flags=lanczos` : "";
  const graph = `${parts};${inputs}concat=n=${segments.length}:v=1:a=0,fps=${fps}${scale},format=yuv420p[out]`;
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
    for (const p of posters.filter((p) => selected(p.name))) await writeResponsive(await posterInput(p), p.name, [440, 880]);

    console.log("Film posters");
    for (const p of filmPosters.filter((p) => selected(p.name))) await writeResponsive(path.join(root, p.src), p.name, p.widths ?? [240, 480]);

    console.log("Films");
    for (const film of films.filter((f) => selected(f.name))) {
      const input = path.join(root, film.src);

      copyFileSync(input, path.join(VIDEOS, `${film.name}.mp4`));
      console.log(`  video  ${film.name}.mp4 (copy of ${film.src})`);

      const teaser = path.join(VIDEOS, `${film.name}-teaser.mp4`);
      buildTeaser(input, teaser, film.teaser, film.fps, film.teaserWidth);
      console.log(`  video  ${film.name}-teaser.mp4`);

      const teaserFrame = path.join(scratch, `${film.name}-teaser.png`);
      ffmpeg(["-i", teaser, "-frames:v", "1", teaserFrame]);
      await writeResponsive(teaserFrame, `${film.name}-teaser-poster`, [240, 480]);

      for (const [i, t] of film.stills.entries()) {
        const frame = path.join(scratch, `${film.name}-${i}.png`);
        ffmpeg(["-ss", String(t), "-i", input, "-frames:v", "1", frame]);
        await writeResponsive(frame, `${film.name}-still-${i + 1}`, film.stillWidths ?? [240, 480]);
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

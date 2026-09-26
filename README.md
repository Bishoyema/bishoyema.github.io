# Bishoy Emad: AI Creative & Digital Marketing portfolio

A premium, cinematic portfolio built to send to clients, agencies and recruiters.
Someone opening the link should know within ten seconds what you do, see the work
playing, and know how to contact you.

**Stack:** Next.js 16 (static export) · TypeScript · Tailwind CSS 4 · Motion (Framer Motion)

---

## Run it locally

Requires [Node.js](https://nodejs.org) 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000, live-reloads as you edit
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the finished static site into `out/` |
| `npm start` | Previews the finished build at http://localhost:3000 (run `npm run build` first) |
| `npm run lint` | Checks the code |
| `npm run typecheck` | Checks TypeScript types |
| `npm run media` | Regenerates the optimised images and videos (needs `ffmpeg`, see below). Add a name to redo one asset, e.g. `npm run media -- impactx-automation-a` |

## Deploy to Vercel (recommended)

1. Push this repository to GitHub (already done if you are reading this there).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. **Import** the `bishoyema.github.io` repository.
4. Vercel detects **Next.js** automatically. Leave every setting at its default and click **Deploy**.
5. Your site is live at `https://<project-name>.vercel.app` within a minute or two.
6. Optional: **Settings → Domains** to connect your own domain (for example `bishoyemad.com`).
   Then add an environment variable `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
   (**Settings → Environment Variables**) and redeploy, so social previews and the sitemap
   use your domain.

Every push to `main` redeploys automatically. Pull requests get their own preview links.

## Or: free hosting on GitHub Pages (https://bishoyema.github.io)

1. Merge this branch into `main`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Open **Actions → Build and deploy → Run workflow** once. After that, every push to `main` publishes automatically.

Until you switch the Pages source, GitHub Pages keeps serving your previous `index.html`,
so nothing breaks in the meantime. The same workflow also checks every push and pull
request (lint, types, build).

## Check the live site

**Actions → Live site check → Run workflow**, paste your public URL, and GitHub tests the
real site in Chrome: every page, the videos, phone and tablet layouts, the menu, and the
email, WhatsApp and LinkedIn buttons. A green tick means everything works.

---

## Editing content

All text lives in `src/data/`. You never need to touch the layout to change copy.

| File | What is in it |
| --- | --- |
| `src/data/profile.ts` | Name, role, intro, email, WhatsApp, LinkedIn, CV link, About text and stats |
| `src/data/projects.ts` | The five projects and their case studies |
| `src/data/services.ts` | Services, AI video formats, "Why work with me" |
| `src/data/capabilities.ts` | The Capabilities list |
| `src/data/certifications.ts` | Certifications |
| `src/data/media.ts` | Image/video registry and alt text |

### Adding a project

1. Add the source files, then list them in `scripts/optimize-media.mjs` and run `npm run media`.
2. Register the new images or film in `src/data/media.ts`.
3. Add an entry to `src/data/projects.ts`. Use `type: "Concept Project"` for self-initiated work.

The work grid, the case-study page (`/work/<slug>/`), the sitemap and the "next project"
links update automatically. Optional: add a 1200×630 `public/og/<slug>.jpg` social image;
otherwise the site-wide `public/og.jpg` is used.

## Project structure

```
src/
  app/              routes: layout + SEO, home page, /work/[slug] case studies, 404,
                    sitemap, robots, favicon/app icons
  sections/         home page sections (Hero, Showreel, SelectedWork, AIVideo, Services,
                    About, Capabilities, Certifications, WhyMe, Contact)
  components/       shared UI: Nav, Footer, Button, ResponsiveImage, Reveal, ...
    projects/       project card and case-study layout
    video/          FilmPlayer (films with sound), LoopVideo (silent previews),
                    FilmStage (chapter / key-frame buttons that drive a player)
  data/             all site content (see above)
  lib/              small helpers
public/
  media/images/     optimised AVIF/WebP/JPEG versions of your images and film frames
  media/videos/     your films (exact copies) + short silent teaser loops
  og.jpg, og/       social preview images (WhatsApp, LinkedIn, X, ...)
scripts/
  optimize-media.mjs   builds public/media from the original uploads
35776.jpg … index.html your original uploads: kept untouched, not part of the build
```

`AGENTS.md` / `CLAUDE.md` are notes for AI coding assistants (added by Next.js).

## How media is handled

- **Originals are never modified.** `npm run media` only reads the files at the repository
  root and writes new files into `public/media/` (requires `sharp`, installed with
  `npm install`, and [`ffmpeg`](https://ffmpeg.org) on your computer).
- **Images** are served as AVIF → WebP → JPEG in two sizes, with fixed dimensions, so pages
  never jump while loading.
- **Films** are byte-identical copies of your uploads (they were already web-ready).
  Each film also has a ~10-second **silent teaser loop** used for previews (hero, featured
  film, hover on work cards). The teasers skip two moments with AI text glitches (see below).
- **Nothing heavy loads up front:** the hero teaser starts only after the page has loaded,
  other previews only when scrolled into view, full films only when someone presses play.
  Autoplay is disabled for visitors who ask for reduced motion or data saving.

## Quality checks performed

- Production build, ESLint and TypeScript: clean.
- Automated browser tests (74 checks): navigation and active states, mobile menu
  (focus, Escape, background locked), hero and section CTAs, preview → full film with sound,
  chapter and key-frame seeking, one film at a time, pause when scrolled away, hover previews,
  contact topic pre-fill for email/WhatsApp, copy email, every internal link and anchor,
  404 handling, reduced-motion and no-JavaScript fallbacks.
- Layout checked at 360, 390, 820, 1366, 1440 and 1920px wide: no horizontal scrolling,
  no console errors, no failed requests.
- Lighthouse (mobile, slow 4G + 4× CPU throttling applied): Performance 97, Accessibility 100,
  Best Practices 100, SEO 100; LCP 1.9 s, CLS ≈ 0. Desktop: 100 across the board.

---

## Assets

### Used

| Original upload | Where it appears |
| --- | --- |
| `brand-story.mp4` (ImpactX brand film, 0:50) | Featured film with chapters, AI Video gallery, case study with 7 key frames, hero teaser, work card preview |
| `skincare-ad.mp4` (skincare launch ad, 0:26) | AI Video gallery, case study with 5 key frames, work card preview |
| `35780.jpg` "Your ads aren't failing" | Work card + case study |
| `35779.jpg` "30 Days of Content" (product-led) | Hero card, work card, case study (variant A), social image |
| `35776.jpg` "30 Days of Content" (lifestyle) | Case study (variant B) |
| `35778.jpg` "Your business doesn't sleep" (detailed) | Work card, case study (variant A). In the web copy, a small third-party app logo inside the mock-up is replaced with a neutral icon; the original file is unchanged |
| `35777.jpg` "Your business doesn't sleep" (4 steps) | Case study (variant B) |
| `brand-story.jpg` (poster frame) | Film poster in the AI Video gallery and case study |
| `skincare-ad.jpg` (poster frame) | Hero card, film poster in the AI Video gallery and case study |

### Not used, and why

| Asset | Reason |
| --- | --- |
| `index.html` (previous one-page site) | Replaced by the new site. Its facts (contact details, L'Oréal background, Google certification, project context) were reused as the source of truth. Kept untouched. |
| Brand film 0:42 and the end card, in teasers only | 0:42 shows garbled AI text ("15.23X ROBA") and the end card reads "SEE BEYOND THE OBVIOUT". The full film still plays unedited; only the short preview loops avoid these moments. |

No CV, certificate files, portrait or separate logos were included in the uploads. The site
is designed to work without them, and adding them is a one-line change (see TODO).

---

## TODO: content needed from Bishoy

- [ ] **Name spelling.** The site uses **Bishoy Emad** (per the brief). Your LinkedIn URL and
      previous site use "Beshoy". Use one spelling everywhere so recruiters can find you.
- [ ] **ImpactX.** Confirm the relationship (client, employer or your own brand) and that you
      may show the work. It is labelled "Brand Campaign" for ImpactX. If it was self-initiated,
      change `type` to `"Concept Project"` in `src/data/projects.ts`.
- [ ] **Certificates.** Add public credential links (`url` in `src/data/certifications.ts`) to show a
      "Verify" link, and confirm the Meta Social Media Marketing certificate is completed.
- [ ] **CV.** Add a PDF to `public/` and set `cvUrl` in `src/data/profile.ts` to show a
      "Download CV" button (important for job applications).
- [ ] **Results.** If you have real, shareable numbers or a client quote for ImpactX, add them to
      the case study. None are shown now, by design.
- [ ] **Optional:** a professional portrait for the About section.

## Recommended before publishing

1. **Fix the two text glitches in the brand film** (0:42 "ROBA" and the "OBVIOUT" end card),
   then replace the file and run `npm run media`. Creative directors notice these. Also make
   sure ImpactX can back up the on-screen ROAS figure at 0:42. The site copy does not repeat it.
2. **Export sharper sources:** films at 1080×1920 (currently 480×854) and posters at 2×
   (1760×2336) so the work looks crisp on phones and retina laptops. Then run `npm run media`.
3. **Add 3 to 5 more pieces**, ideally beauty and e-commerce product videos, a social post series,
   and any automation or landing page you have built, to back up every service listed.
4. **Connect a custom domain** on Vercel and set `NEXT_PUBLIC_SITE_URL`.
5. **Test the links from your phone:** open the site from WhatsApp and LinkedIn, tap WhatsApp
   and Email in the contact section, and check the pre-filled messages.
6. **Optional:** add Vercel Analytics to see when recruiters or clients open your portfolio.

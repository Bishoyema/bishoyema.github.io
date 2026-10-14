# Veyra AI social posts: website case study

Instagram carousel, Facebook post and LinkedIn post that promote Veyra AI's website
service, using the portfolio site in this repository as the case study.

- **Ready to post:** `out/` (PNG images and a PDF carousel)
- **Captions, alt text and sources for every number:** [`captions.md`](captions.md)
- **Reel with music:** `out/veyra-website-reel.mp4` (20 s, 1080 × 1920). How it was made and how to rebuild it: [`video/README.md`](video/README.md)

## Editing and re-rendering

All seven designs live in one page, `src/posts.html` (shared styles in `src/base.css`).
Open it in a browser to preview, edit the text, then re-render:

```bash
node veyra-social/render.mjs
```

This needs the `playwright` package and its Chromium (`npm i -D playwright && npx playwright install chromium`
if you don't have them). It writes the PNGs and `linkedin-carousel.pdf` to `out/`, and stops with an
error if any text is placed outside a frame's safe area.

`src/shots/` holds the screenshots of the portfolio used in the device mock-ups (desktop at
1440px, mobile at 390px, both taken from the production build). Fonts are bundled in
`src/fonts/` (SIL Open Font License).

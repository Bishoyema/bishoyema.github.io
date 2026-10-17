# Oudelle: concept website

An original concept site for a fictional Dubai perfume house, made by Veyra AI to show clients
the kind of motion and 3D work we can build. Oudelle is not a real brand and this is not a
client project. It plays inside the laptop and the phone in `../out/veyra-website-reel.mp4`.

What it shows:

- **3D product hero:** a glass bottle (Three.js, physical glass material with an amber liquid,
  gold collar and foil label) that floats, turns and follows the scroll.
- **Scroll-driven story:** the bottle moves to a new place in each section; text reveals as it
  enters the screen.
- **Interactive collection:** three bottles rise onto pedestals with their names and prices.
- **Kinetic type:** marquee rows that move with time and scroll.
- **SEO and accessibility basics:** a descriptive title and meta description, canonical link,
  Open Graph and Twitter tags, Organization and Product structured data, one H1 and labelled
  controls. Lighthouse 12: SEO 100, Accessibility 100, Best Practices 100 on desktop and mobile.
- **Responsive:** its own mobile layout below 700px, with the 3D scene re-staged for portrait.

## Run it

```bash
cd veyra-social/concept-site
npm install
npm run build            # bundles src/main.js (with Three.js) into concept.js
npx serve . -l 4180      # then open http://localhost:4180
```

`concept.js` is committed so the folder also works as a static site without a build.

`window.CONCEPT` lets the reel drive the page frame by frame: `manual()` stops the animation
loop, and `frame(time, intro)` draws the page for a given time (the scroll position comes from
the page itself). `?dpr=2` sets the 3D canvas's pixel ratio.

Fonts: Cormorant Garamond, Inter and JetBrains Mono, bundled in `fonts/` (SIL Open Font
License, see `fonts/LICENSE.txt`).

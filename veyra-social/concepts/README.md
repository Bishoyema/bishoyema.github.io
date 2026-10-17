# Concept websites

Two original concept sites made by Veyra AI to show clients the kind of motion and 3D work we
can build. Both brands are fictional; neither is a client project. They play inside the laptop
and the phone in `../out/veyra-website-reel.mp4`.

## Oudelle (`oudelle/`): perfume house, Dubai

- **3D product hero:** a glass bottle (Three.js, physical glass material with an amber liquid,
  gold collar and foil label) that floats, turns and follows the scroll.
- **Scroll-driven story:** the bottle moves to a new place in each section; text reveals as it
  enters the screen.
- **Interactive collection:** three bottles rise onto pedestals with their names and prices.
- **Kinetic type:** marquee rows that move with time and scroll.
- **SEO and accessibility basics:** a descriptive title and meta description, canonical link,
  Open Graph and Twitter tags, Organization and Product structured data, one H1 and labelled
  controls. Lighthouse 12: SEO 100, Accessibility 100, Best Practices 100 on desktop and mobile.

## Halo Residences (`halo/`): residential tower, Dubai Marina

- **A tower that builds itself:** an 88-floor tower (Three.js) that twists 90° from base to
  crown. On load the floors rise into place from the ground up, their windows light, and the
  halo rings at the crown switch on.
- **Scroll-driven camera:** each section frames the tower differently: hero, residences, a
  close-up of the crown, an aerial view, and the enquiry form.
- **Residence cards, counters and an animated map:** floor plans with prices, a 90° counter, and
  routes that draw themselves from the tower to the beach, the Palm and the airport.
- **SEO basics:** title and meta description, canonical link, Open Graph and Twitter tags,
  Organization and ApartmentComplex structured data, one H1 and labelled form fields.

Both sites have their own mobile layout below 700px, with the 3D scene re-staged for portrait.

## Run them

```bash
cd veyra-social/concepts
npm install
npm run build            # bundles each site's src/main.js (with Three.js) into its concept.js
npx serve . -l 4180      # then open http://localhost:4180/oudelle/ or /halo/
```

The `concept.js` bundles are committed, so both folders also work as static sites without a build.

`window.CONCEPT` lets the reel drive a page frame by frame: `manual()` stops the animation loop,
and `frame(time, intro)` draws the page for a given time (the scroll position comes from the
page itself). `?dpr=2` sets the 3D canvas's pixel ratio.

Fonts are bundled in each `fonts/` folder (SIL Open Font License, see `fonts/LICENSE.txt`):
Cormorant Garamond, Inter and JetBrains Mono for Oudelle; Syne, Inter and JetBrains Mono for Halo.

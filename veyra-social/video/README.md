# Veyra AI website reel (with music)

`../out/veyra-website-reel.mp4`: a 20-second vertical reel (1080 × 1920, 30 fps) with the
Veyra AI character, a moving 3D concept website on a laptop and a phone, an SEO section, and the
real Veyra AI logo. Made for Instagram Reels, TikTok and Facebook Reels.

The website in the reel is **Oudelle** (`../concept-site/`), an original concept site for a
fictional Dubai perfume house, built by Veyra AI to show the kind of motion work we can do: a
3D glass bottle that follows the scroll, scroll-driven sections, an interactive collection and
kinetic type. It is a demo, not a client project, and the reel says so ("Concept website").

Brand assets come from Veyra AI's own files: the logo vectors from the Canva "Logo System
(Contrast VA)" (`../src/brand/`), and the Embodied VA character renders from the
"Veyra Character Directions" page (`../src/character/`).

## What happens on the beat

115 BPM in F major, matched to the reference reel's tempo (114.8 BPM), key centre and warm,
bass-led mood. One beat is 0.522 s.

| Beat (time) | Picture | Sound |
| --- | --- | --- |
| 0–4 (0–2.1 s) | The character wakes up: violet seams light top to bottom (beat 1), the eye bar flickers on (beat 2). "Your website has 3 seconds." | Warm pad and Rhodes, power-up swell, eye clicks, celesta ping |
| 4 (2.09 s) | Drop: hard cut to the laptop, the Oudelle site wipes on and its hero animates in. "Websites that move." | Drums and bass enter, crash |
| 6, 8, 10 | The site scrolls: the 3D bottle moves to the notes, then the collection (three bottles on pedestals), then the kinetic-type section. Chips: 3D product hero, Scroll-driven story, Interactive collection, Kinetic type | Whoosh into each landing, a tick per chip |
| 12, 13, 14 | The character turns to camera: side, three-quarter, front, one view per beat. "We make them count." | Three stop-time hits, one per cut, snare roll into 16 |
| 16 (8.35 s) | A large phone springs up with the same site; its page scrolls to the collection on 18. "Perfect on every screen." | Whoosh and a soft sub thump as it lands |
| 20–23.5 | SEO: "oud perfume dubai" is typed into a search bar, the site's real title and meta description appear as the search result (21), then four checks: title + meta description, Product schema, Open Graph, mobile-friendly with one H1. "Built to be found." | A key click per letter, a whoosh for the result, four rising ticks |
| 24, 25, 26 | Google Lighthouse rings fill to 100: SEO, Accessibility, Best Practices | Celesta notes E, G, A |
| 28–31 | Back to the character, "Fast. Findable. Built to win.", then a rush into the eye bar | Build, snare roll, one beat of drop-out |
| 32 (16.70 s) | The VA mark snaps together on the hit, the violet line draws, then VEYRA AI, AI Creative Studio, DM us "WEBSITE", @veyra_aistudio | Impact, final F major chord, celesta arpeggio |
| to 20 s | Logo holds | The chord rings out to silence by the last frame |

The Lighthouse scores shown are the concept site's own results from Lighthouse 12 (desktop and
mobile: SEO 100, Accessibility 100, Best Practices 100). Performance is not shown: it can only
be measured fairly on a real GPU, and the test machine renders WebGL in software.

No vocals or voice-over. The music is an original arrangement written for this reel and played
on the MuseScore General soundfont (MIT licence) through FluidSynth, so it needs no licence.

## Rebuilding

```bash
(cd veyra-social/concept-site && npm install && npm run build)   # the concept site bundle
npm run build && npx serve out -l 4173                            # in one terminal
veyra-social/video/build.sh                                       # in another
```

- `stage.html`: the animated scene. It frames the concept site in a laptop and a phone (iframes),
  and `renderFrame(t)` sets every element for time `t`, including the site's scroll position
  and its 3D scene (`window.CONCEPT.frame`), so every frame is exact.
- `capture.mjs`: drives the stage frame by frame in Chromium (WebGL through SwiftShader). Fast
  moves are captured as five sub-frames each, and `blend.py` averages them into natural motion blur.
- `music2.py`: writes the score, renders each instrument with FluidSynth, mixes it with
  Pedalboard and adds the sound design on the same beat grid.
- `build.sh`: runs everything and muxes the MP4 (H.264 + AAC, about -14 LUFS, peaks under -1 dBFS).

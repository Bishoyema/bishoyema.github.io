# Veyra AI website reel (with music)

`../out/veyra-website-reel.mp4`: a 28.5-second vertical reel (1080 × 1920, 30 fps) with the
Veyra AI character, three websites on a laptop and a phone, an SEO section, and the real Veyra
AI logo. Made for Instagram Reels, TikTok and Facebook Reels.

The websites in the reel:

- **Oudelle** and **WAVY** (`../concepts/`): two original concept sites built by Veyra AI to show
  the kind of motion work we can do, a perfume house with a 3D glass bottle and a sparkling
  energy drink with 3D cans and colour wipes. They are demos, not client projects, and the reel
  says so ("Concept website").
- **ImpactX**: the portfolio site in this repository, with the ImpactX brand film featured on
  the home page and the "Your Ads Aren't Failing" case-study page.

Brand assets come from Veyra AI's own files: the logo vectors from the Canva "Logo System
(Contrast VA)" (`../src/brand/`), and the Embodied VA character renders from the
"Veyra Character Directions" page (`../src/character/`).

## What happens on the beat

115 BPM in F major, matched to the reference reel's tempo (114.8 BPM), key centre and warm,
bass-led mood. One beat is 0.522 s.

| Beat (time) | Picture | Sound |
| --- | --- | --- |
| 0–4 (0–2.1 s) | The character wakes up: violet seams light top to bottom (beat 1), the eye bar flickers on (beat 2). "Your website has 3 seconds." | Warm pad and Rhodes, power-up swell, eye clicks, celesta ping |
| 4 (2.09 s) | Drop: hard cut to the laptop, the Oudelle site wipes on and its hero animates in, and a phone slides in beside it with the same site's mobile layout. From here to beat 32 the phone always shows the laptop's site and scrolls with it. "Websites that move." | Drums and bass enter, crash |
| 6, 8, 10 | Oudelle scrolls: the 3D bottle moves to the notes, the collection (three bottles on pedestals), then the kinetic-type section | Whoosh into each landing, a tick per chip |
| 12, 13, 14 | The character turns to camera: side, three-quarter, front, one view per beat. "We make them count." | Three stop-time hits, one per cut, snare roll into 16 |
| 16 (8.35 s) | Cut to the laptop with the portfolio site: the hero, then the ImpactX brand film (18). "Built for real brands." | Crash, whoosh |
| 20, 22 | The screen swipes to the ImpactX "Your Ads Aren't Failing" case-study page, which scrolls to the campaign poster | Swipe, whoosh |
| 24 (12.52 s) | The screen swipes to WAVY: the lime can drops in spinning and lands on 25, bursting out lime slices and ice. "Any industry. Any idea." | Swipe, a falling swish, a metal clink and fizz on 25, a lead motif comes in |
| 26, 28, 30 | WAVY scrolls: an orange colour wipe to Mango Wave, a purple one to Berry Blast, then the three cans line up over the counters | Whoosh into each landing |
| 32 (16.70 s) | A large phone springs up with Oudelle, then swipes to WAVY on 34, whose can lands on 35. "Perfect on every screen." | Whoosh and a soft sub thump as it lands, a swipe, fizz |
| 36–39.5 | SEO: "oud perfume dubai" is typed into a search bar, Oudelle's real title and meta description appear as the search result (37), then four checks: title + meta description, Product schema, Open Graph, mobile-friendly with one H1. "Built to be found." | A key click per letter, a whoosh for the result, four rising ticks |
| 40, 41, 42 | Google Lighthouse rings fill to 100: SEO, Accessibility, Best Practices | Celesta notes E, G, A |
| 44–47 | Back to the character, "Fast. Findable. Built to win.", then a rush into the eye bar | Build, snare roll, one beat of drop-out |
| 48 (25.04 s) | The VA mark snaps together on the hit, the violet line draws, then VEYRA AI, AI Creative Studio, DM us "WEBSITE", @veyra_aistudio | Impact, final F major chord, celesta arpeggio |
| to 28.5 s | Logo holds | The chord rings out to silence by the last frame |

The Lighthouse scores shown are Oudelle's own results from Lighthouse 12 (desktop and
mobile: SEO 100, Accessibility 100, Best Practices 100). Performance is not shown: it can only
be measured fairly on a real GPU, and the test machine renders WebGL in software.

No vocals or voice-over. The music is an original arrangement written for this reel and played
on the MuseScore General soundfont (MIT licence) through FluidSynth, so it needs no licence.

## Rebuilding

```bash
(cd veyra-social/concepts && npm install && npm run build)       # the concept site bundles
npm run build && npx serve out -l 4173                            # in one terminal
veyra-social/video/build.sh                                       # in another
```

- `stage.html`: the animated scene. It frames the three sites in a laptop and phones (iframes),
  and `renderFrame(t)` sets every element for time `t`, including each site's scroll position,
  the concept sites' 3D scenes (`window.CONCEPT.frame`) and the portfolio's animations, so
  every frame is exact.
- `capture.mjs`: drives the stage frame by frame in Chromium (WebGL through SwiftShader). Fast
  moves are captured as five sub-frames each, and `blend.py` averages them into natural motion blur.
- `music2.py`: writes the score, renders each instrument with FluidSynth, mixes it with
  Pedalboard and adds the sound design on the same beat grid.
- `build.sh`: runs everything and muxes the MP4 (H.264 + AAC, about -14 LUFS, peaks under -1 dBFS).

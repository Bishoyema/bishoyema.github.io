# Veyra AI website reel (with music)

`../out/veyra-website-reel.mp4`: a 20-second vertical reel (1080 × 1920, 30 fps) with the
Veyra AI character, the portfolio website as the case study, and the real Veyra AI logo.
Made for Instagram Reels, TikTok and Facebook Reels.

Brand assets come from Veyra AI's own files: the logo vectors from the Canva "Logo System
(Contrast VA)" (`../src/brand/`), and the Embodied VA character renders from the
"Veyra Character Directions" page (`../src/character/`).

## What happens on the beat

115 BPM in F major, matched to the reference reel's tempo (114.8 BPM), key centre and warm,
bass-led mood. One beat is 0.522 s.

| Beat (time) | Picture | Sound |
| --- | --- | --- |
| 0–4 (0–2.1 s) | The character wakes up: violet seams light top to bottom (beat 1), the eye bar flickers on (beat 2). "Your website has 3 seconds." | Warm pad and Rhodes, power-up swell, eye clicks, celesta ping |
| 4 (2.09 s) | Drop: cut to the laptop, the website wipes on | Drums and bass enter, crash |
| 8, 9, 10 | The character turns to camera: side, three-quarter, front, one view per beat. "We make them count." | Three stop-time hits, one per cut |
| 12, 14, 16, 18 | Website tour: scrolls land on Featured film, Selected work, the case studies; cut to Services | Whoosh into each landing |
| 20, 22 | Phone slides in, then cuts to the WhatsApp contact section | Panned whoosh |
| 24–27 | Four Lighthouse 100 rings, one per beat | Celesta notes E, G, A, C |
| 28–31 | Back to the character, "Fast. Findable. Built to win.", then a rush into the eye bar | Build, snare roll, one beat of drop-out |
| 32 (16.70 s) | The VA mark snaps together on the hit, the violet line draws, then VEYRA AI, AI Creative Studio, DM us "WEBSITE", @veyra_aistudio | Impact, final F major chord, celesta arpeggio |
| to 20 s | Logo holds | The chord rings out to silence by the last frame |

No vocals or voice-over. The music is an original arrangement written for this reel and played
on the MuseScore General soundfont (MIT licence) through FluidSynth, so it needs no licence.

## Rebuilding

```bash
npm run build && npx serve out -l 4173   # in one terminal
veyra-social/video/build.sh              # in another
```

- `stage.html`: the animated scene. It frames the real site in a laptop and a phone (iframes),
  and `renderFrame(t)` sets every element for time `t`.
- `capture.mjs`: drives the stage frame by frame in Chromium. Fast moves are captured as six
  sub-frames each, and `blend.py` averages them into natural motion blur.
- `music2.py`: writes the score, renders each instrument with FluidSynth, mixes it with
  Pedalboard and adds the sound design on the same beat grid.
- `build.sh`: runs everything and muxes the MP4 (H.264 + AAC, about -14 LUFS, peaks under -1 dBFS).

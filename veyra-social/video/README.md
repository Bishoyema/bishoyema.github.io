# Veyra AI website reel (with music)

`../out/veyra-website-reel.mp4`: a 20-second vertical reel (1080 × 1920, 30 fps) of the
portfolio website, with an original soundtrack mixed in. Made for Instagram Reels, TikTok and
Facebook Reels.

## What happens on the beat

The music is 115 BPM in F major, matched to the reference reel's tempo (measured at 114.8 BPM),
key centre and warm, bass-led mood. One beat is 0.522 s and every move lands on the grid:

| Beat (time) | Picture | Sound |
| --- | --- | --- |
| 0 (0.00 s) | Laptop settles, website wipes on, "Your website has 3 seconds." | Power-on chime, swish, muffled groove |
| 2 → 4 (1.04–2.09 s) | Camera pushes into the hero film card | Whoosh, then the drop: drums open up |
| 4, 8 (2.09, 4.17 s) | The character: head turn, then the arm gesture | UI ticks, soft crash on the gesture |
| 10 → 11.6 | Pull back out | Reverse whoosh |
| 12, 14, 16, 18 | Scroll lands on Featured film, Selected work, AI video, Services | Whoosh into each landing |
| 20, 22 | Phone slides in, then scrolls to the WhatsApp contact section | Panned whoosh, ticks |
| 24–27 (12.5–14.1 s) | Four Lighthouse 100 rings, one per beat | Tuned blips (E, G, A, C) |
| 28–31 | "Fast. Findable. Built to win." then a rush into the screen | Riser, snare roll, one beat of drop-out |
| 32 (16.70 s) | Veyra logo reveal, then "AI Creative Studio" and "DM us WEBSITE" | Impact, final F major chord, bell arpeggio |
| 17.7–20 s | Logo holds | Chord rings out to silence by the last frame |

No vocals or voice-over. The whole soundtrack is synthesised in `music.py` (drums, bass,
electric piano, pad, plucks, bells and the sound effects), so it is original and needs no licence.

## Rebuilding

```bash
npm run build && npx serve out -l 4173   # in one terminal
veyra-social/video/build.sh              # in another
```

- `stage.html`: the animated scene. It frames the real site in a laptop and a phone (iframes),
  and its `renderFrame(t)` sets every element for time `t`.
- `capture.mjs`: drives the stage frame by frame in Chromium. The film previews are swapped for
  WebM copies and seeked to the exact frame, so the picture never drifts from the music.
- `music.py`: composes and mixes the soundtrack on the same beat grid.
- `build.sh`: runs all three and muxes the MP4 (H.264 + AAC, about -14 LUFS).

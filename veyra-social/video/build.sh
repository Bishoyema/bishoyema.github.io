#!/usr/bin/env bash
# Builds veyra-social/out/veyra-website-reel.mp4: 1080x1920, 30 fps, 28.5 s, music mixed in.
# Needs: the site built (npm run build) and served on port 4173 (npx serve out -l 4173), the
# concept sites built (npm run build in veyra-social/concepts),
# ffmpeg, Node with the `playwright` package, fluidsynth with the MuseScore General soundfont
# (apt: fluidsynth musescore-general-soundfont-lossless), and Python 3 with numpy, scipy,
# soundfile, pretty_midi, pedalboard and Pillow.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
work="${WORK_DIR:-$(mktemp -d)}"
out="$here/../out/veyra-website-reel.mp4"

python3 "$here/music2.py" "$work/music.wav"
# Bring the mix to about -14 LUFS with true peaks under -1 dBFS (Instagram / TikTok targets).
ffmpeg -v error -y -i "$work/music.wav" -af "volume=3.2dB,alimiter=limit=0.85:attack=4:release=60:level=disabled" \
  -c:a pcm_s24le "$work/music_master.wav"

node "$here/capture.mjs" "$work/frames"
python3 "$here/blend.py" "$work/frames"

ffmpeg -v error -y -framerate 30 -i "$work/frames/f_%04d.jpg" -i "$work/music_master.wav" \
  -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$out"
echo "wrote $out"

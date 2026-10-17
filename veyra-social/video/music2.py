#!/usr/bin/env python3
"""Soundtrack v2 for the Veyra AI reel: an original arrangement played on real instrument
samples (FluidSynth + the MuseScore General soundfont, MIT licence), mixed with Pedalboard.

115 BPM, F major, 20 s, on the same beat grid as stage.html:
  0-4   character wakes up: pad + Rhodes, seams light (beat 1), eye flickers on (beat 2)
  4     drop: drums and bass enter as the concept website wipes onto the laptop
  4-12  website tour: groove, scroll whooshes land on 6, 8, 10
  12-14 the character turns to camera: three stop-time hits, one per cut; snare roll into 16
  16-20 the phone springs up on 16, its page scrolls on 18
  20-28 SEO: typing clicks, the search result lands on 21, four checklist ticks (22-23.5),
        then one celesta note per Lighthouse ring (24, 25, 26)
  28-31 back to the character, build and snare roll, one beat of drop-out
  32    logo hit: impact, final F major chord, celesta arpeggio; rings out to silence by 20 s

Usage: python3 music2.py out.wav
Needs: fluidsynth, the MuseScore General soundfont (SF2 env var to override the path),
numpy, scipy, soundfile, pretty_midi and pedalboard.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
import pretty_midi
import soundfile as sf
from pedalboard import Chorus, Compressor, Delay, HighpassFilter, HighShelfFilter, Limiter, LowpassFilter, Pedalboard, Reverb
from scipy import signal

SR = 48000
BPM = 115
B = 60 / BPM
DUR = 20.0
N = int(SR * DUR)
SF2 = os.environ.get("SF2", "/usr/share/sounds/sf2/MuseScore_General_Full.sf2")
rng = np.random.default_rng(32)


def sec(beats):
    return beats * B


# ------------------------------------------------------------------ score
PROGRAMS = {  # stem: (GM program, drum kit?)
    "pad": (89, False),      # Warm Pad
    "strings": (49, False),  # Strings Slow
    "ep": (4, False),        # Tine Electric Piano
    "bass": (33, False),     # Fingered Bass
    "vib": (11, False),      # Vibraphone
    "celesta": (8, False),
    "lead": (5, False),      # FM Electric Piano
    "drums": (25, True),     # TR-808 kit
    "cymbals": (0, True),    # Standard kit (crash)
}
score = {k: [] for k in PROGRAMS}


def note(stem, start, length, pitch, vel):
    score[stem].append((start, length, pitch, vel))


FMAJ9 = (41, [57, 60, 64, 67])
AM7 = (45, [55, 60, 64, 69])
BBMAJ9 = (34, [57, 60, 62, 65])
CSUS = (36, [55, 60, 65, 67])
C = (36, [55, 60, 64, 67])
# (start beat, length, chord) for bars 0-7, then the final chord at 32.
HARMONY = [(0, 4, FMAJ9), (4, 4, FMAJ9), (8, 4, AM7), (12, 4, BBMAJ9), (16, 2, CSUS), (18, 2, C),
           (20, 4, FMAJ9), (24, 4, AM7), (28, 2, BBMAJ9), (30, 1, C)]
STABS = (12, 13, 14)

for start, length, (root, chord) in HARMONY:
    intro = start < 4
    # Pad under everything; strings join after the stop-time turn.
    for m in chord:
        note("pad", start, length + 0.05, m, 74 if intro else 62)
        if start >= 16:
            note("strings", start, length + 0.05, m + 12, 46)
    # Rhodes: one soft chord in the intro, stabs on the turn, syncopated comping elsewhere.
    if intro:
        for m in chord:
            note("ep", 0, 3.6, m, 68)
    elif start == 12:
        for b in STABS:
            for m in chord:
                note("ep", b, 0.45, m, 92)
    else:
        for hit, hl, vel in ((0, 1.3, 74), (1.5, 1.2, 62), (3.0, 0.9, 64)):
            if hit < length:
                for m in chord:
                    note("ep", start + hit, min(hl, length - hit), m, vel)
    # Bass.
    if not intro:
        if start == 12:
            for b in STABS:
                note("bass", b, 0.45, root, 104)
            note("bass", 15.5, 0.45, root + 7, 92)
        else:
            for hit, hl, octv in ((0, 0.85, 0), (1.5, 0.4, 0), (2.0, 0.9, 0), (3.5, 0.4, 12)):
                if hit < length and start + hit < 31:
                    note("bass", start + hit, min(hl, length - hit), root + octv, 100 if hit == 0 else 88)
    # Vibraphone arpeggio, eighth notes (starts with the eye at beat 2, rests during the stabs).
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    for e in range(int(length * 2)):
        b = start + e / 2
        if b < 2 or 12 <= b < 14.5 or b >= 31:
            continue
        note("vib", b, 0.5, chord[arp[int(b * 2) % 8]] + 12, 66 if e % 2 == 0 else 54)

# Celesta accents: eye (2), turn (12, 13, 14), rings (24, 25, 26), logo (32+).
for b, m, v in [(2, 84, 70), (2, 89, 58), (12, 81, 72), (13, 84, 72), (14, 89, 80),
                (24, 88, 84), (25, 91, 84), (26, 93, 88),
                (32, 77, 92), (32.25, 81, 88), (32.5, 84, 88), (32.75, 89, 92), (33, 96, 70), (34, 89, 66), (34, 93, 60)]:
    note("celesta", b, 1.5, m, v)

# Counter-melody over the SEO shot and the build (resolves into the logo).
for b, l, m in [(20, 1.5, 84), (21.5, 0.5, 81), (22, 1, 79), (23, 1, 77), (24, 1.5, 76), (25.5, 0.5, 79),
                (26, 2, 81), (28, 1.5, 86), (29.5, 0.5, 84), (30, 1, 81)]:
    note("lead", b, l, m, 70)

# Final chord on the logo hit.
for m in [53, 57, 60, 64, 67, 72]:
    note("pad", 32, 3.2, m, 70)
    note("strings", 32, 3.2, m + 12, 56)
    note("ep", 32, 3.0, m, 86)
note("bass", 32, 3.0, 29, 110)

# Drums (TR-808): kick, clap, hats, shaker, rolls.
KICK, SNARE, CLAP, CH, OH, SHAKER = 36, 38, 39, 42, 46, 70
kicks = []
for bar in range(1, 8):
    s0 = bar * 4
    for b in range(4):
        beat_ = s0 + b
        if bar == 3:
            continue
        if bar == 7 and b == 3:
            continue
        if b in (0, 2):
            kicks.append(beat_)
        if b == 1 and bar >= 4:
            kicks.append(beat_ + 0.5)
        if b in (1, 3) and not (bar == 7 and b >= 2):
            note("drums", beat_, 0.25, CLAP, 96)
        for s16 in range(4):
            t16 = beat_ + s16 / 4 + (0.03 if s16 % 2 else 0)
            if s16 % 2 == 0:
                open_ = s16 == 2 and b == 3 and bar >= 5
                note("drums", t16, 0.25, OH if open_ else CH, 52 if s16 == 2 else 36)
            if bar >= 2:
                note("drums", t16, 0.1, SHAKER, 28 if s16 % 2 else 20)
kicks += list(STABS) + [15.5, 32]
for k in kicks:
    note("drums", k, 0.4, KICK, 120 if k in STABS or k == 32 else 104)
for b in STABS:
    note("drums", b, 0.25, CLAP, 108)
for i in range(4, 8):  # shaker in the intro
    note("drums", i / 2, 0.1, SHAKER, 24 + 3 * i)
for k in range(8):  # rolls into the phone (16) and into the drop-out
    note("drums", 15 + k / 8, 0.1, SNARE, 50 + 7 * k)
    note("drums", 30 + k / 8, 0.1, SNARE, 50 + 8 * k)
for b, v in [(4, 92), (12, 84), (16, 78), (20, 70), (28, 76), (32, 118)]:
    note("cymbals", b, 2.0, 49, v)


# ------------------------------------------------------------------ render
def render(stem):
    program, drum = PROGRAMS[stem]
    pm = pretty_midi.PrettyMIDI(initial_tempo=BPM)
    inst = pretty_midi.Instrument(program=program, is_drum=drum)
    for start, length, pitch, vel in score[stem]:
        inst.notes.append(pretty_midi.Note(velocity=int(vel), pitch=int(pitch), start=sec(start), end=sec(start + length)))
    inst.notes.append(pretty_midi.Note(velocity=1, pitch=0 if not drum else 31, start=DUR - 0.06, end=DUR - 0.01))  # keep the tail
    pm.instruments.append(inst)
    with tempfile.TemporaryDirectory() as d:
        mid, wav = os.path.join(d, "s.mid"), os.path.join(d, "s.wav")
        pm.write(mid)
        subprocess.run(["fluidsynth", "-ni", "-R", "0", "-C", "0", "-g", "0.5", "-r", str(SR), "-O", "float",
                        "-F", wav, SF2, mid], check=True, capture_output=True)
        x, sr = sf.read(wav, dtype="float32", always_2d=True)
    assert sr == SR
    out = np.zeros((N, 2), dtype=np.float32)
    n = min(N, len(x))
    out[:n] = x[:n]
    return out


stems = {k: render(k) for k in PROGRAMS}


# ------------------------------------------------------------------ sound design
def tvec(seconds):
    return np.arange(int(seconds * SR)) / SR


def place(buf, x, start, gain=1.0, pan=0.0):
    if x.ndim == 1:
        a = np.pi / 4 * (pan + 1)
        x = np.stack([x * np.cos(a), x * np.sin(a)], axis=1) * np.sqrt(2)
    i = int(round(start * SR))
    j = min(N, i + len(x))
    if j > i:
        buf[i:j] += x[: j - i] * gain


def swept_noise(dur, f0, f1, peak=0.8, q=1.3):
    t = tvec(dur)
    x = rng.standard_normal(len(t))
    out = np.zeros_like(x)
    zi = np.zeros(2)
    blk = 256
    nb = int(np.ceil(len(x) / blk))
    for k in range(nb):
        f = f0 * (f1 / f0) ** (k / max(1, nb - 1))
        b, a = signal.iirpeak(min(f, SR * 0.45), q, fs=SR)
        seg = x[k * blk:(k + 1) * blk]
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[k * blk:k * blk + len(seg)] = y
    p = t / dur
    env = np.where(p < peak, (p / peak) ** 2, np.exp(-(p - peak) / (1 - peak + 1e-6) * 4))
    return out * env


def tick(freq, length=0.12):
    t = tvec(length)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 45) * (1 - np.exp(-t * 3000))


sfx = np.zeros((N, 2), dtype=np.float32)
# Seams light (beat 1 -> 2): soft rising power-up.
t = tvec(sec(1.1))
f = 220 * (4 ** (t / t[-1]))
up = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / t[-1]) ** 1.5 * np.exp(-np.maximum(0, t - sec(1)) * 20)
place(sfx, up * 0.5 + 0.6 * swept_noise(sec(1.1), 800, 7000, peak=0.95), sec(1) - 0.05, 0.05)
# Eye flicker (beat 2): tiny electric clicks matching the picture.
for d in (0, 0.05, 0.1, 0.16):
    c = signal.lfilter(*signal.butter(2, 3000, "highpass", fs=SR), rng.standard_normal(int(0.012 * SR))) * np.exp(-tvec(0.012) * 400)
    place(sfx, c, sec(2) - 0.03 + d, 0.05, pan=0.2)
# Transitions: drop (4), scroll landings (6, 8, 10), turn cuts (12, 13, 14), phone (16),
# phone scroll (18), cut to SEO (20).
place(sfx, swept_noise(0.6, 300, 5000, peak=0.85), sec(4) - 0.5, 0.06)
for k, b in enumerate((6, 8, 10)):
    place(sfx, swept_noise(0.55, 350, 4200, peak=0.85), sec(b) - 0.48, 0.05, pan=-0.3 if k % 2 else 0.3)
for b in (12, 13, 14):
    place(sfx, swept_noise(0.22, 1500, 6000, peak=0.6), sec(b) - 0.12, 0.03, pan=-0.3 + 0.3 * (b - 12))
place(sfx, swept_noise(0.6, 400, 3000, peak=0.85), sec(16) - 0.5, 0.05, pan=0.6)
t = tvec(0.6)  # the phone lands: a soft sub thump under the kick
place(sfx, np.sin(2 * np.pi * np.cumsum(42 + 30 * np.exp(-t * 12)) / SR) * np.exp(-t * 7) * (1 - np.exp(-t * 900)), sec(16), 0.12)
place(sfx, swept_noise(0.6, 350, 4200, peak=0.85), sec(18) - 0.53, 0.045, pan=-0.3)
place(sfx, swept_noise(0.3, 600, 5000, peak=0.8), sec(20) - 0.24, 0.035)
for b in (4.25, 6, 8, 10, 16.25, 18):  # annotation chips
    place(sfx, tick(2093), sec(b), 0.02, pan=0.15)
# SEO: one key click per typed letter (same timing as the stage), the result lands on 21,
# then a rising tick per checklist item.
QUERY = "oud perfume dubai"
k0, k1 = sec(20.15), sec(21) - 0.05
hp = signal.butter(2, 2500, "highpass", fs=SR)
for i in range(1, len(QUERY) + 1):
    c = signal.lfilter(*hp, rng.standard_normal(int(0.018 * SR))) * np.exp(-tvec(0.018) * 260)
    place(sfx, c + 0.3 * tick(1800 + 300 * rng.random(), 0.018), k0 + (i - 0.5) / len(QUERY) * (k1 - k0), 0.035, pan=rng.uniform(-0.25, 0.25))
place(sfx, swept_noise(0.32, 500, 4500, peak=0.75), sec(21) - 0.22, 0.04, pan=-0.2)
for i, freq in enumerate((2093, 2349, 2637, 2794)):
    place(sfx, tick(freq, 0.2), sec(22 + i * 0.5), 0.03, pan=-0.2 + 0.4 * (i % 2))
# Rush into the eye (30.9 -> 32) and reverse swell.
place(sfx, swept_noise(sec(1.1), 300, 9000, peak=0.98), sec(30.9), 0.06)
t = tvec(sec(1))
swell = signal.lfilter(*signal.butter(2, 1500, "highpass", fs=SR), rng.standard_normal(len(t))) * (t / t[-1]) ** 3
place(sfx, swell, sec(31), 0.08)
# Logo hit: sub drop and a soft low burst; shimmer as the violet line draws.
t = tvec(1.8)
sub = np.sin(2 * np.pi * np.cumsum(34 + 26 * np.exp(-t * 3)) / SR) * np.exp(-t * 2.2)
burst = signal.lfilter(*signal.butter(2, 900, "lowpass", fs=SR), rng.standard_normal(len(t))) * np.exp(-t * 10)
place(sfx, np.tanh(1.2 * sub) + 0.4 * burst, sec(32), 0.32)
place(sfx, swept_noise(0.4, 2500, 12000, peak=0.5), sec(32) + 0.18, 0.025)

# ------------------------------------------------------------------ mix
kick_env = np.ones(N, dtype=np.float32)
for k in kicks:
    i = int(sec(k) * SR)
    t = tvec(0.4)
    g = 1 - np.exp(-t / 0.12) * (1 - np.exp(-t / 0.004))
    j = min(N, i + len(g))
    kick_env[i:j] = np.minimum(kick_env[i:j], g[: j - i])


def duck(x, depth):
    return x * (1 - depth * (1 - kick_env))[:, None]


def fx(x, board):
    return board(x.T.copy(), SR).T[:N]


GAIN = {"pad": 0.55, "strings": 0.45, "ep": 0.9, "bass": 1.1, "vib": 0.55, "celesta": 0.6, "lead": 0.55, "drums": 0.9, "cymbals": 0.25}
mix = np.zeros((N, 2), dtype=np.float32)
mix += GAIN["pad"] * duck(fx(stems["pad"], Pedalboard([HighpassFilter(160), Reverb(room_size=0.78, damping=0.5, wet_level=0.32, dry_level=0.8)])), 0.35)
mix += GAIN["strings"] * duck(fx(stems["strings"], Pedalboard([HighpassFilter(220), Reverb(room_size=0.82, wet_level=0.34, dry_level=0.75)])), 0.3)
mix += GAIN["ep"] * duck(fx(stems["ep"], Pedalboard([Chorus(rate_hz=0.6, depth=0.15, mix=0.25), Reverb(room_size=0.55, damping=0.55, wet_level=0.22, dry_level=0.85)])), 0.12)
mix += GAIN["bass"] * duck(fx(stems["bass"], Pedalboard([LowpassFilter(1800), Compressor(threshold_db=-20, ratio=3, attack_ms=5, release_ms=120)])), 0.35)
mix += GAIN["vib"] * fx(stems["vib"], Pedalboard([Delay(delay_seconds=0.75 * B, feedback=0.28, mix=0.22), Reverb(room_size=0.6, wet_level=0.25, dry_level=0.85)]))
mix += GAIN["celesta"] * fx(stems["celesta"], Pedalboard([Reverb(room_size=0.72, wet_level=0.35, dry_level=0.8)]))
mix += GAIN["lead"] * fx(stems["lead"], Pedalboard([Chorus(rate_hz=0.8, depth=0.2, mix=0.3), Reverb(room_size=0.6, wet_level=0.26, dry_level=0.85)]))
mix += GAIN["drums"] * fx(stems["drums"], Pedalboard([Compressor(threshold_db=-16, ratio=2.5, attack_ms=3, release_ms=80), Reverb(room_size=0.3, wet_level=0.08, dry_level=1.0)]))
mix += GAIN["cymbals"] * fx(stems["cymbals"], Pedalboard([HighpassFilter(500), Reverb(room_size=0.6, wet_level=0.2, dry_level=0.9)]))
mix += fx(sfx, Pedalboard([Reverb(room_size=0.5, wet_level=0.15, dry_level=0.9)]))

master = Pedalboard([HighpassFilter(28), HighShelfFilter(cutoff_frequency_hz=8000, gain_db=-1.5),
                     Compressor(threshold_db=-18, ratio=2, attack_ms=15, release_ms=150), Limiter(threshold_db=-1.5, release_ms=100)])
peak = np.abs(mix).max()
mix = fx(mix / peak * 0.7, master)
tt = np.arange(N) / SR
mix *= (np.clip((DUR - 0.04 - tt) / 1.3, 0, 1) ** 1.5)[:, None]

out = sys.argv[1] if len(sys.argv) > 1 else "veyra-reel-music.wav"
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_24")
print("wrote", out, "peak", float(np.abs(mix).max()))

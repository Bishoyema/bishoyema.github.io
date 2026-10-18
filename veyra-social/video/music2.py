#!/usr/bin/env python3
"""Soundtrack for the Veyra AI reel: an original arrangement played on real instrument
samples (FluidSynth + the MuseScore General soundfont, MIT licence), mixed with Pedalboard.

115 BPM, F major, 45 s, on the same beat grid as stage.html. Every website page holds a full
bar (4 beats, 2.1 s), and scrolls and swipes take about a second, so nothing rushes.
  0-8   character wakes up: pad + Rhodes, seams light (beat 1), eye flickers on (beat 2)
  8     drop: drums and bass enter as the Oudelle concept site lands on the laptop and phone
  8-20  Oudelle: one bar per page, scroll whooshes land on 12, 16
  20-28 the character turns to camera: stop-time hits on 20 and 24 (one per view); roll into 28
  28-40 ImpactX case study: the portfolio scrolls to the film on 32, swipes to the case page on 36
  40-56 WAVY: swipe in on 40, the can falls and lands on 42 with a clink and fizz, colour-wipe
        scrolls land on 44, 48, 52; a lead motif comes in
  56-64 the phone springs up on 56, swipes from Oudelle to WAVY on 60, its can lands on 62
  64-76 SEO: typing clicks, the search result lands on 66, four checklist ticks (67-69.25),
        then one celesta note per Lighthouse ring (71, 72, 73)
  76-79 back to the character, build and snare roll, one beat of drop-out
  80    logo hit: impact, final F major chord, celesta arpeggio; rings out to silence by 45 s

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
DUR = 45.0
N = int(SR * DUR)
SF2 = os.environ.get("SF2", "/usr/share/sounds/sf2/MuseScore_General_Full.sf2")
rng = np.random.default_rng(32)
LOGO = 80       # beat of the logo hit
DROP_OUT = 79   # the beat of silence before it


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
DM7 = (38, [57, 60, 62, 65])
CSUS = (36, [55, 60, 65, 67])
C = (36, [55, 60, 64, 67])
# (start beat, length, chord) up to the logo; the final chord is added at LOGO.
HARMONY = [(0, 4, FMAJ9), (4, 4, DM7),                  # intro
           (8, 4, FMAJ9), (12, 4, AM7), (16, 4, BBMAJ9),  # Oudelle
           (20, 4, DM7), (24, 4, BBMAJ9),                 # stop-time turn
           (28, 4, FMAJ9), (32, 4, AM7), (36, 4, BBMAJ9), # ImpactX
           (40, 4, FMAJ9), (44, 4, AM7), (48, 4, DM7), (52, 4, BBMAJ9),  # WAVY
           (56, 4, CSUS), (60, 4, C),                     # phone
           (64, 4, FMAJ9), (68, 4, AM7), (72, 4, DM7),    # SEO
           (76, 2, BBMAJ9), (78, 1, C)]                   # finale, then the drop-out
INTRO = 8
STABS = (20, 24)        # one hit per view of the turn
TURN = (20, 28)

for start, length, (root, chord) in HARMONY:
    intro = start < INTRO
    turn = TURN[0] <= start < TURN[1]
    # Pad under everything; strings join after the turn.
    for m in chord:
        note("pad", start, length + 0.05, m, 74 if intro else 62)
        if start >= TURN[1]:
            note("strings", start, length + 0.05, m + 12, 46)
    # Rhodes: soft chords in the intro, a stab and an echo per view of the turn, comping elsewhere.
    if intro:
        for m in chord:
            note("ep", start, 3.6, m, 68 if start == 0 else 60)
    elif turn:
        for m in chord:
            note("ep", start, 0.45, m, 92)
            note("ep", start + 2, 0.4, m, 64)
    else:
        for hit, hl, vel in ((0, 1.3, 74), (1.5, 1.2, 62), (3.0, 0.9, 64)):
            if hit < length:
                for m in chord:
                    note("ep", start + hit, min(hl, length - hit), m, vel)
    # Bass.
    if not intro:
        if turn:
            note("bass", start, 0.45, root, 104)
            if start == TURN[1] - 4:
                note("bass", TURN[1] - 0.5, 0.45, root + 7, 92)
        else:
            for hit, hl, octv in ((0, 0.85, 0), (1.5, 0.4, 0), (2.0, 0.9, 0), (3.5, 0.4, 12)):
                if hit < length and start + hit < DROP_OUT:
                    note("bass", start + hit, min(hl, length - hit), root + octv, 100 if hit == 0 else 88)
    # Vibraphone arpeggio, eighth notes (starts with the eye at beat 2, rests through most of the turn).
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    for e in range(int(length * 2)):
        b = start + e / 2
        if b < 2 or TURN[0] <= b < TURN[1] - 1.5 or b >= DROP_OUT:
            continue
        note("vib", b, 0.5, chord[arp[int(b * 2) % 8]] + 12, 66 if e % 2 == 0 else 54)

# Celesta accents: eye (2), the turn (20, 24), rings (71, 72, 73), logo.
L = LOGO
for b, m, v in [(2, 84, 70), (2, 89, 58), (20, 81, 74), (22, 84, 58), (24, 86, 78), (26, 89, 60),
                (71, 88, 84), (72, 91, 84), (73, 93, 88),
                (L, 77, 92), (L + 0.25, 81, 88), (L + 0.5, 84, 88), (L + 0.75, 89, 92), (L + 1, 96, 70), (L + 2, 89, 66), (L + 2, 93, 60)]:
    note("celesta", b, 1.5, m, v)

# Lead: a motif over the WAVY site, then the counter-melody over SEO and the build.
for b, l, m in [(40, 1, 72), (41, 1, 76), (42, 2, 79), (44, 1, 76), (45, 1, 79), (46, 2, 84),
                (48, 1, 81), (49, 1, 79), (50, 2, 77), (52, 1, 74), (53, 1, 77), (54, 2, 81),
                (64, 1.5, 84), (65.5, 0.5, 81), (66, 1, 79), (67, 1, 77), (68, 1.5, 76), (69.5, 0.5, 79),
                (70, 2, 81), (72, 1.5, 84), (73.5, 0.5, 81), (74, 2, 77),
                (76, 1.5, 86), (77.5, 0.5, 84), (78, 1, 81)]:
    note("lead", b, l, m, 70)

# Final chord on the logo hit.
for m in [53, 57, 60, 64, 67, 72]:
    note("pad", L, 3.2, m, 70)
    note("strings", L, 3.2, m + 12, 56)
    note("ep", L, 3.0, m, 86)
note("bass", L, 3.0, 29, 110)

# Drums (TR-808): kick, clap, hats, shaker, rolls, from the drop to the drop-out; the turn is stop-time.
KICK, SNARE, CLAP, CH, OH, SHAKER = 36, 38, 39, 42, 46, 70
LAST = LOGO // 4 - 1
kicks = []
for bar in range(INTRO // 4, LOGO // 4):
    s0 = bar * 4
    if TURN[0] <= s0 < TURN[1]:
        continue
    for b in range(4):
        beat_ = s0 + b
        if bar == LAST and b == 3:
            continue
        if b in (0, 2):
            kicks.append(beat_)
        if b == 1 and beat_ >= TURN[1]:
            kicks.append(beat_ + 0.5)
        if b in (1, 3) and not (bar == LAST and b >= 2):
            note("drums", beat_, 0.25, CLAP, 96)
        for s16 in range(4):
            t16 = beat_ + s16 / 4 + (0.03 if s16 % 2 else 0)
            if s16 % 2 == 0:
                open_ = s16 == 2 and b == 3 and beat_ >= TURN[1]
                note("drums", t16, 0.25, OH if open_ else CH, 52 if s16 == 2 else 36)
            if beat_ >= 12:
                note("drums", t16, 0.1, SHAKER, 28 if s16 % 2 else 20)
kicks += list(STABS) + [TURN[1] - 0.5, LOGO]
for k in kicks:
    note("drums", k, 0.4, KICK, 120 if k in STABS or k == LOGO else 104)
for b in STABS:
    note("drums", b, 0.25, CLAP, 108)
for i in range(8, 16):  # shaker builds through the second half of the intro
    note("drums", i / 2, 0.1, SHAKER, 18 + 2 * i)
for k in range(8):  # rolls into the ImpactX cut (28) and into the drop-out
    note("drums", TURN[1] - 1 + k / 8, 0.1, SNARE, 50 + 7 * k)
    note("drums", DROP_OUT - 1 + k / 8, 0.1, SNARE, 50 + 8 * k)
for b, v in [(8, 92), (20, 84), (28, 80), (40, 74), (56, 78), (64, 70), (76, 76), (LOGO, 118)]:
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


def thump(gain_t=0.6):
    t = tvec(gain_t)
    return np.sin(2 * np.pi * np.cumsum(42 + 30 * np.exp(-t * 12)) / SR) * np.exp(-t * 7) * (1 - np.exp(-t * 900))


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
# Full-frame cuts: drop (8), ImpactX (28), SEO (64).
place(sfx, swept_noise(0.6, 300, 5000, peak=0.85), sec(8) - 0.5, 0.06)
place(sfx, swept_noise(0.6, 300, 5000, peak=0.85), sec(28) - 0.5, 0.05, pan=-0.2)
place(sfx, swept_noise(0.3, 600, 5000, peak=0.8), sec(64) - 0.24, 0.035)
# Scroll landings on the laptop: Oudelle (12, 16), ImpactX (32), WAVY (44, 48, 52).
for k, b in enumerate((12, 16, 32, 44, 48, 52)):
    place(sfx, swept_noise(1.05, 300, 3800, peak=0.88), sec(b) - 0.95, 0.045, pan=-0.3 if k % 2 else 0.3)
# In-screen swipes: case page (36), WAVY (40), WAVY on the phone (60).
for k, b in enumerate((36, 40, 60)):
    place(sfx, swept_noise(0.85, 700, 6000, peak=0.85), sec(b) - 0.78, 0.04, pan=0.4 if k % 2 else -0.4)
# The turn: one swish per cut.
for b in STABS:
    place(sfx, swept_noise(0.3, 1200, 6000, peak=0.6), sec(b) - 0.16, 0.035, pan=-0.3 if b == STABS[0] else 0.3)
# The phone lands (56): whoosh and a soft sub thump under the kick.
place(sfx, swept_noise(0.9, 400, 3000, peak=0.7), sec(56) - 0.55, 0.05, pan=0.6)
place(sfx, thump(), sec(56), 0.1)
# The WAVY can drops (40 -> 42) and lands on the beat: a falling swish, a metal clink, then fizz.
def clink():
    t = tvec(0.4)
    return sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * d) for fr, a, d in ((1180, 1, 14), (2870, 0.6, 20), (4710, 0.4, 28))) * (1 - np.exp(-t * 4000))


def fizz(dur):
    t = tvec(dur)
    hiss = signal.lfilter(*signal.butter(2, 5000, "highpass", fs=SR), rng.standard_normal(len(t))) * 0.35
    crackle = (rng.random(len(t)) < 0.004) * rng.standard_normal(len(t)) * 2.5
    return (hiss + crackle) * np.exp(-t * 3.2) * (1 - np.exp(-t * 60))


place(sfx, swept_noise(sec(2), 5000, 600, peak=0.95), sec(40), 0.03)
place(sfx, clink() * 0.5 + 0.6 * thump(0.4), sec(42), 0.06)
place(sfx, fizz(1.4), sec(42) + 0.02, 0.05, pan=0.15)
place(sfx, clink() * 0.3, sec(62), 0.04)
place(sfx, fizz(1.0), sec(62) + 0.02, 0.035, pan=-0.15)
CHIPS = (8.25, 12, 16, 28.25, 32, 36, 40.25, 44, 48, 52, 56.25, 60)
for b in CHIPS:  # annotation chips
    place(sfx, tick(2093), sec(b), 0.02, pan=0.15)
# SEO: one key click per typed letter (same timing as the stage), the result lands on 66,
# then a rising tick per checklist item.
QUERY = "oud perfume dubai"
k0, k1 = sec(64.4), sec(66) - 0.1
hp = signal.butter(2, 2500, "highpass", fs=SR)
for i in range(1, len(QUERY) + 1):
    c = signal.lfilter(*hp, rng.standard_normal(int(0.018 * SR))) * np.exp(-tvec(0.018) * 260)
    place(sfx, c + 0.3 * tick(1800 + 300 * rng.random(), 0.018), k0 + (i - 0.5) / len(QUERY) * (k1 - k0), 0.035, pan=rng.uniform(-0.25, 0.25))
place(sfx, swept_noise(0.5, 500, 4500, peak=0.75), sec(66) - 0.35, 0.04, pan=-0.2)
for i, freq in enumerate((2093, 2349, 2637, 2794)):
    place(sfx, tick(freq, 0.2), sec(67 + i * 0.75), 0.03, pan=-0.2 + 0.4 * (i % 2))
# Rush into the eye (78.9 -> 80) and reverse swell.
place(sfx, swept_noise(sec(1.1), 300, 9000, peak=0.98), sec(LOGO - 1.1), 0.06)
t = tvec(sec(1))
swell = signal.lfilter(*signal.butter(2, 1500, "highpass", fs=SR), rng.standard_normal(len(t))) * (t / t[-1]) ** 3
place(sfx, swell, sec(DROP_OUT), 0.08)
# Logo hit: sub drop and a soft low burst; shimmer as the violet line draws.
t = tvec(1.8)
sub = np.sin(2 * np.pi * np.cumsum(34 + 26 * np.exp(-t * 3)) / SR) * np.exp(-t * 2.2)
burst = signal.lfilter(*signal.butter(2, 900, "lowpass", fs=SR), rng.standard_normal(len(t))) * np.exp(-t * 10)
place(sfx, np.tanh(1.2 * sub) + 0.4 * burst, sec(LOGO), 0.32)
place(sfx, swept_noise(0.4, 2500, 12000, peak=0.5), sec(LOGO) + 0.18, 0.025)

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

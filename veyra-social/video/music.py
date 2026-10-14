#!/usr/bin/env python3
"""Original score and sound design for the Veyra AI website reel.

115 BPM, 4/4, F major, 20 seconds. Everything is synthesised here, so the track is
original and free to use. The beat grid is the same one stage.html animates to:
the website reveal (beat 0), push-in (2-4), the character's gesture (8), scroll
landings (12, 14, 16, 18, 22), phone reveal (20), Lighthouse rings (24-27),
build (28-31) and the logo hit (32).

Usage: python3 music.py out.wav   (needs numpy, scipy and soundfile)
"""
import sys

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
BPM = 115
B = 60 / BPM
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(115)


def sec(beats):
    return beats * B


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tvec(seconds):
    return np.arange(int(seconds * SR)) / SR


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, sig, start, gain=1.0, pan=0.0):
        if sig.ndim == 1:
            a = np.pi / 4 * (pan + 1)
            sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1) * np.sqrt(2)
        i = int(round(start * SR))
        j0 = max(0, -i)
        i = max(0, i)
        n = min(len(sig) - j0, N - i)
        if n > 0:
            self.x[i:i + n] += sig[j0:j0 + n] * gain


def butter(x, kind, freq, order=2):
    sos = signal.butter(order, freq, btype=kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def swept_bandpass(x, f_start, f_end, q=1.2, curve=1.0):
    """Band-pass whose centre glides from f_start to f_end (log scale), block by block."""
    out = np.zeros_like(x)
    block = 256
    zi = np.zeros(2)
    nb = int(np.ceil(len(x) / block))
    for k in range(nb):
        p = (k / max(1, nb - 1)) ** curve
        f = f_start * (f_end / f_start) ** p
        b, a = signal.iirpeak(min(f, SR / 2 * 0.9), q, fs=SR)
        seg = x[k * block:(k + 1) * block]
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[k * block:k * block + len(seg)] = y
    return out


# ---------------------------------------------------------------- instruments
def ep(freq, dur, vel=1.0):
    """Electric-piano tone: two-operator FM with a short metallic tine."""
    t = tvec(dur + 1.4)
    index = 1.6 * np.exp(-t * 7) + 0.22
    car = np.sin(2 * np.pi * freq * t + index * np.sin(2 * np.pi * freq * t))
    tine = 0.14 * np.exp(-t * 28) * np.sin(2 * np.pi * freq * 14 * t)
    env = np.exp(-t * 1.5) * (1 - np.exp(-t * 500))
    rel = np.clip(1 - (t - dur) / 0.3, 0, 1)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.6 * t)
    return (car + tine) * env * rel * trem * vel


def pad(freq, dur, att=0.4, rel=0.9):
    t = tvec(dur + rel)
    sig = np.zeros(len(t))
    for detune in (-0.08, 0.0, 0.07):
        f = freq * 2 ** (detune / 12)
        sig += 2 * ((f * t + rng.random()) % 1) - 1
    env = np.minimum(1, t / att) * np.clip(1 - (t - dur) / rel, 0, 1)
    return sig / 3 * env


def pluck(freq, dur=0.55, bright=1.0):
    t = tvec(dur + 0.35)
    out = np.zeros(len(t))
    for k in range(1, 16):
        fk = freq * k
        if fk > 15000:
            break
        out += (1 / k ** 1.15) * np.exp(-t * (3.5 + k * k * 0.75 / bright)) * np.sin(2 * np.pi * fk * t)
    return out * (1 - np.exp(-t * 900)) * 0.6


def bell(freq, dur=3.2):
    t = tvec(dur)
    parts = [(1, 1.0, 1.1), (2.0, 0.45, 1.7), (2.76, 0.35, 2.3), (5.40, 0.18, 3.8), (8.93, 0.08, 6.0)]
    out = sum(a * np.exp(-t * d) * np.sin(2 * np.pi * freq * r * t) for r, a, d in parts)
    return out * (1 - np.exp(-t * 1500)) * 0.5


def bass(freq, dur):
    t = tvec(dur + 0.09)
    s = np.sin(2 * np.pi * freq * t) + 0.38 * np.sin(4 * np.pi * freq * t) + 0.14 * np.sin(6 * np.pi * freq * t)
    env = (1 - np.exp(-t * 350)) * np.clip(1 - (t - dur) / 0.09, 0, 1) * (0.82 + 0.18 * np.exp(-t * 6))
    return np.tanh(1.5 * s * env) / np.tanh(1.5)


def kick():
    t = tvec(0.5)
    f = 46 + 115 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = butter(rng.standard_normal(len(t)) * np.exp(-t * 700), "highpass", 2500) * 0.35
    return np.tanh(1.7 * (body + click)) / np.tanh(1.7)


def clap():
    t = tvec(0.4)
    env = sum(np.where(t >= d, np.exp(-(t - d) * 130), 0) for d in (0, 0.009, 0.019))
    env += 0.4 * np.where(t >= 0.028, np.exp(-(t - 0.028) * 15), 0)
    return butter(rng.standard_normal(len(t)) * env, "bandpass", [950, 2800]) * 1.6


def hat(open_=False):
    t = tvec(0.35 if open_ else 0.09)
    env = np.exp(-t * (13 if open_ else 75)) * (1 - np.exp(-t * 3000))
    return butter(rng.standard_normal(len(t)) * env, "highpass", 7800, order=4)


def shaker():
    t = tvec(0.1)
    env = (1 - np.exp(-t * 400)) * np.exp(-t * 45)
    return butter(rng.standard_normal(len(t)) * env, "bandpass", [4500, 10000])


def crash(length=3.2):
    t = tvec(length)
    x = rng.standard_normal(len(t)) * np.exp(-t * 1.7) * (1 - np.exp(-t * 2000))
    return butter(butter(x, "highpass", 3800, order=3), "lowpass", 13000)


def whoosh(dur, f0=250, f1=5000, peak=0.82):
    """Air whoosh: swept band-pass noise that swells to `peak` (0-1 of its length) and falls away."""
    t = tvec(dur)
    p = t / dur
    env = np.where(p < peak, (p / peak) ** 2.2, np.exp(-(p - peak) / (1 - peak) * 4))
    x = swept_bandpass(rng.standard_normal(len(t)), f0, f1, q=1.4)
    return x * env


def ui_tick(freq=2200):
    t = tvec(0.18)
    tone = np.sin(2 * np.pi * freq * t) * np.exp(-t * 38) + 0.4 * np.sin(2 * np.pi * freq * 1.5 * t) * np.exp(-t * 60)
    click = butter(rng.standard_normal(len(t)) * np.exp(-t * 900), "highpass", 4000) * 0.25
    return (tone + click) * (1 - np.exp(-t * 4000))


# ---------------------------------------------------------------- arrangement
music, verb, sfx, intro = Bus(), Bus(), Bus(), Bus()
pads_dark, pads_bright = Bus(), Bus()

FMAJ9 = (41, [57, 60, 64, 67])
AM7 = (45, [55, 60, 64, 69])
BBMAJ9 = (34, [57, 60, 62, 65])
CSUS = (36, [55, 60, 65, 67])
C = (36, [55, 60, 64, 67])
# One chord per bar for bars 0-7 (bar 7 splits Bb -> C before the logo hit).
BARS = [FMAJ9, FMAJ9, AM7, BBMAJ9, CSUS, FMAJ9, AM7, BBMAJ9]

kick_beats = []
for bar, (root, chord) in enumerate(BARS):
    b0 = bar * 4
    chords = [(0, 4, root, chord)]
    if bar == 4:
        chords = [(0, 2, root, chord), (2, 2, C[0], C[1])]
    if bar == 7:
        chords = [(0, 2, root, chord), (2, 1, C[0], C[1])]
    for off, length, r, notes in chords:
        start = sec(b0 + off)
        for m in notes:
            p = pad(mtof(m), sec(length) - 0.02)
            pads_dark.add(p, start, 0.13)
            pads_bright.add(p, start, 0.13)
        if bar >= 1:
            # Syncopated electric-piano comping.
            for hit, hl in ((0, 1.3), (1.5, 1.2), (3.0, 0.9)):
                if hit >= length:
                    continue
                for k, m in enumerate(notes):
                    e = ep(mtof(m), sec(min(hl, length - hit)), vel=0.9 if hit == 0 else 0.7)
                    music.add(e, sec(b0 + off + hit) + k * 0.006, 0.085, pan=-0.25 + 0.17 * k)
                    verb.add(e, sec(b0 + off + hit), 0.02)
            # Bass line.
            pattern = ((0, 0.85, 0), (1.5, 0.4, 0), (2.0, 0.9, 0), (3.5, 0.4, 12))
            for hit, hl, oct_ in pattern:
                if hit >= length or (bar == 7 and off + hit >= 3):
                    continue
                music.add(bass(mtof(r + oct_), sec(min(hl, length - hit))), sec(b0 + off + hit), 0.19)
        # Plucked arpeggio, eighth notes, with a ping-pong echo added later.
        arp_idx = [0, 2, 1, 3, 2, 1, 3, 2]
        for e in range(int(length * 2)):
            if bar == 7 and off + e / 2 >= 3:
                continue
            m = notes[arp_idx[(e + int(off * 2)) % 8]] + 12
            vel = 0.85 if e % 2 == 0 else 0.6
            music.add(pluck(mtof(m), bright=1.0 if bar else 0.7), sec(b0 + off + e / 2), 0.11 * vel, pan=0.35 if e % 2 else -0.35)

    # Drums from bar 1; the build bar (7) rolls into a one-beat drop before the logo.
    if bar >= 1:
        for beat in range(4):
            bb = b0 + beat
            if bar == 7 and beat == 3:
                continue
            if beat in (0, 2):
                kick_beats.append(bb)
            if beat == 1 and bar >= 4:
                kick_beats.append(bb + 0.5)
            if beat in (1, 3) and not (bar == 7 and beat >= 2):
                c = clap()
                music.add(c, sec(bb), 0.24, pan=0.05)
                verb.add(c, sec(bb), 0.09)
            for s16 in range(4):
                swing = 0.11 * B / 4 if s16 % 2 else 0
                t0 = sec(bb + s16 / 4) + swing
                if s16 % 2 == 0:
                    music.add(hat(open_=(s16 == 2 and bar >= 5)), t0, 0.10 if s16 == 0 else 0.13, pan=0.3)
                music.add(shaker(), t0, 0.05 if s16 % 2 else 0.03, pan=-0.4)
    elif bar == 0:
        # Intro: the groove is already there, but muffled, so the drop "opens up" on beat 4.
        for beat in range(4):
            intro.add(kick(), sec(beat), 0.42)
            if beat % 2:
                intro.add(clap(), sec(beat), 0.30)
            for e in range(2):
                music.add(shaker(), sec(beat + e / 2), 0.012 + 0.01 * beat, pan=-0.4)

# Bar 7 build: snare roll on beat 30, riser across the bar.
for k in range(8):
    c = clap()
    music.add(c, sec(30 + k / 8), 0.05 + 0.02 * k, pan=0.05)
    verb.add(c, sec(30 + k / 8), 0.04)
riser = whoosh(sec(3), 300, 7000, peak=0.98)
music.add(riser, sec(28), 0.10)
verb.add(riser, sec(28), 0.05)
# Reverse swell into the logo hit.
t = tvec(sec(1))
swell = butter(rng.standard_normal(len(t)), "highpass", 1800) * (t / t[-1]) ** 3
music.add(swell, sec(31), 0.16)

for kb in kick_beats + [32]:
    music.add(kick(), sec(kb), 0.5 if kb != 32 else 0.75)

# Character gesture cut (beat 8): soft crash.
c = crash()
music.add(c, sec(8), 0.07, pan=0.2)
verb.add(c, sec(8), 0.04)

# Counter-melody over bars 5-7, resolving into the logo.
MELODY = [(20, 1.5, 84), (21.5, 0.5, 81), (22, 1, 79), (23, 1, 77),
          (24, 1.5, 76), (25.5, 0.5, 79), (26, 2, 81),
          (28, 1.5, 86), (29.5, 0.5, 84), (30, 1, 81)]
for b0, length, m in MELODY:
    p = pluck(mtof(m), dur=sec(length), bright=1.6)
    music.add(p, sec(b0), 0.13, pan=0.1)
    verb.add(p, sec(b0), 0.05)

# ------------------------------------------------ logo hit: beat 32, final chord
t32 = sec(32)
final = [53, 57, 60, 64, 67, 72]
for k, m in enumerate(final):
    e = ep(mtof(m), 2.2, vel=1.0)
    music.add(e, t32 + k * 0.012, 0.05, pan=-0.3 + 0.12 * k)
    verb.add(e, t32, 0.04)
    p = pad(mtof(m), 1.4, att=0.05, rel=1.6)
    pads_bright.add(p, t32, 0.09)
music.add(bass(mtof(41), 1.6) * np.linspace(1, 0.4, len(bass(mtof(41), 1.6))), t32, 0.32)
for k, m in enumerate([77, 81, 84, 89]):
    bl = bell(mtof(m))
    music.add(bl, t32 + sec(k * 0.25), 0.08, pan=-0.3 + 0.2 * k)
    verb.add(bl, t32 + sec(k * 0.25), 0.07)
c = crash(3.6)
music.add(c, t32, 0.10)
verb.add(c, t32, 0.06)

# Impact: sub drop + low noise burst.
t = tvec(1.6)
sub = np.sin(2 * np.pi * np.cumsum(34 + 26 * np.exp(-t * 3)) / SR) * np.exp(-t * 2.4)
burst = butter(rng.standard_normal(len(t)) * np.exp(-t * 11), "lowpass", 900)
sfx.add(np.tanh(1.3 * sub) + 0.5 * burst, t32, 0.42)
verb.add(burst, t32, 0.05)

# ------------------------------------------------ sound design on the beat grid
# Website reveal on beat 0: soft power-on chime and swish.
for k, m in enumerate([77, 84]):
    sfx.add(bell(mtof(m), 1.5), 0.02 + k * 0.05, 0.035)
sfx.add(whoosh(0.5, 600, 6000, peak=0.25), 0.0, 0.05)
# Push-in (beats 2 -> 4) and pull-out (10 -> 11.6).
sfx.add(whoosh(sec(2), 200, 3500, peak=0.9), sec(2), 0.09)
sfx.add(whoosh(sec(1.6), 3500, 300, peak=0.2), sec(10), 0.06)
# Scroll transitions land on beats 12, 14, 16, 18 (laptop) and 22 (phone).
for k, land in enumerate([12, 14, 16, 18, 22]):
    w = whoosh(0.55, 350, 4200, peak=0.78)
    sfx.add(w, sec(land) - 0.43, 0.075 if land != 22 else 0.05, pan=-0.35 if k % 2 else 0.35)
    verb.add(w, sec(land) - 0.43, 0.02)
# Phone slides in from the right (beat 20).
sfx.add(whoosh(0.6, 400, 3000, peak=0.85), sec(20) - 0.5, 0.07, pan=0.6)
# Annotation chips pop on their beats.
for b in [4, 8, 12, 14, 16, 18, 20, 22]:
    sfx.add(ui_tick(2093), sec(b), 0.03, pan=0.15)
# Lighthouse rings, tuned to the Am7 bar: E6, G6, A6, C7.
for k, m in enumerate([88, 91, 93, 96]):
    tk = ui_tick(mtof(m))
    sfx.add(tk, sec(24 + k), 0.055, pan=-0.45 + 0.3 * k)
    verb.add(tk, sec(24 + k), 0.03)
# Rush into the screen (beats 30.9 -> 32).
sfx.add(whoosh(sec(1.1), 300, 8000, peak=0.97), sec(30.9), 0.08)
# Tagline and call to action after the logo.
sfx.add(ui_tick(1760), sec(33), 0.025)
for k, m in enumerate([84, 89]):
    sfx.add(ui_tick(mtof(m)), sec(34) + k * 0.06, 0.035)

# ---------------------------------------------------------------- effects + mix
# Pad: dark through the intro, opening up when the drums enter, darker in the drop.
dark = butter(pads_dark.x, "lowpass", 650)
bright = butter(pads_bright.x, "lowpass", 3400)
tt = np.arange(N) / SR
open_k = np.clip((tt - sec(3)) / sec(1), 0, 1)
open_k = np.where(tt > sec(31), np.clip(1 - (tt - sec(31)) / sec(1), 0, 1), open_k)
open_k = np.where(tt >= t32, 1.0, open_k)
pads = dark * (1 - open_k)[:, None] + bright * open_k[:, None]

# Sidechain pump from the kick.
duck = np.ones(N)
for kb in kick_beats:
    i = int(sec(kb) * SR)
    seg = tvec(0.4)
    g = 1 - 0.55 * np.exp(-seg / 0.11) * (1 - np.exp(-seg / 0.004))
    j = min(N, i + len(seg))
    duck[i:j] = np.minimum(duck[i:j], g[: j - i])
pads *= duck[:, None]
music.x *= (0.65 + 0.35 * duck)[:, None]

# Ping-pong echo on the whole melodic bus (3/4 beat), filtered.
d = int(sec(0.75) * SR)
mono = music.x.mean(axis=1)
echo = np.zeros((N, 2))
for k in range(1, 6):
    shifted = np.zeros(N)
    shifted[k * d:] = mono[:-k * d] * (0.32 ** k)
    echo[:, k % 2] += shifted
echo = butter(butter(echo, "lowpass", 3500), "highpass", 400)

# Reverb: decorrelated exponential-noise impulse, about 1.9 s.
it = tvec(2.8)
ir = rng.standard_normal((len(it), 2)) * np.exp(-6.91 * it / 1.9)[:, None]
ir = butter(ir, "lowpass", 6000)
ir[: int(0.018 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=0))
wet = np.stack([signal.fftconvolve(verb.x[:, c] + 0.25 * pads[:, c], ir[:, c])[:N] for c in range(2)], axis=1)

mix = music.x + pads + 0.35 * echo + 0.9 * wet + sfx.x + butter(intro.x, "lowpass", 420)
mix = butter(mix, "highpass", 28)
# Clean ending: everything is silent by the last frame.
fade = np.clip((DUR - 0.05 - tt) / 1.1, 0, 1) ** 1.5
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.89
mix = np.tanh(mix * 1.15) / np.tanh(1.15)

out = sys.argv[1] if len(sys.argv) > 1 else "veyra-reel-music.wav"
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_24")
print("wrote", out, f"{DUR}s", "peak", float(np.abs(mix).max()))

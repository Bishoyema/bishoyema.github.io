#!/usr/bin/env python3
"""Averages the motion-blur sub-frames written by capture.mjs into single frames.

f_0123.sub0.png ... f_0123.sub5.png  ->  f_0123.jpg   (sub-frames are then deleted)
Usage: python3 blend.py <framesDir>   (needs numpy and Pillow)
"""
import glob
import os
import re
import sys
from collections import defaultdict

import numpy as np
from PIL import Image

frames_dir = sys.argv[1]
groups = defaultdict(list)
for f in glob.glob(os.path.join(frames_dir, "*.sub*.png")):
    groups[re.sub(r"\.sub\d+\.png$", "", f)].append(f)
for base, files in sorted(groups.items()):
    acc = None
    for f in files:
        a = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
        # Average in linear light so bright edges blur like a real camera.
        lin = (a / 255.0) ** 2.2
        acc = lin if acc is None else acc + lin
    out = (acc / len(files)) ** (1 / 2.2) * 255
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(base + ".jpg", quality=94)
    for f in files:
        os.remove(f)
print("blended", len(groups), "frames")

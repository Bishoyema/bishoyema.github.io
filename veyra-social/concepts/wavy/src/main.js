// WAVY concept site: 3D cans that drop, spin and swap with the scroll, colour wipes between
// flavours, fruit and ice orbiting the cans, giant moving type, counters.
// Every frame is a pure function of (time, scroll position), so the page can also be driven
// frame by frame (window.CONCEPT.manual() + frame(t, intro)) for video capture.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOutBack = (k) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);
function easeOutBounce(k) {
  const n = 7.5625, d = 2.75;
  if (k < 1 / d) return n * k * k;
  if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
  if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
  return n * (k -= 2.625 / d) * k + 0.984375;
}

// Sections: hero (lime), mango, berry, zero sugar, shop.
const BG = ["#b5f23d", "#ffa31a", "#b14cff", "#fff3dc", "#141414"];
const FG = ["#101010", "#101010", "#ffffff", "#101010", "#ffffff"];
const GIANT = ["Lime rush", "Mango wave", "Berry blast", "Zero sugar", "Wavy wavy"];
const GIANT_INK = ["#9fdc22", "#ff8c00", "#9a32ee", "#f4dfb6", "#232323"];

// ---------------------------------------------------------------- DOM motion
const introEls = [...document.querySelectorAll("[data-intro]")];
const revealEls = [...document.querySelectorAll("[data-r]")];
const counters = [...document.querySelectorAll("[data-count]")];
const bgA = document.querySelector(".bg-a"), bgB = document.querySelector(".bg-b");
const giant = document.querySelector(".giant"), rows = [...document.querySelectorAll(".giant .row")];
const nav = document.querySelector(".nav");
let layoutTops = [], giantWord = -1;

function measure() {
  revealEls.forEach((el) => { el.style.transform = "none"; });
  layoutTops = revealEls.map((el) => el.getBoundingClientRect().top + window.scrollY);
  revealEls.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-r"));
    el.__idx = sibs.length > 1 ? sibs.indexOf(el) : 0;
  });
}

function domFrame(time, intro) {
  const vh = window.innerHeight || 1;
  const p = clamp(window.scrollY / vh, 0, BG.length - 1);
  const i0 = Math.floor(p), i1 = Math.min(BG.length - 1, i0 + 1), k = p - i0;
  // Colour wipe: the next flavour's colour grows as a circle from the bottom of the screen.
  bgA.style.background = BG[i0];
  bgB.style.background = BG[i1];
  bgB.style.clipPath = `circle(${easeInOut(k) * 150}% at 50% 100%)`;
  nav.style.color = k < 0.5 ? FG[i0] : FG[i1];
  // Giant type: swaps word while it slides out of view between sections.
  const near = Math.round(p), off = p - near;
  if (near !== giantWord) {
    giantWord = near;
    const word = (GIANT[near] + " · ").repeat(6);
    rows.forEach((r) => { r.textContent = word; });
    giant.style.color = GIANT_INK[near];
  }
  giant.style.transform = `translateY(${-off * vh * 0.9}px)`;
  giant.style.opacity = clamp(1 - Math.abs(off) * 2.4) * clamp((intro - 0.2) / 0.6);
  rows.forEach((r, i) => {
    const w = r.scrollWidth / 6;
    const x = (time * (i ? 90 : 130) + window.scrollY * 0.3) % w;
    r.style.transform = `translateX(${i ? x - w : -x}px)`;
  });
  for (const el of introEls) {
    const i = +el.dataset.intro;
    const kk = easeOut(clamp((intro - 0.1 - i * 0.12) / 0.8));
    if (el.classList.contains("word")) el.style.transform = `translateY(${(1 - kk) * 108}%)`;
    else { el.style.opacity = kk; el.style.transform = `translateY(${(1 - kk) * 26}px)`; }
  }
  revealEls.forEach((el, n) => {
    const top = layoutTops[n] - window.scrollY;
    if (el.__enter === undefined && top < vh * 0.9) el.__enter = time;
    const kk = el.__enter === undefined ? 0 : easeOut(clamp((time - el.__enter - el.__idx * 0.1) / 0.8));
    el.style.opacity = kk;
    el.style.transform = `translateY(${(1 - kk) * 60}px)`;
  });
  for (const el of counters) {
    const host = el.closest("[data-r]");
    const kk = host?.__enter === undefined ? 0 : clamp((time - host.__enter - 0.15) / 1.1);
    el.textContent = Math.round(+el.dataset.count * easeOut(kk));
  }
}

// ---------------------------------------------------------------- textures
function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const FLAVOURS = [
  { name: "Lime Rush", base: "#8fd61c", light: "#c9f56a", dark: "#5f9c0a", ink: "#101010" },
  { name: "Mango Wave", base: "#ff9a1a", light: "#ffc457", dark: "#e06a00", ink: "#101010" },
  { name: "Berry Blast", base: "#9b3cf0", light: "#c98bff", dark: "#6a17b8", ink: "#ffffff" },
];

// The can's label, unrolled: logo at the centre (turned to face the camera), waves below.
function labelTexture(f) {
  const t = canvasTexture(2048, 1024, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, f.light); grd.addColorStop(0.45, f.base); grd.addColorStop(1, f.dark);
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let band = 0; band < 3; band++) {
      g.beginPath();
      const y0 = 700 + band * 90;
      g.moveTo(0, h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + Math.sin((x / w) * Math.PI * 8 + band) * 28);
      g.lineTo(w, h); g.closePath();
      g.fillStyle = band % 2 ? f.dark : f.light;
      g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1;
    }
    g.fillStyle = f.ink;
    g.textAlign = "center";
    g.font = '900 250px "Unbounded"';
    g.fillText("wavy", w / 2, 450);
    g.lineWidth = 22; g.lineCap = "round"; g.strokeStyle = f.ink;
    g.beginPath();
    for (let x = -150; x <= 150; x += 6) g.lineTo(w / 2 + x, 520 + Math.sin((x / 150) * Math.PI * 2) * 20);
    g.stroke();
    g.font = '800 74px "Unbounded"';
    g.fillText(f.name.toUpperCase(), w / 2, 660);
    g.font = '700 30px "Inter"';
    g.letterSpacing = "6px";
    g.fillText("SPARKLING ENERGY · 0 G SUGAR · 330 ML", w / 2, 760);
    g.save(); g.translate(260, 520); g.rotate(-Math.PI / 2);
    g.font = '800 40px "Unbounded"'; g.fillText("80 MG NATURAL CAFFEINE", 0, 0); g.restore();
    g.save(); g.translate(w - 260, 520); g.rotate(Math.PI / 2);
    g.font = '800 40px "Unbounded"'; g.fillText("REAL FRUIT · ZERO SUGAR", 0, 0); g.restore();
  });
  t.wrapS = THREE.RepeatWrapping;
  t.offset.x = 0.5; // canvas centre faces +z (the camera) at rotation 0
  return t;
}

const limeFace = () => canvasTexture(256, 256, (g) => {
  g.fillStyle = "#3f8f12"; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f4ffd6"; g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * Math.PI * 2 + 0.05, a1 = ((i + 1) / 10) * Math.PI * 2 - 0.05;
    g.fillStyle = i % 2 ? "#b6e85a" : "#a7df46";
    g.beginPath(); g.moveTo(128, 128); g.arc(128, 128, 104, a0, a1); g.closePath(); g.fill();
  }
  g.fillStyle = "#f4ffd6"; g.beginPath(); g.arc(128, 128, 10, 0, Math.PI * 2); g.fill();
});

const shadowTexture = () => canvasTexture(256, 256, (g) => {
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,0.32)"); grd.addColorStop(0.5, "rgba(0,0,0,0.12)"); grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
});

const dotTexture = () => canvasTexture(64, 64, (g) => {
  g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 5;
  g.beginPath(); g.arc(32, 32, 24, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "rgba(255,255,255,0.25)"; g.fill();
});

// ---------------------------------------------------------------- 3D scene
const canvas = document.getElementById("gl");
let renderer, scene, camera, cans, pieces, ice, bubbles, bubbleBase;

function makeCan(f, shadowMap) {
  const group = new THREE.Group();
  const silver = new THREE.MeshStandardMaterial({ color: "#dfe3ea", metalness: 1, roughness: 0.26 });
  const body = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.62, -1), new THREE.Vector2(0.62, 1)], 96),
    new THREE.MeshStandardMaterial({ map: labelTexture(f), metalness: 0.55, roughness: 0.26, side: THREE.DoubleSide }));
  group.add(body);
  const top = new THREE.Mesh(new THREE.LatheGeometry([[0.62, 1], [0.6, 1.07], [0.53, 1.18], [0.5, 1.23], [0.5, 1.27], [0.47, 1.27], [0.46, 1.21], [0, 1.21]].map(([x, y]) => new THREE.Vector2(x, y)), 96), silver);
  top.material.side = THREE.DoubleSide;
  group.add(top);
  const bottom = new THREE.Mesh(new THREE.LatheGeometry([[0, -1.16], [0.4, -1.16], [0.5, -1.12], [0.58, -1.06], [0.62, -1]].map(([x, y]) => new THREE.Vector2(x, y)), 96), silver);
  group.add(bottom);
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.025, 0.34, 2, 0.01), silver);
  tab.position.set(0, 1.225, 0.1);
  group.add(tab);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.userData.isShadow = true;
  const holder = new THREE.Group();
  holder.add(group);
  return { holder, can: group, shadow };
}

function makePieces() {
  const out = [[], [], []];
  const face = limeFace();
  const limeMats = [new THREE.MeshStandardMaterial({ color: "#3f8f12", roughness: 0.5 }), new THREE.MeshStandardMaterial({ map: face, roughness: 0.4 }), new THREE.MeshStandardMaterial({ map: face, roughness: 0.4 })];
  const limeGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.07, 48);
  for (let i = 0; i < 5; i++) out[0].push(new THREE.Mesh(limeGeo, limeMats));
  const leaf = new THREE.Shape();
  leaf.moveTo(0, -0.3); leaf.quadraticCurveTo(0.2, 0, 0, 0.3); leaf.quadraticCurveTo(-0.2, 0, 0, -0.3);
  const leafMat = new THREE.MeshStandardMaterial({ color: "#2fae4a", roughness: 0.45, side: THREE.DoubleSide });
  for (let i = 0; i < 2; i++) out[0].push(new THREE.Mesh(new THREE.ShapeGeometry(leaf, 12), leafMat));
  const mangoGeo = new RoundedBoxGeometry(0.4, 0.4, 0.4, 3, 0.08);
  const mangoMat = new THREE.MeshPhysicalMaterial({ color: "#ffb21f", roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, emissive: "#ff7a00", emissiveIntensity: 0.15 });
  for (let i = 0; i < 6; i++) out[1].push(new THREE.Mesh(mangoGeo, mangoMat));
  const rasp = new THREE.MeshPhysicalMaterial({ color: "#e0245e", roughness: 0.3, clearcoat: 1 });
  const currant = new THREE.MeshPhysicalMaterial({ color: "#3d1260", roughness: 0.25, clearcoat: 1 });
  const drupe = new THREE.SphereGeometry(0.075, 12, 8);
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Group();
    for (let j = 0; j < 22; j++) {
      const a = j * 2.4, h = (j / 22) * 0.36 - 0.18, rad = 0.13 * Math.sin(Math.PI * (0.15 + 0.8 * j / 22));
      const d = new THREE.Mesh(drupe, rasp);
      d.position.set(Math.cos(a) * rad, h, Math.sin(a) * rad);
      r.add(d);
    }
    out[2].push(r);
  }
  for (let i = 0; i < 4; i++) out[2].push(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), currant));
  return out;
}

async function build() {
  await document.fonts.ready;
  await Promise.all(['900 250px "Unbounded"', '800 74px "Unbounded"', '700 30px "Inter"'].map((f) => document.fonts.load(f)));
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const dprParam = +new URLSearchParams(location.search).get("dpr");
  renderer.setPixelRatio(dprParam || Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const key = new THREE.DirectionalLight("#ffffff", 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#ffffff", 1.4);
  rim.position.set(-5, 2, -3);
  scene.add(rim);

  const shadowMap = shadowTexture();
  cans = FLAVOURS.map((f) => {
    const c = makeCan(f, shadowMap);
    scene.add(c.holder, c.shadow);
    return c;
  });
  pieces = makePieces();
  pieces.flat().forEach((m, i) => { m.userData.seed = i; scene.add(m); });
  const iceMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.5, roughness: 0.04, clearcoat: 1, envMapIntensity: 2.2, depthWrite: false });
  ice = Array.from({ length: 4 }, (_, i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.46, 0.46, 3, 0.07), iceMat);
    m.userData.seed = 40 + i;
    scene.add(m);
    return m;
  });
  const COUNT = 140;
  bubbleBase = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    bubbleBase[i * 4] = (Math.random() - 0.5) * 9;
    bubbleBase[i * 4 + 1] = Math.random() * 8;
    bubbleBase[i * 4 + 2] = Math.random() * 2 - 0.5;
    bubbleBase[i * 4 + 3] = 0.5 + Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  bubbles = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, map: dotTexture(), transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(bubbles);
  resize();
}

function resize() {
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const narrow = camera.aspect < 0.8;
  camera.fov = narrow ? 40 : 30;
  camera.position.set(0, 0, narrow ? 11 : 10);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  measure();
}
window.addEventListener("resize", resize);

// Can layouts per section: [lime, mango, berry] as [x, y, scale, tilt].
const OFF_L = [-3.6, 4.8, 0.9, -0.9], OFF_R = [3.8, 4.8, 0.9, 0.8];
const DESKTOP = [
  [[1.55, -0.1, 1.22, -0.16], [3.2, -5.6, 1.1, 0.5], [-3.2, -5.6, 1.1, -0.5]],
  [OFF_L, [1.55, -0.1, 1.22, 0.16], [-3.2, -5.6, 1.1, -0.5]],
  [OFF_L, OFF_R, [-1.6, -0.1, 1.22, -0.16]],
  [[-2.05, -0.38, 0.8, 0.12], [0, -0.3, 0.84, 0], [2.05, -0.38, 0.8, -0.12]],
  [[1.05, -0.35, 0.92, 0.32], [2.05, -0.05, 1, 0], [3.05, -0.35, 0.92, -0.32]],
];
const MOBILE = [
  [[0, 1.45, 1.02, -0.15], [1.6, -6.6, 1, 0.5], [-1.6, -6.6, 1, -0.5]],
  [[-2.8, 6.6, 0.8, -0.9], [0, 1.45, 1.02, 0.15], [-1.6, -6.6, 1, -0.5]],
  [[-2.8, 6.6, 0.8, -0.9], [2.8, 6.6, 0.8, 0.8], [0, 1.45, 1.02, -0.15]],
  [[-1.12, 0.65, 0.6, 0.12], [0, 0.8, 0.64, 0], [1.12, 0.65, 0.6, -0.12]],
  [[-0.95, 1.65, 0.72, 0.3], [0, 1.95, 0.78, 0], [0.95, 1.65, 0.72, -0.3]],
];

function sceneFrame(time, intro) {
  if (!renderer || !window.innerHeight) return;
  const L = camera.aspect < 0.8 ? MOBILE : DESKTOP;
  const p = clamp(window.scrollY / window.innerHeight, 0, L.length - 1);
  const i0 = Math.floor(p), i1 = Math.min(L.length - 1, i0 + 1), k = smooth(p - i0);
  // Intro: the lime can drops in spinning and bounces to a stop; the fruit bursts out as it lands.
  const kd = clamp((intro - 0.1) / 0.52);
  const drop = (1 - easeOutBounce(kd)) * 7;
  const burst = easeOutBack(clamp((intro - 0.55) / 0.6));
  const centres = [];
  cans.forEach((c, n) => {
    const [x0, y0, s0, r0] = L[i0][n], [x1, y1, s1, r1] = L[i1][n];
    const s = lerp(s0, s1, k);
    const x = lerp(x0, x1, k), y = lerp(y0, y1, k) + Math.sin(time * 1.4 + n * 2) * 0.06 + (n === 0 ? drop : 0);
    c.holder.position.set(x, y, 0);
    c.holder.scale.setScalar(s);
    c.holder.rotation.z = lerp(r0, r1, k) + Math.sin(time * 0.9 + n) * 0.03;
    // One full turn per section, so each can faces the camera with its logo as a section lands.
    c.can.rotation.y = intro * 0.45 + p * Math.PI * 2 + (n === 0 ? (1 - kd) * 7 : 0) - 0.3;
    c.can.rotation.x = Math.sin(time * 0.7 + n) * 0.06;
    c.shadow.position.set(x, y - 1.55 * s, -0.4);
    c.shadow.scale.setScalar(s * (n === 0 ? 1 - clamp(drop / 7) : 1));
    c.shadow.material.opacity = Math.abs(y) < 4 ? 1 : 0;
    centres.push([x, y, s]);
  });
  // Fruit orbits the can of its flavour while that flavour is on screen.
  pieces.forEach((group, f) => {
    const w = clamp(1 - Math.abs(p - f) * 1.7) * (f === 0 ? burst : 1);
    const [cx, cy, cs] = centres[f];
    group.forEach((m, j) => {
      const sd = m.userData.seed;
      const a = sd * 2.39996 + time * 0.28, r = (1.55 + (sd % 3) * 0.42) * cs;
      m.visible = w > 0.01;
      m.position.set(cx + Math.cos(a) * r * 1.25, cy + ((sd * 0.37) % 1 - 0.5) * 2.6 * cs + Math.sin(time * 1.1 + sd) * 0.12, Math.sin(a) * r * 0.7);
      m.rotation.set(time * 0.7 + sd, time * 0.5 + sd * 2, time * 0.3);
      m.scale.setScalar(Math.max(0.001, w) * (j < 5 || f ? 1 : 1.2) * cs);
    });
  });
  const wi = clamp(1 - Math.max(0, p - 2) * 1.6) * burst;
  ice.forEach((m, j) => {
    const sd = m.userData.seed, c = centres[Math.min(2, Math.round(p))];
    const a = sd * 1.7 + time * 0.22;
    m.visible = wi > 0.01;
    m.position.set(c[0] + Math.cos(a) * 2.1 * c[2], c[1] + (j - 1.5) * 0.7, Math.sin(a) * 1.2);
    m.rotation.set(time * 0.4 + sd, time * 0.6 + sd, 0);
    m.scale.setScalar(Math.max(0.001, wi));
  });
  const pos = bubbles.geometry.attributes.position.array;
  for (let i = 0; i < pos.length / 3; i++) {
    const b = bubbleBase[i * 4 + 3];
    pos[i * 3] = bubbleBase[i * 4] + Math.sin(time * 2 * b + i) * 0.08;
    pos[i * 3 + 1] = ((bubbleBase[i * 4 + 1] + time * 0.9 * b) % 8) - 4;
    pos[i * 3 + 2] = bubbleBase[i * 4 + 2];
  }
  bubbles.geometry.attributes.position.needsUpdate = true;
  bubbles.material.opacity = 0.8 * clamp((intro - 0.5) / 0.6) * clamp(1 - Math.max(0, p - 2.5));
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- loop / API
let manual = false;
const t0 = performance.now();
function loop() {
  if (manual) return;
  const t = (performance.now() - t0) / 1000;
  domFrame(t, t);
  sceneFrame(t, t);
  requestAnimationFrame(loop);
}
const ready = new Promise((resolve) => {
  const start = () => build().then(() => { measure(); resolve(); });
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
});
ready.then(() => { if (!manual) requestAnimationFrame(loop); });
domFrame(0, 0);
measure();

window.CONCEPT = {
  ready,
  manual() { manual = true; },
  frame(time, intro) { domFrame(time, intro); sceneFrame(time, intro); },
};

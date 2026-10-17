// Oudelle concept site: scroll-driven 3D bottle, intro and reveal animations.
// Every frame is a pure function of (time, scroll position), so the page can also be driven
// frame by frame (window.CONCEPT.manual() + frame(t, intro)) for video capture.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);

// ---------------------------------------------------------------- DOM motion
const introEls = [...document.querySelectorAll("[data-intro]")];
const revealEls = [...document.querySelectorAll("[data-r]")];
const ticker = document.querySelector(".ticker .track");
const rows = [...document.querySelectorAll(".marquee .row")];
let layoutTops = [];

function measure() {
  revealEls.forEach((el) => { el.style.transform = "none"; });
  layoutTops = revealEls.map((el) => el.getBoundingClientRect().top + window.scrollY);
  revealEls.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-r"));
    el.__idx = sibs.length > 1 ? sibs.indexOf(el) : 0;
  });
}

function domFrame(time, intro) {
  const vh = window.innerHeight;
  for (const el of introEls) {
    const i = +el.dataset.intro;
    const k = easeOut(clamp((intro - 0.1 - i * 0.12) / 0.8));
    if (el.classList.contains("word")) el.style.transform = `translateY(${(1 - k) * 108}%)`;
    else { el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * 26}px)`; }
  }
  revealEls.forEach((el, n) => {
    const top = layoutTops[n] - window.scrollY;
    if (el.__enter === undefined && top < vh * 0.9) el.__enter = time;
    const k = el.__enter === undefined ? 0 : easeOut(clamp((time - el.__enter - el.__idx * 0.12) / 0.9));
    el.style.opacity = k;
    el.style.transform = `translateY(${(1 - k) * 60}px)`;
  });
  if (ticker) ticker.style.transform = `translateX(${-((time * 38) % (ticker.scrollWidth / 2))}px)`;
  rows.forEach((r, i) => {
    const w = r.scrollWidth / 2;
    const off = (time * 70 + window.scrollY * 0.25) % w;
    r.style.transform = `translateX(${i % 2 ? off - w : -off}px)`;
  });
}

// ---------------------------------------------------------------- 3D scene
const canvas = document.getElementById("gl");
let renderer, scene, camera, bottles, pedestals, dust, dustBase, ghost, shadowTex;

function gradientTexture() {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 1024;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(560, 430, 40, 512, 512, 760);
  grd.addColorStop(0, "#fbf6ee");
  grd.addColorStop(0.55, "#f1e7d9");
  grd.addColorStop(1, "#ddcbb3");
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 1024);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelTexture(name) {
  const c = document.createElement("canvas");
  c.width = 640; c.height = 400;
  const g = c.getContext("2d");
  g.fillStyle = "#d8b071";
  g.textAlign = "center";
  g.font = '600 64px "Cormorant Garamond"';
  g.letterSpacing = "18px";
  g.fillText("OUDELLE", 330, 120);
  g.fillRect(250, 152, 140, 2);
  g.letterSpacing = "2px";
  g.font = 'italic 500 70px "Cormorant Garamond"';
  g.fillText(name, 320, 248);
  g.letterSpacing = "8px";
  g.font = '500 24px "Inter"';
  g.fillText("EAU DE PARFUM · 100 ML", 324, 320);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function ghostTexture() {
  const c = document.createElement("canvas");
  c.width = 2048; c.height = 900;
  const g = c.getContext("2d");
  g.font = 'italic 600 760px "Cormorant Garamond"';
  g.textAlign = "center";
  g.lineWidth = 3;
  g.strokeStyle = "rgba(160, 110, 60, 0.55)";
  g.strokeText("Oud", 1024, 700);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(70, 40, 15, 0.45)");
  grd.addColorStop(0.5, "rgba(70, 40, 15, 0.16)");
  grd.addColorStop(1, "rgba(70, 40, 15, 0)");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.4, "rgba(255,255,255,0.8)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function liquidTexture(hex) {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 256;
  const g = c.getContext("2d");
  const base = new THREE.Color(hex);
  const top = base.clone().lerp(new THREE.Color("#fff1d6"), 0.45), bottom = base.clone().multiplyScalar(0.62);
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#" + top.getHexString());
  grd.addColorStop(0.06, "#" + base.clone().lerp(new THREE.Color("#fff1d6"), 0.2).getHexString());
  grd.addColorStop(0.5, "#" + base.getHexString());
  grd.addColorStop(1, "#" + bottom.getHexString());
  g.fillStyle = grd; g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBottle(liquid, name) {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, thickness: 0.3, ior: 1.45,
    envMapIntensity: 0.85, specularIntensity: 0.9, attenuationColor: new THREE.Color("#f6e4c8"), attenuationDistance: 8,
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.16, 1.42, 0.64, 8, 0.13), glass);
  group.add(body);
  const juice = new THREE.Mesh(new RoundedBoxGeometry(0.98, 1.05, 0.48, 6, 0.09),
    new THREE.MeshPhysicalMaterial({ map: liquidTexture(liquid), roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05,
      emissive: new THREE.Color(liquid).multiplyScalar(0.18) }));
  juice.position.y = -0.12;
  group.add(juice);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 40), glass);
  neck.position.y = 0.8;
  group.add(neck);
  const gold = new THREE.MeshPhysicalMaterial({ color: "#cfa262", metalness: 1, roughness: 0.26, clearcoat: 0.5 });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 48), gold);
  collar.position.y = 0.92;
  group.add(collar);
  const cap = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.5, 0.66, 6, 0.06),
    new THREE.MeshPhysicalMaterial({ color: "#17100a", metalness: 0.15, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }));
  cap.position.y = 1.21;
  group.add(cap);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.46),
    new THREE.MeshPhysicalMaterial({ map: labelTexture(name), transparent: true, metalness: 0.85, roughness: 0.32, color: "#ffffff" }));
  label.position.set(0, -0.06, 0.325);
  group.add(label);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.72;
  group.add(shadow);
  return group;
}

async function build() {
  await document.fonts.ready;
  await Promise.all(['600 64px "Cormorant Garamond"', 'italic 500 70px "Cormorant Garamond"', '500 24px "Inter"']
    .map((f) => document.fonts.load(f)));
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const dprParam = +new URLSearchParams(location.search).get("dpr");
  renderer.setPixelRatio(dprParam || Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.background = gradientTexture();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const key = new THREE.DirectionalLight("#fff0da", 1.8);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#ffd09a", 1.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const glow = new THREE.PointLight("#ffae58", 6, 6, 1.6);
  glow.position.set(0, 0, -1.2);
  scene.add(glow);

  shadowTex = shadowTexture();
  bottles = [makeBottle("#c4741f", "Amber Noir"), makeBottle("#c86a7c", "Rose Dune"), makeBottle("#5b463a", "Smoke Oud")];
  bottles.forEach((b) => scene.add(b));
  bottles[0].userData.glow = glow;

  const pedMat = new THREE.MeshPhysicalMaterial({ color: "#efe3d1", roughness: 0.75, clearcoat: 0.2 });
  pedestals = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.84, 0.7, 72), pedMat);
    scene.add(m);
    return m;
  });

  ghost = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4.2),
    new THREE.MeshBasicMaterial({ map: ghostTexture(), transparent: true, depthWrite: false }));
  ghost.position.set(1.4, 0.3, -3.2);
  scene.add(ghost);

  const COUNT = 420;
  const geo = new THREE.BufferGeometry();
  dustBase = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    dustBase[i * 4] = (Math.random() - 0.5) * 12;
    dustBase[i * 4 + 1] = (Math.random() - 0.5) * 7;
    dustBase[i * 4 + 2] = (Math.random() - 0.5) * 5 - 0.5;
    dustBase[i * 4 + 3] = Math.random() * 6.283;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.045, map: dotTexture(), color: "#b9853f", transparent: true, opacity: 0.85, depthWrite: false }));
  scene.add(dust);
  resize();
}

function resize() {
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const narrow = camera.aspect < 0.8;
  camera.fov = narrow ? 40 : 30;
  camera.position.set(0, 0.2, narrow ? 11 : 9.5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  measure();
}
window.addEventListener("resize", resize);

// Bottle layouts per section: [main, rose, smoke] as {x, y, s}; pedestals follow the bottles.
const DESKTOP = [
  { b: [[1.85, -0.4, 1.3], [3.4, -2.4, 0], [5, -2.4, 0]], ped: 0, ghost: 1 },
  { b: [[-2.25, -0.34, 1.26], [-4, -2.4, 0], [3, -2.6, 0]], ped: 0, ghost: 0 },
  { b: [[0, -0.22, 0.78], [-2.55, -0.22, 0.78], [2.55, -0.22, 0.78]], ped: 1, ghost: 0 },
  { b: [[0, -0.15, 0.85], [-2.5, -3.2, 0], [2.5, -3.2, 0]], ped: 0, ghost: 0 },
  { b: [[0, 0.92, 0.58], [-2.5, -3.2, 0], [2.5, -3.2, 0]], ped: 0, ghost: 0 },
];
const MOBILE = [
  { b: [[0, 1.05, 1.3], [1.6, -3, 0], [2.4, -3, 0]], ped: 0, ghost: 1 },
  { b: [[0, 2.5, 0.68], [-1.8, -3, 0], [1.8, -3, 0]], ped: 0, ghost: 0 },
  { b: [[0, 0.55, 0.62], [-1.25, 0.55, 0.62], [1.25, 0.55, 0.62]], ped: 1, ghost: 0 },
  { b: [[0, 1.9, 0.9], [-1.8, -3.2, 0], [1.8, -3.2, 0]], ped: 0, ghost: 0 },
  { b: [[0, 2.3, 0.75], [-1.8, -3.2, 0], [1.8, -3.2, 0]], ped: 0, ghost: 0 },
];

function sceneFrame(time) {
  if (!renderer || !window.innerHeight) return;
  const narrow = camera.aspect < 0.8;
  const L = narrow ? MOBILE : DESKTOP;
  const p = clamp(window.scrollY / window.innerHeight, 0, L.length - 1);
  const i0 = Math.floor(p), i1 = Math.min(L.length - 1, i0 + 1), k = smooth(p - i0);
  bottles.forEach((b, n) => {
    const [x0, y0, s0] = L[i0].b[n], [x1, y1, s1] = L[i1].b[n];
    const s = Math.max(0.0001, lerp(s0, s1, k));
    b.visible = s > 0.01;
    b.scale.setScalar(s);
    b.position.set(lerp(x0, x1, k), lerp(y0, y1, k) + Math.sin(time * 0.9 + n) * 0.05 * s, 0);
    b.rotation.y = Math.sin(time * 0.5 + n * 1.7) * 0.32 + p * 1.15 + (n ? 0.5 : 0);
    b.rotation.x = Math.sin(time * 0.7 + n) * 0.035;
    b.rotation.z = n === 0 ? lerp(i0 === 1 ? 0.07 : 0, i1 === 1 ? 0.07 : 0, k) : 0;
    const ped = pedestals[n];
    const pk = lerp(L[i0].ped, L[i1].ped, k);
    ped.visible = pk > 0.01;
    ped.scale.set(s * 1.0, Math.max(0.001, pk) * s, s * 1.0);
    ped.position.set(b.position.x, b.position.y - 0.72 * s - 0.35 * pk * s, -0.02);
  });
  bottles[0].userData.glow.position.set(bottles[0].position.x, bottles[0].position.y, -1.2);
  const gk = lerp(L[i0].ghost, L[i1].ghost, k);
  ghost.material.opacity = gk;
  ghost.position.set((narrow ? 0 : 1.4) + p * 0.6, (narrow ? 1.6 : 0.3) + p * 1.2, -3.2);
  const pos = dust.geometry.attributes.position.array;
  for (let i = 0; i < pos.length / 3; i++) {
    const ph = dustBase[i * 4 + 3];
    pos[i * 3] = dustBase[i * 4] + Math.sin(time * 0.3 + ph) * 0.25;
    pos[i * 3 + 1] = ((dustBase[i * 4 + 1] + time * 0.12 + 3.5 + p * 0.8) % 7) - 3.5;
    pos[i * 3 + 2] = dustBase[i * 4 + 2] + Math.cos(time * 0.25 + ph) * 0.2;
  }
  dust.geometry.attributes.position.needsUpdate = true;
  camera.position.x = Math.sin(time * 0.2) * 0.12;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

// ---------------------------------------------------------------- loop / API
let manual = false;
const t0 = performance.now();
function loop() {
  if (manual) return;
  const t = (performance.now() - t0) / 1000;
  domFrame(t, t);
  sceneFrame(t);
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
  frame(time, intro) { domFrame(time, intro); sceneFrame(time); },
};

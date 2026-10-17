// Halo Residences concept site: a twisted 3D tower that builds itself, a scroll-driven camera,
// and intro, reveal, counter and map animations.
// Every frame is a pure function of (time, scroll position), so the page can also be driven
// frame by frame (window.CONCEPT.manual() + frame(t, intro)) for video capture.
import * as THREE from "three";

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- DOM motion
const introEls = [...document.querySelectorAll("[data-intro]")];
const revealEls = [...document.querySelectorAll("[data-r]")];
const counters = [...document.querySelectorAll("[data-count]")];
const routes = [...document.querySelectorAll("[data-draw]")];
const homeRing = document.querySelector(".map .home-ring");
let layoutTops = [];

function measure() {
  revealEls.forEach((el) => { el.style.transform = "none"; });
  layoutTops = revealEls.map((el) => el.getBoundingClientRect().top + window.scrollY);
  revealEls.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-r"));
    el.__idx = sibs.length > 1 ? sibs.indexOf(el) : 0;
  });
  routes.forEach((p) => { p.__len = p.getTotalLength(); p.style.strokeDasharray = `${p.__len} ${p.__len}`; });
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
    const k = el.__enter === undefined ? 0 : easeOut(clamp((time - el.__enter - el.__idx * 0.1) / 0.85));
    el.__k = k;
    el.style.opacity = k;
    el.style.transform = `translateY(${(1 - k) * 60}px)`;
  });
  // Counters run with their section's reveal, or with the intro in the hero.
  for (const el of counters) {
    const host = el.closest("[data-r]");
    const k = host ? (host.__enter === undefined ? 0 : clamp((time - host.__enter - 0.1) / 1.3)) : clamp((intro - 0.7) / 1.4);
    el.textContent = Math.round(+el.dataset.count * easeOut(k));
  }
  const map = routes[0]?.closest("[data-r]");
  routes.forEach((p, i) => {
    const k = map?.__enter === undefined ? 0 : easeOut(clamp((time - map.__enter - 0.35 - i * 0.18) / 0.9));
    p.style.strokeDashoffset = p.__len * (1 - k);
  });
  if (homeRing) {
    const f = (time * 0.8) % 1;
    homeRing.setAttribute("r", 14 + 22 * f);
    homeRing.style.opacity = 0.7 * (1 - f);
  }
}

// ---------------------------------------------------------------- textures
function canvasTexture(w, h, draw, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const skyTexture = () => canvasTexture(16, 1024, (g, w, h) => {
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, "#050912");
  grd.addColorStop(0.45, "#0e1631");
  grd.addColorStop(0.72, "#2a2650");
  grd.addColorStop(0.88, "#8a4f6e");
  grd.addColorStop(1, "#e88f6c");
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
});

// Equirectangular sunset used for reflections on the glass and the water.
const envTexture = () => {
  const t = canvasTexture(1024, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#04070f");
    grd.addColorStop(0.3, "#14204a");
    grd.addColorStop(0.42, "#6a4a7e");
    grd.addColorStop(0.5, "#ffb683");
    grd.addColorStop(0.58, "#5a3040");
    grd.addColorStop(1, "#05070d");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const sun = g.createRadialGradient(w * 0.3, h * 0.49, 0, w * 0.3, h * 0.49, 160);
    sun.addColorStop(0, "rgba(255,214,160,1)");
    sun.addColorStop(1, "rgba(255,150,100,0)");
    g.fillStyle = sun; g.fillRect(0, 0, w, h);
    const r = rand(7);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = r() < 0.7 ? "rgba(255,206,150,0.9)" : "rgba(170,200,255,0.8)";
      g.fillRect(r() * w, h * (0.5 + r() * 0.03), 2, 2);
    }
  });
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
};

const BAYS = 32;
// One floor's facade unrolled around its perimeter: glass bays with mullions.
const glassTexture = () => canvasTexture(1024, 32, (g, w, h) => {
  g.fillStyle = "#5d769f"; g.fillRect(0, 0, w, h);
  const bw = w / BAYS;
  for (let i = 0; i < BAYS; i++) {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#a9bde0"); grd.addColorStop(1, "#4d6795");
    g.fillStyle = grd; g.fillRect(i * bw + 2, 2, bw - 4, h - 4);
  }
});
// Which windows are lit on a floor (warm or cool), as an emissive map.
const litTexture = (seed) => canvasTexture(1024, 32, (g, w, h) => {
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  const r = rand(seed), bw = w / BAYS;
  for (let i = 0; i < BAYS; i++) {
    if (r() > 0.26) continue;
    const warm = r() < 0.8, a = 0.55 + r() * 0.45;
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, warm ? `rgba(255,190,120,${a})` : `rgba(170,200,255,${a})`);
    grd.addColorStop(1, warm ? `rgba(255,230,190,${a})` : `rgba(220,235,255,${a})`);
    g.fillStyle = grd; g.fillRect(i * bw + 3, 3, bw - 6, h - 6);
  }
});

const cityTexture = () => canvasTexture(64, 256, (g, w, h) => {
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  const r = rand(99);
  for (let y = 4; y < h - 4; y += 8) for (let x = 4; x < w - 4; x += 8) {
    if (r() > 0.32) continue;
    g.fillStyle = r() < 0.75 ? "#ffcf96" : "#a9c4ff";
    g.fillRect(x, y, 4, 4);
  }
});

const glowTexture = () => canvasTexture(128, 128, (g, w) => {
  const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  grd.addColorStop(0, "rgba(255,220,170,1)");
  grd.addColorStop(0.25, "rgba(255,180,120,0.45)");
  grd.addColorStop(1, "rgba(255,140,100,0)");
  g.fillStyle = grd; g.fillRect(0, 0, w, w);
});

// ---------------------------------------------------------------- 3D scene
const FLOORS = 88, FH = 0.075, TOWER_H = FLOORS * FH;
const canvas = document.getElementById("gl");
let renderer, scene, camera, tower, floors, crown, rings, glow, crownLight, stars;

function roundedRect(w, d, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// A vertical band that wraps the outline, with u running once around it.
function bandGeometry(shape, height) {
  const pts = shape.getSpacedPoints(160);
  const pos = [], uv = [], idx = [];
  pts.forEach((p, k) => {
    const u = k / (pts.length - 1);
    pos.push(p.x, 0, -p.y, p.x, height, -p.y);
    uv.push(u, 0, u, 1);
    if (k < pts.length - 1) { const a = k * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

async function build() {
  await document.fonts.ready;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const dprParam = +new URLSearchParams(location.search).get("dpr");
  renderer.setPixelRatio(dprParam || Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.Fog("#1d1a3a", 16, 46);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTexture()).texture;
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight("#8aa0d8", "#1a0f18", 0.5));
  const sunset = new THREE.DirectionalLight("#ffae7a", 2.4);
  sunset.position.set(-7, 3, -6);
  scene.add(sunset);
  const fill = new THREE.DirectionalLight("#a8b8ff", 0.55);
  fill.position.set(5, 6, 10);
  scene.add(fill);

  // Water.
  const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: "#0b1428", metalness: 0.9, roughness: 0.3, envMapIntensity: 0.9 }));
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // The tower: 88 floors, each a slab and a glass band, turning 90° from bottom to top.
  tower = new THREE.Group();
  scene.add(tower);
  const outline = roundedRect(1.15, 0.78, 0.26);
  const slabGeo = new THREE.ExtrudeGeometry(roundedRect(1.21, 0.84, 0.29), { depth: 0.016, bevelEnabled: false, curveSegments: 6 });
  slabGeo.rotateX(-Math.PI / 2);
  const bandGeo = bandGeometry(outline, FH - 0.016);
  const slabMat = new THREE.MeshStandardMaterial({ color: "#cdd5e6", metalness: 0.35, roughness: 0.42 });
  const glassMap = glassTexture();
  glassMap.wrapS = THREE.RepeatWrapping;
  const lit = [11, 23, 37, 41, 53, 67, 71, 83].map((s) => { const t = litTexture(s); t.wrapS = THREE.RepeatWrapping; return t; });
  const pick = rand(5);
  floors = [];
  for (let i = 0; i < FLOORS; i++) {
    const f = new THREE.Group();
    const slab = new THREE.Mesh(slabGeo, slabMat);
    const mat = new THREE.MeshStandardMaterial({
      color: "#ffffff", map: glassMap, metalness: 0.85, roughness: 0.14, envMapIntensity: 1.5,
      emissive: "#ffd2a0", emissiveMap: lit[Math.floor(pick() * lit.length)], emissiveIntensity: 0, side: THREE.DoubleSide,
    });
    const band = new THREE.Mesh(bandGeo, mat);
    band.position.y = 0.016;
    f.add(slab, band);
    f.userData = { y: i * FH, rot: (i / (FLOORS - 1)) * Math.PI / 2, mat, lit: 1.1 + pick() * 0.7 };
    tower.add(f);
    floors.push(f);
  }
  // Podium with a warm lobby.
  const podium = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 1.4),
    new THREE.MeshStandardMaterial({ color: "#0a0f1c", metalness: 0.2, roughness: 0.7 }));
  podium.position.y = -0.15;
  tower.add(podium);
  // The crown: two light rings, a glow and a warm light on the top floors.
  crown = new THREE.Group();
  crown.position.y = TOWER_H + 0.32;
  tower.add(crown);
  const ringMat = new THREE.MeshBasicMaterial({ color: "#ffd9a6", toneMapped: false });
  rings = [new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.028, 12, 160), ringMat), new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.016, 10, 140), ringMat)];
  rings.forEach((r, i) => { r.rotation.x = Math.PI / 2; r.position.y = i * 0.16; crown.add(r); });
  glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: "#ffffff", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(4.2, 4.2, 1);
  crown.add(glow);
  crownLight = new THREE.PointLight("#ffbf86", 0, 4, 1.5);
  crown.add(crownLight);

  // The city behind the tower (instanced, lit windows).
  const cityMap = cityTexture();
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "#0d1426", metalness: 0.6, roughness: 0.45, emissive: "#ffffff", emissiveMap: cityMap, emissiveIntensity: 0.55 }), 70);
  const r = rand(21), m = new THREE.Matrix4();
  for (let i = 0; i < 70; i++) {
    const side = i < 14;
    const x = side ? (r() < 0.5 ? -1 : 1) * (5 + r() * 10) : (r() - 0.5) * 40;
    const z = side ? -3 - r() * 4 : -7 - r() * 20;
    const far = clamp((-z - 7) / 20);
    const w = 0.45 + r() * 0.45;
    const h = side ? w * (1.6 + r() * 1.4) : w * (2 + r() * 3) + far * r() * 2.4;
    m.compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 0.6), new THREE.Vector3(w, h, w * (0.7 + r() * 0.6)));
    city.setMatrixAt(i, m);
  }
  scene.add(city);

  // A few stars.
  const sg = new THREE.BufferGeometry(), sp = [], rs = rand(3);
  for (let i = 0; i < 260; i++) {
    const a = rs() * Math.PI * 2, e = 0.12 + rs() * 1.2;
    sp.push(Math.cos(a) * Math.cos(e) * 90, 6 + Math.sin(e) * 90, Math.sin(a) * Math.cos(e) * 90 - 20);
  }
  sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#c8d4ff", size: 0.35, transparent: true, opacity: 0.7, fog: false, depthWrite: false }));
  scene.add(stars);
  resize();
}

function resize() {
  if (!renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = camera.aspect < 0.8 ? 44 : 32;
  camera.updateProjectionMatrix();
  measure();
}
window.addEventListener("resize", resize);

// Camera per section: screen offset of the tower (x, y as a share of the screen), orbit angle,
// elevation, distance, look-at height, and how far the tower has turned.
const DESKTOP = [
  { ox: 0.27, oy: 0, az: -14, el: 4, d: 13.6, ty: 4.05, rot: 0 },
  { ox: -0.27, oy: 0, az: 8, el: 10, d: 13, ty: 3.8, rot: 50 },
  { ox: 0.1, oy: -0.02, az: 0, el: 16, d: 8.4, ty: 5.25, rot: 105 },
  { ox: -0.04, oy: 0.04, az: 16, el: 30, d: 19, ty: 3, rot: 150 },
  { ox: 0, oy: 0, az: -8, el: 6, d: 17, ty: 3.9, rot: 190 },
];
const MOBILE = [
  { ox: 0, oy: 0.22, az: -14, el: 6, d: 19, ty: 3.8, rot: 0 },
  { ox: 0, oy: 0.26, az: 8, el: 12, d: 18, ty: 4.2, rot: 50 },
  { ox: 0, oy: 0.24, az: 0, el: 18, d: 12, ty: 5.3, rot: 105 },
  { ox: 0, oy: -0.42, az: 16, el: 40, d: 22, ty: 2.6, rot: 150 },
  { ox: 0, oy: 0.04, az: -8, el: 6, d: 22, ty: 3.9, rot: 190 },
];

function sceneFrame(time, intro) {
  if (!renderer || !window.innerHeight) return;
  const L = camera.aspect < 0.8 ? MOBILE : DESKTOP;
  const p = clamp(window.scrollY / window.innerHeight, 0, L.length - 1);
  const i0 = Math.floor(p), i1 = Math.min(L.length - 1, i0 + 1), k = smooth(p - i0);
  const v = (key) => lerp(L[i0][key], L[i1][key], k);

  // Intro: floors rise into place from the ground up, then their windows light up.
  floors.forEach((f, i) => {
    const u = f.userData, a = 0.05 + (i / FLOORS) * 1.15;
    const kf = clamp((intro - a) / 0.32);
    f.visible = kf > 0;
    f.scale.setScalar(lerp(0.86, 1, easeOut(kf)));
    f.position.y = u.y + (1 - easeOut(kf)) * 0.5;
    f.rotation.y = u.rot + (1 - easeOut(kf)) * 0.5;
    const kl = clamp((intro - 0.55 - (i / FLOORS) * 0.9) / 0.35);
    u.mat.emissiveIntensity = u.lit * kl * (0.92 + 0.08 * Math.sin(time * 1.7 + i));
  });
  const kc = clamp((intro - 1.3) / 0.6);
  crown.scale.setScalar(Math.max(0.001, easeOutBack(kc)));
  rings[0].rotation.z = time * 0.35;
  rings[1].rotation.z = -time * 0.5;
  glow.material.opacity = kc * (0.75 + 0.15 * Math.sin(time * 2.2));
  crownLight.intensity = kc * 6;

  tower.rotation.y = v("rot") * DEG + time * 0.04;
  const az = (v("az") + Math.sin(time * 0.25) * 3) * DEG, el = v("el") * DEG, d = v("d"), ty = v("ty");
  camera.position.set(Math.sin(az) * Math.cos(el) * d, ty + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  camera.lookAt(0, ty, 0);
  const w = window.innerWidth, h = window.innerHeight;
  camera.setViewOffset(w, h, -v("ox") * w, v("oy") * h, w, h); // ox > 0 moves the tower right, oy > 0 up
  stars.rotation.y = time * 0.01;
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

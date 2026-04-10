import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const BOX  = 8;
const HALF = BOX / 2;

const COL = {
  cream:     0xf0ece4,
  redWall:   0xc42b22,
  greenWall: 0x1e8a3c,
  warmLight: 0xfff8e7,
  bg:        0x06100a,
};

// ═══════════════════════════════════════════
//  RENDERER
// ═══════════════════════════════════════════
const canvas = document.getElementById('three-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
renderer.outputColorSpace   = THREE.SRGBColorSpace;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const scene = new THREE.Scene();
scene.background = new THREE.Color(COL.bg);

// ═══════════════════════════════════════════
//  CAMERA & CONTROLS
// ═══════════════════════════════════════════
const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 13);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping   = true;
controls.dampingFactor   = 0.055;
controls.minDistance     = 7;
controls.maxDistance     = 22;
controls.maxPolarAngle   = Math.PI * 0.74;
controls.minPolarAngle   = Math.PI * 0.08;
controls.minAzimuthAngle = -Math.PI * 0.36;  // ≈ −65° — keeps box always visible
controls.maxAzimuthAngle =  Math.PI * 0.36;  // ≈  +65°
controls.enablePan       = false;
controls.enabled         = false; // enabled after intro

// ═══════════════════════════════════════════
//  POST-PROCESSING
// ═══════════════════════════════════════════
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.5, 0.5, 0.84
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ═══════════════════════════════════════════
//  SQUARE GRID TEXTURE helper
//  Draws a single tile (white fill + subtle border).
//  Tiling at repeat=BOX gives one 1-unit square per world unit.
// ═══════════════════════════════════════════
function makeGridTex(bgCss, lineCss, repeat = BOX) {
  const S   = 256;
  const cv  = document.createElement('canvas');
  cv.width  = S;
  cv.height = S;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = bgCss;
  ctx.fillRect(0, 0, S, S);

  // inset border so tile edges form a visible grid when tiled
  ctx.strokeStyle = lineCss;
  ctx.lineWidth   = 2;
  ctx.strokeRect(1, 1, S - 2, S - 2);

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS     = tex.wrapT   = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return tex;
}

// ═══════════════════════════════════════════
//  CORNELL BOX — walls
// ═══════════════════════════════════════════
function buildWalls() {
  const T = 0.18;

  const texCream = makeGridTex('#f0ece4', 'rgba(120,110,95,0.22)');
  const texRed   = makeGridTex('#c42b22', 'rgba(80, 8,  4, 0.30)');
  const texGreen = makeGridTex('#1e8a3c', 'rgba(8,  50, 18,0.30)');

  const mCream = new THREE.MeshStandardMaterial({ map: texCream, roughness: 0.90, metalness: 0 });
  const mRed   = new THREE.MeshStandardMaterial({ map: texRed,   roughness: 0.88, metalness: 0 });
  const mGreen = new THREE.MeshStandardMaterial({ map: texGreen, roughness: 0.88, metalness: 0 });

  const wall = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };

  wall(BOX,    T,   BOX,   0,    -HALF, 0,     mCream);  // floor
  wall(BOX,    T,   BOX,   0,     HALF, 0,     mCream);  // ceiling
  wall(BOX,    BOX, T,     0,     0,   -HALF,  mCream);  // back
  wall(T,      BOX, BOX,  -HALF,  0,    0,     mRed  );  // left (red)
  wall(T,      BOX, BOX,   HALF,  0,    0,     mGreen);  // right (green)
  // No front wall — open face toward camera
}

// ═══════════════════════════════════════════
//  CORNELL BOX OBJECTS — interactable meshes
// ═══════════════════════════════════════════
const interactables = [];   // { mesh, section, hotspotEl, labelWorld }
const hoverables    = [];   // mesh refs for raycaster

function buildObjects() {
  // shared cream material
  const mCream = new THREE.MeshStandardMaterial({ color: COL.cream, roughness: 0.88, metalness: 0 });

  // ─ Tall box → Projects ─
  const tallH = 3.2;
  const tallBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, tallH, 1.6), mCream);
  tallBox.position.set(-1.6, -HALF + tallH / 2, -1.5);
  tallBox.rotation.y = -0.28;
  tallBox.castShadow = true; tallBox.receiveShadow = true;
  tallBox.userData = { section: 'projects', label: 'Projects',
    labelWorld: new THREE.Vector3(-1.6, -HALF + tallH + 0.7, -1.5) };
  scene.add(tallBox);

  // ─ Short box → Contact ─
  const shortH = 1.6;
  const shortBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, shortH, 1.6), mCream);
  shortBox.position.set(1.5, -HALF + shortH / 2, -1.6);
  shortBox.rotation.y = 0.26;
  shortBox.castShadow = true; shortBox.receiveShadow = true;
  shortBox.userData = { section: 'contact', label: 'Contact',
    labelWorld: new THREE.Vector3(1.5, -HALF + shortH + 0.7, -1.6) };
  scene.add(shortBox);

  // ─ Large sphere → Skills ─
  const largeSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 48, 32),
    new THREE.MeshStandardMaterial({ color: 0xd4c8b0, metalness: 0.08, roughness: 0.38 })
  );
  largeSphere.position.set(-1.4, -HALF + 1.15, 0.6);
  largeSphere.castShadow = true; largeSphere.receiveShadow = true;
  largeSphere.userData = { section: 'skills', label: 'Skills & Languages',
    labelWorld: new THREE.Vector3(-1.4, -HALF + 2.6, 0.6) };
  scene.add(largeSphere);

  // ─ Small sphere → About ─
  const smallSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 36, 24),
    new THREE.MeshStandardMaterial({ color: 0xd8c4a8, metalness: 0, roughness: 0.82 })
  );
  smallSphere.position.set(1.7, -HALF + 0.75, 0.8);
  smallSphere.castShadow = true; smallSphere.receiveShadow = true;
  smallSphere.userData = { section: 'about', label: 'About',
    labelWorld: new THREE.Vector3(1.7, -HALF + 2.1, 0.8) };
  scene.add(smallSphere);

  [tallBox, shortBox, largeSphere, smallSphere].forEach(mesh => {
    hoverables.push(mesh);
    // Store original emissive per material for hover restore
    mesh.material = mesh.material.clone();
    mesh.material.emissive    = new THREE.Color(0x000000);
    mesh.material.emissiveIntensity = 0;

    const el = createHotspot(mesh.userData.label);
    interactables.push({ mesh, section: mesh.userData.section,
      labelWorld: mesh.userData.labelWorld, hotspotEl: el });
  });

  return { tallBox, shortBox, largeSphere, smallSphere };
}

// ═══════════════════════════════════════════
//  BUNNY — colorful low-poly, floating
//  section: "about" (also interactable)
// ═══════════════════════════════════════════
let bunnyMesh;

function buildBunny() {
  const geo = new THREE.IcosahedronGeometry(0.52, 1);
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i += 3) {
    const c = new THREE.Color().setHSL(Math.random(), 0.85, 0.55);
    for (let j = 0; j < 3; j++) {
      cols[(i+j)*3]   = c.r;
      cols[(i+j)*3+1] = c.g;
      cols[(i+j)*3+2] = c.b;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

  const mat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    flatShading:  true,
    shininess:    40,
  });

  bunnyMesh = new THREE.Mesh(geo, mat);
  bunnyMesh.position.set(0, 2.4, -1.5);
  bunnyMesh.castShadow = true;
  bunnyMesh.userData = { section: 'about', label: 'About',
    labelWorld: new THREE.Vector3(0, 3.3, -1.5) };
  scene.add(bunnyMesh);

  hoverables.push(bunnyMesh);
  const el = createHotspot('About');
  interactables.push({ mesh: bunnyMesh, section: 'about',
    labelWorld: bunnyMesh.userData.labelWorld, hotspotEl: el });
}

// ═══════════════════════════════════════════
//  LIGHTING
// ═══════════════════════════════════════════
let ceilLight;

function buildLighting() {
  scene.add(new THREE.AmbientLight(0x3a5040, 0.7));

  // Emissive ceiling panel
  const panelMat = new THREE.MeshStandardMaterial({
    color: COL.warmLight, emissive: COL.warmLight, emissiveIntensity: 2.8,
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.9), panelMat);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, HALF - 0.11, 0);
  scene.add(panel);

  // Pendant globe
  const pendMat = new THREE.MeshStandardMaterial({
    color: COL.warmLight, emissive: COL.warmLight, emissiveIntensity: 4.5,
  });
  const pend = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), pendMat);
  pend.position.set(0, HALF - 0.5, 0);
  scene.add(pend);

  // Shadow-casting point light
  ceilLight = new THREE.PointLight(COL.warmLight, 10, 22, 1.5);
  ceilLight.position.set(0, HALF - 0.5, 0);
  ceilLight.castShadow = true;
  ceilLight.shadow.mapSize.set(1024, 1024);
  ceilLight.shadow.bias   = -0.001;
  ceilLight.shadow.radius = 3;
  scene.add(ceilLight);
}

// ═══════════════════════════════════════════
//  DUST PARTICLES — floating in light beam
// ═══════════════════════════════════════════
let dustPoints;
let dustPositions;

function buildDust() {
  const count = 80;
  dustPositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    dustPositions[i*3]   = (Math.random()*2-1) * (HALF-0.6);
    dustPositions[i*3+1] = Math.random() * (BOX * 0.6) - 1.0;
    dustPositions[i*3+2] = (Math.random()*2-1) * (HALF-0.6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xfff8e7, size: 0.045,
    transparent: true, opacity: 0.38,
    sizeAttenuation: true,
  });
  dustPoints = new THREE.Points(geo, mat);
  scene.add(dustPoints);
}

// ═══════════════════════════════════════════
//  HOTSPOT LABELS  (pure CSS, updated each frame)
// ═══════════════════════════════════════════
const hotspotsContainer = document.getElementById('hotspots');

function createHotspot(label) {
  const el = document.createElement('div');
  el.className = 'hotspot';
  el.innerHTML = `
    <div class="hotspot-ring"></div>
    <span class="hotspot-label">${label}</span>
  `;
  hotspotsContainer.appendChild(el);
  return el;
}

const _scrPos = new THREE.Vector3();

function updateHotspots() {
  for (const item of interactables) {
    _scrPos.copy(item.labelWorld).project(camera);

    // If behind camera, hide
    if (_scrPos.z > 1) { item.hotspotEl.style.opacity = '0'; continue; }

    const x = (_scrPos.x * 0.5 + 0.5) * innerWidth;
    const y = (-_scrPos.y * 0.5 + 0.5) * innerHeight;

    item.hotspotEl.style.opacity = '1';
    item.hotspotEl.style.left = x + 'px';
    item.hotspotEl.style.top  = y + 'px';
  }
}

// ═══════════════════════════════════════════
//  PANEL OPEN / CLOSE
// ═══════════════════════════════════════════
const panel    = document.getElementById('overlay-panel');
const backdrop = document.getElementById('backdrop');
const hint     = document.getElementById('scene-hint');

let panelOpen = false;

function openPanel(section) {
  // Show correct section
  panel.querySelectorAll('.panel-section').forEach(s =>
    s.classList.toggle('active', s.dataset.section === section)
  );
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('active');
  hint.classList.add('hidden');
  panelOpen = true;

  // Dim all hotspots
  interactables.forEach(i => i.hotspotEl.classList.add('dimmed'));

  // Pause orbit
  controls.autoRotate = false;
  // Scroll panel to top
  panel.scrollTop = 0;
}

function closePanel() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('active');
  hint.classList.remove('hidden');
  panelOpen = false;
  interactables.forEach(i => i.hotspotEl.classList.remove('dimmed'));
}

document.getElementById('close-btn').addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

// ═══════════════════════════════════════════
//  RAYCASTING — hover + click
// ═══════════════════════════════════════════
const raycaster  = new THREE.Raycaster();
const _mouse     = new THREE.Vector2();
let   hoveredItem = null;

function getHit(clientX, clientY) {
  _mouse.set(
    (clientX / innerWidth)  * 2 - 1,
    -(clientY / innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(_mouse, camera);
  const hits = raycaster.intersectObjects(hoverables);
  if (!hits.length) return null;
  return interactables.find(i => i.mesh === hits[0].object) || null;
}

// Hover
canvas.addEventListener('pointermove', e => {
  if (panelOpen) return;
  const hit = getHit(e.clientX, e.clientY);

  if (hit !== hoveredItem) {
    // Restore old
    if (hoveredItem) {
      hoveredItem.mesh.material.emissiveIntensity = 0;
      hoveredItem.hotspotEl.classList.remove('hovered');
    }
    // Highlight new
    if (hit) {
      hit.mesh.material.emissiveIntensity = 0.22;
      hit.hotspotEl.classList.add('hovered');
      canvas.classList.add('pointer');
    } else {
      canvas.classList.remove('pointer');
    }
    hoveredItem = hit;
  }
});

// Click / tap — distinguish from orbit drag
let pointerMoved = false;
canvas.addEventListener('pointerdown', () => { pointerMoved = false; });
canvas.addEventListener('pointermove', e => { if (e.buttons) pointerMoved = true; });
canvas.addEventListener('pointerup', e => {
  if (pointerMoved || panelOpen) return;
  const hit = getHit(e.clientX, e.clientY);
  if (hit) {
    // Quick scale pulse on click
    clickPulse(hit.mesh);
    openPanel(hit.section);
  }
});

function clickPulse(mesh) {
  const s = mesh.scale;
  s.setScalar(1.08);
  const t0 = performance.now();
  const restore = (t) => {
    const p = Math.min((t - t0) / 250, 1);
    s.setScalar(1 + 0.08 * (1 - p));
    if (p < 1) requestAnimationFrame(restore);
  };
  requestAnimationFrame(restore);
}

// ═══════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════
function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth, innerHeight);
}
window.addEventListener('resize', onResize);
onResize();

// ═══════════════════════════════════════════
//  INTRO — slow camera dolly-in
// ═══════════════════════════════════════════
const INTRO_START_Z  = 22;
const INTRO_END_Z    = 13;
const INTRO_DUR      = 2400; // ms
let   introProgress  = 0;
camera.position.z    = INTRO_START_Z;

// ═══════════════════════════════════════════
//  ANIMATE LOOP
// ═══════════════════════════════════════════
let prev = performance.now();

// Store per-object base positions for gentle bob
const objectAnims = []; // populated after build

function animate() {
  requestAnimationFrame(animate);

  const now   = performance.now();
  const delta = Math.min((now - prev) / 1000, 0.05);
  prev = now;

  // ── Intro dolly-in ──
  if (introProgress < 1) {
    introProgress += delta / (INTRO_DUR / 1000);
    const t = 1 - Math.pow(1 - Math.min(introProgress, 1), 3); // ease-out cubic
    camera.position.z = INTRO_START_Z + (INTRO_END_Z - INTRO_START_Z) * t;
    if (introProgress >= 1) controls.enabled = true;
  }

  // ── Subtle object animations ──
  for (const a of objectAnims) {
    a.mesh.position.y = a.baseY + Math.sin(now * a.freq + a.phase) * a.amp;
    if (a.rotY) a.mesh.rotation.y += a.rotY;
  }

  // ── Bunny spin + bob ──
  if (bunnyMesh) {
    bunnyMesh.rotation.y += 0.011;
    bunnyMesh.rotation.x += 0.004;
    bunnyMesh.position.y  = 2.4 + Math.sin(now * 0.0009) * 0.16;
    // Keep bunny hotspot label world pos in sync
    const bunnyItem = interactables.find(i => i.mesh === bunnyMesh);
    if (bunnyItem) bunnyItem.labelWorld.y = bunnyMesh.position.y + 0.9;
  }

  // ── Dust particles drift ──
  if (dustPositions && dustPoints) {
    for (let i = 0; i < dustPositions.length / 3; i++) {
      dustPositions[i*3+1] += Math.sin(now * 0.0004 + i * 0.7) * 0.0006;
      dustPositions[i*3]   += Math.cos(now * 0.0003 + i * 0.5) * 0.0003;
      // Wrap vertically
      if (dustPositions[i*3+1] > HALF - 0.2) dustPositions[i*3+1] = -HALF + 0.2;
    }
    dustPoints.geometry.attributes.position.needsUpdate = true;
  }

  // ── Ceiling light flicker (very subtle) ──
  if (ceilLight) {
    ceilLight.intensity = 10 + Math.sin(now * 0.0024) * 0.35;
  }

  // ── Update hotspot label positions ──
  updateHotspots();

  controls.update();
  composer.render();
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
buildWalls();
const { tallBox, shortBox, largeSphere, smallSphere } = buildObjects();
buildBunny();
buildLighting();
buildDust();

// Register per-object gentle bob animations
objectAnims.push(
  { mesh: largeSphere, baseY: largeSphere.position.y, freq: 0.0007, phase: 0.0,  amp: 0.06, rotY: 0.003 },
  { mesh: smallSphere, baseY: smallSphere.position.y, freq: 0.0009, phase: 1.2,  amp: 0.05, rotY: 0.004 },
  { mesh: tallBox,     baseY: tallBox.position.y,     freq: 0.0005, phase: 2.4,  amp: 0.04, rotY: 0.001 },
  { mesh: shortBox,    baseY: shortBox.position.y,    freq: 0.0006, phase: 0.8,  amp: 0.04, rotY: -0.0015 },
);

animate();

// Hide loading screen after first render
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 500);
});

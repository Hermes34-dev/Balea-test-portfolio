import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
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
renderer.shadowMap.type     = THREE.PCFShadowMap;   // cheaper than PCFSoft
renderer.outputColorSpace   = THREE.SRGBColorSpace;
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;  // was 1.25 — walls were overblown

// Environment map — gives metallic + glass surfaces real reflections.
// PMREMGenerator runs once at startup (not per-frame) so no runtime cost.
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture;
pmremGenerator.dispose();

const scene = new THREE.Scene();
scene.background    = new THREE.Color(COL.bg);
scene.environment   = envTexture;
scene.environmentIntensity = 0.28; // subtle — Cornell Box lights dominate

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

// Half-res bloom: 4× fewer pixels in every bloom pass, nearly invisible quality delta
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth * 0.5, innerHeight * 0.5),
  0.55, 0.45, 0.86
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ═══════════════════════════════════════════
//  CHECKERBOARD TEXTURE helper
//  A 2×2 alternating-colour tile; repeat(4,4) on an 8-unit face
//  produces 8×8 checker squares ≈ 1 world-unit each.
//  NearestFilter keeps the edges crisp (no bilinear blurring).
// ═══════════════════════════════════════════
function makeCheckerTex(colorA, colorB) {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d');

  const h = S / 2;
  ctx.fillStyle = colorA;
  ctx.fillRect(0, 0, h, h);   // top-left
  ctx.fillRect(h, h, h, h);   // bottom-right

  ctx.fillStyle = colorB;
  ctx.fillRect(h, 0, h, h);   // top-right
  ctx.fillRect(0, h, h, h);   // bottom-left

  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS     = tex.wrapT   = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);                                  // 8×8 tiles per face
  tex.magFilter = THREE.NearestFilter;                   // pixel-crisp edges
  tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return tex;
}

// ═══════════════════════════════════════════
//  CORNELL BOX — walls
// ═══════════════════════════════════════════
function buildWalls() {
  const T = 0.18;

  // Floor — dark warm wood so it reads as "ground"
  const texFloor = makeCheckerTex('#7a6548', '#5a4535');
  // Ceiling — dimmed off-white, not the blinding cream
  const texCeil  = makeCheckerTex('#b8b4ac', '#989490');
  // Back wall — muted warm taupe, middle value between floor and ceiling
  const texBack  = makeCheckerTex('#c4c0b8', '#a4a09a');
  const texRed   = makeCheckerTex('#cc2e24', '#9e2218');  // bright red ↔ dark red
  const texGreen = makeCheckerTex('#228a40', '#176c31');  // leaf green ↔ deep green

  const mFloor = new THREE.MeshStandardMaterial({ map: texFloor, roughness: 0.92, metalness: 0 });
  const mCeil  = new THREE.MeshStandardMaterial({ map: texCeil,  roughness: 0.90, metalness: 0 });
  const mBack  = new THREE.MeshStandardMaterial({ map: texBack,  roughness: 0.90, metalness: 0 });
  const mRed   = new THREE.MeshStandardMaterial({ map: texRed,   roughness: 0.88, metalness: 0 });
  const mGreen = new THREE.MeshStandardMaterial({ map: texGreen, roughness: 0.88, metalness: 0 });

  const wall = (w, h, d, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };

  wall(BOX,    T,   BOX,   0,    -HALF, 0,     mFloor); // floor  — dark warm wood
  wall(BOX,    T,   BOX,   0,     HALF, 0,     mCeil);  // ceiling — dim off-white
  wall(BOX,    BOX, T,     0,     0,   -HALF,  mBack);  // back wall — muted taupe
  wall(T,      BOX, BOX,  -HALF,  0,    0,     mRed  ); // left (red)
  wall(T,      BOX, BOX,   HALF,  0,    0,     mGreen); // right (green)
  // No front wall — open face toward camera
}

// ═══════════════════════════════════════════
//  CORNELL BOX OBJECTS — interactable meshes
//
//  Classic CG reference models, each mapped to a portfolio section:
//   Utah Teapot      → Projects  (the most iconic CG test object)
//   Torus Knot       → Skills    (mathematical elegance)
//   Crystal Gem      → About     (octahedron — clean, sharp)
//   Dodecahedron     → Contact   (organic, approachable)
// ═══════════════════════════════════════════
const interactables = [];   // { mesh, section, hotspotEl, labelWorld }
const hoverables    = [];   // mesh refs for raycaster

/** Place a mesh so its bounding-box bottom sits on surfaceY. */
function seatOn(mesh, surfaceY) {
  mesh.geometry.computeBoundingBox();
  mesh.position.y = surfaceY - mesh.geometry.boundingBox.min.y;
}

/** World Y of the top of a mesh's bounding box. */
function topY(mesh) {
  mesh.geometry.computeBoundingBox();
  return mesh.position.y + mesh.geometry.boundingBox.max.y;
}

// ═══════════════════════════════════════════
//  CLASSICAL PEDESTAL  (octagonal, 3-part)
//  Returns the world-Y of the top surface.
// ═══════════════════════════════════════════
const pedestalMat = new THREE.MeshStandardMaterial({
  color: 0xf0ebe2, roughness: 0.28, metalness: 0.04,
});

function buildPedestal(x, z, totalH = 2.4) {
  const SEGS   = 8;          // octagonal cross-section
  const baseH  = 0.18;
  const capH   = 0.22;
  const shaftH = totalH - baseH - capH;

  const addPart = (rTop, rBot, h, yBot) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBot, h, SEGS),
      pedestalMat
    );
    m.position.set(x, yBot + h / 2, z);
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  };

  const y0 = -HALF;
  addPart(0.60, 0.64, baseH,  y0);                        // plinth
  addPart(0.30, 0.35, shaftH, y0 + baseH);                // shaft
  addPart(0.53, 0.32, capH,   y0 + baseH + shaftH);       // capital

  return y0 + totalH;   // top surface Y
}

// ═══════════════════════════════════════════
//  CORNELL BOX OBJECTS — interactable meshes
// ═══════════════════════════════════════════
function buildObjects() {

  // ─── 1. Utah Teapot on column → Projects ────────────────────────────
  const pedestalTopL = buildPedestal(-1.8, -1.3, 3.2);   // taller column

  const teapotGeo = new TeapotGeometry(0.85, 10);
  const teapot = new THREE.Mesh(teapotGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0xfaf5f0,
      roughness: 0.07,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,   // glazed white porcelain
    })
  );
  teapot.rotation.y = -0.5;
  teapot.position.set(-1.8, 0, -1.3);
  seatOn(teapot, pedestalTopL);
  teapot.castShadow = true; teapot.receiveShadow = true;
  teapot.userData = { section: 'projects', label: 'Projects',
    labelWorld: new THREE.Vector3(-1.8, topY(teapot) + 0.4, -1.3) };
  scene.add(teapot);

  // ─── 2. Torus Knot (floating) → Skills ──────────────────────────────
  const tkGeo = new THREE.TorusKnotGeometry(0.65, 0.22, 160, 18, 3, 2);
  const torusKnot = new THREE.Mesh(tkGeo,
    new THREE.MeshStandardMaterial({
      color: 0xd4a827, metalness: 0.97, roughness: 0.08,  // polished gold
    })
  );
  torusKnot.position.set(-1.6, -HALF + 1.85, 0.6);
  torusKnot.castShadow = true; torusKnot.receiveShadow = true;
  torusKnot.userData = { section: 'skills', label: 'Skills & Languages',
    labelWorld: new THREE.Vector3(-1.6, -HALF + 3.1, 0.6) };
  scene.add(torusKnot);

  // ─── 3. Cornell-palette icosahedron (floating) → About ─────────────
  // Each face painted in red / cream / green — the Cornell Box is his identity
  // (it appears on his business card, he wrote the raytracer that rendered it).
  let gemGeo = new THREE.IcosahedronGeometry(0.80, 0); // 20 flat faces
  gemGeo = gemGeo.toNonIndexed();                       // unique verts per face
  gemGeo.computeVertexNormals();
  {
    const cbPalette = [
      new THREE.Color(0xcc2e24),  // Cornell red
      new THREE.Color(0xe8e2d8),  // Cornell cream
      new THREE.Color(0x228a40),  // Cornell green
    ];
    const aPos  = gemGeo.attributes.position;
    const aCols = new Float32Array(aPos.count * 3);
    for (let i = 0, fi = 0; i < aPos.count; i += 3, fi++) {
      const c = cbPalette[fi % cbPalette.length];
      for (let j = 0; j < 3; j++) {
        aCols[(i+j)*3]   = c.r;
        aCols[(i+j)*3+1] = c.g;
        aCols[(i+j)*3+2] = c.b;
      }
    }
    gemGeo.setAttribute('color', new THREE.BufferAttribute(aCols, 3));
  }
  const gem = new THREE.Mesh(gemGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.55,
      metalness: 0.08,
    })
  );
  gem.position.set(1.75, -HALF + 1.55, 0.7);
  gem.castShadow = true; gem.receiveShadow = true;
  gem.userData = { section: 'about', label: 'About',
    labelWorld: new THREE.Vector3(1.75, -HALF + 2.7, 0.7) };
  scene.add(gem);

  // ─── 4. Dodecahedron on column → Contact ────────────────────────────
  const pedestalTopR = buildPedestal(1.7, -1.55, 2.8);   // taller column

  // Multicolor flat-poly dodecahedron — same vibrant vertex-color technique as the bunny
  let dodecGeo = new THREE.DodecahedronGeometry(0.78, 0);
  dodecGeo = dodecGeo.toNonIndexed();
  dodecGeo.computeVertexNormals();
  {
    const dPos  = dodecGeo.attributes.position;
    const dCols = new Float32Array(dPos.count * 3);
    for (let i = 0; i < dPos.count; i += 3) {
      const c = new THREE.Color().setHSL(Math.random(), 0.88, 0.52);
      for (let j = 0; j < 3; j++) {
        dCols[(i+j)*3]   = c.r;
        dCols[(i+j)*3+1] = c.g;
        dCols[(i+j)*3+2] = c.b;
      }
    }
    dodecGeo.setAttribute('color', new THREE.BufferAttribute(dCols, 3));
  }
  const dodec = new THREE.Mesh(dodecGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.60,
      metalness: 0.05,
    })
  );
  dodec.position.set(1.7, 0, -1.55);
  seatOn(dodec, pedestalTopR);
  dodec.castShadow = true; dodec.receiveShadow = true;
  dodec.userData = { section: 'contact', label: 'Contact',
    labelWorld: new THREE.Vector3(1.7, topY(dodec) + 0.35, -1.55) };
  scene.add(dodec);

  // ─── Register all as interactables ───────────────────────────────────
  [teapot, torusKnot, gem, dodec].forEach(mesh => {
    hoverables.push(mesh);
    mesh.material = mesh.material.clone();
    mesh.material.emissive = new THREE.Color(0x000000);
    mesh.material.emissiveIntensity = 0;

    const el = createHotspot(mesh.userData.label);
    interactables.push({ mesh, section: mesh.userData.section,
      labelWorld: mesh.userData.labelWorld, hotspotEl: el });
  });

  return { teapot, torusKnot, gem, dodec };
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

  // Purely decorative — no hotspot, no raycasting target
  bunnyMesh = new THREE.Mesh(geo, mat);
  bunnyMesh.position.set(0, 2.4, -1.5);
  bunnyMesh.castShadow = true;
  scene.add(bunnyMesh);
}

// ═══════════════════════════════════════════
//  LIGHTING
// ═══════════════════════════════════════════
let ceilLight;

function buildLighting() {
  scene.add(new THREE.AmbientLight(0x3a5040, 0.45));  // was 0.7

  // Emissive ceiling panel
  const panelMat = new THREE.MeshStandardMaterial({
    color: COL.warmLight, emissive: COL.warmLight, emissiveIntensity: 1.8,  // was 2.8
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.9), panelMat);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, HALF - 0.11, 0);
  scene.add(panel);

  // Pendant globe
  const pendMat = new THREE.MeshStandardMaterial({
    color: COL.warmLight, emissive: COL.warmLight, emissiveIntensity: 3.0,  // was 4.5
  });
  const pend = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), pendMat);
  pend.position.set(0, HALF - 0.5, 0);
  scene.add(pend);

  // Shadow-casting point light
  ceilLight = new THREE.PointLight(COL.warmLight, 7, 22, 1.5);  // was 10
  ceilLight.position.set(0, HALF - 0.5, 0);
  ceilLight.castShadow = true;
  ceilLight.shadow.mapSize.set(512, 512);  // halved — still smooth, half the VRAM
  ceilLight.shadow.bias   = -0.001;
  ceilLight.shadow.radius = 3;
  scene.add(ceilLight);

  // Cool blue fill from the open front face — mimics sky bounce light
  // in a real path-traced Cornell Box render
  const fillLight = new THREE.DirectionalLight(0x8ab4d4, 0.55);
  fillLight.position.set(0, 1, 10);
  fillLight.target.position.set(0, 0, 0);
  scene.add(fillLight);
  scene.add(fillLight.target);
}

// ═══════════════════════════════════════════
//  DUST PARTICLES — floating in light beam
// ═══════════════════════════════════════════
let dustPoints;
let dustPositions;

function buildDust() {
  const count = 40;
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
  // Use getBoundingClientRect so coords are correct on mobile
  // even when browser chrome / safe-areas affect innerWidth/innerHeight
  const rect = canvas.getBoundingClientRect();
  _mouse.set(
    ((clientX - rect.left) / rect.width)  *  2 - 1,
    ((clientY - rect.top)  / rect.height) * -2 + 1
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

// Click / tap — use the browser's native click event so mobile taps work
// instantly without needing a long press.  The browser already filters
// out drags (it won't fire 'click' after a pointer has moved significantly),
// so we don't need our own drag-threshold tracking.
canvas.addEventListener('click', e => {
  if (panelOpen) return;
  const hit = getHit(e.clientX, e.clientY);
  if (hit) {
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
  bloom.resolution.set(innerWidth * 0.5, innerHeight * 0.5);
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
    if (a.rotX) a.mesh.rotation.x += a.rotX;
    if (a.rotZ) a.mesh.rotation.z += a.rotZ;
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
const { teapot, torusKnot, gem, dodec } = buildObjects();
buildBunny();
buildLighting();
buildDust();

// Per-object animation: bob amplitude + multi-axis rotation
// Teapot sits on floor — bob is subtle so it doesn't clip
// Torus Knot tumbles on all axes for maximum visual interest
objectAnims.push(
  { mesh: teapot,    baseY: teapot.position.y,    freq: 0.0005, phase: 0.0, amp: 0.03, rotY:  0.006 },
  { mesh: torusKnot, baseY: torusKnot.position.y, freq: 0.0007, phase: 1.5, amp: 0.12, rotY:  0.014, rotX: 0.007, rotZ: 0.004 },
  { mesh: gem,       baseY: gem.position.y,        freq: 0.0009, phase: 3.0, amp: 0.10, rotY:  0.010, rotX: 0.005 },
  { mesh: dodec,     baseY: dodec.position.y,      freq: 0.0006, phase: 4.5, amp: 0.08, rotY: -0.008, rotX: 0.003 },
);

animate();

// Hide loading screen after first render
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 500);
});

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════
const BOX  = 8;          // Cornell Box full size
const HALF = BOX / 2;
const MAX_BALLS   = 30;
const BALL_SPEED  = 20;
const TARGET_COUNT = 3;

const C = {
  cream:      0xf0ece4,
  redWall:    0xc42b22,
  greenWall:  0x1e8a3c,
  warmLight:  0xfff8e7,
  darkBg:     0x07120b,
  accent:     0x22c55e,
};

// ═══════════════════════════════════════════
//  RENDERER
// ═══════════════════════════════════════════
const container = document.getElementById('canvas-container');
const canvas    = document.getElementById('three-canvas');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.outputColorSpace  = THREE.SRGBColorSpace;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.darkBg);
scene.fog = new THREE.Fog(C.darkBg, 25, 50);

// ═══════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
camera.position.set(0, 1.2, 13);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping   = true;
controls.dampingFactor   = 0.06;
controls.minDistance     = 7;
controls.maxDistance     = 22;
controls.maxPolarAngle   = Math.PI * 0.78;
controls.minPolarAngle   = Math.PI * 0.08;
controls.enablePan       = false;
controls.autoRotate      = false;
controls.autoRotateSpeed = 0.4;

// ═══════════════════════════════════════════
//  POST-PROCESSING
// ═══════════════════════════════════════════
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(512, 512), // resized on first frame
  0.55, // strength
  0.45, // radius
  0.82  // threshold
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ═══════════════════════════════════════════
//  PHYSICS WORLD
// ═══════════════════════════════════════════
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
world.broadphase  = new CANNON.SAPBroadphase(world);
world.allowSleep  = true;

const matWall = new CANNON.Material('wall');
const matBall = new CANNON.Material('ball');

world.addContactMaterial(new CANNON.ContactMaterial(matWall, matBall, {
  friction: 0.25, restitution: 0.68
}));
world.addContactMaterial(new CANNON.ContactMaterial(matBall, matBall, {
  friction: 0.1,  restitution: 0.55
}));

function makeStaticBox(hx, hy, hz, x, y, z, qEuler) {
  const body = new CANNON.Body({ mass: 0, material: matWall });
  body.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
  body.position.set(x, y, z);
  if (qEuler) body.quaternion.setFromEuler(...qEuler);
  world.addBody(body);
  return body;
}

function makeStaticSphere(r, x, y, z) {
  const body = new CANNON.Body({ mass: 0, material: matWall });
  body.addShape(new CANNON.Sphere(r));
  body.position.set(x, y, z);
  world.addBody(body);
  return body;
}

// ═══════════════════════════════════════════
//  CORNELL BOX
// ═══════════════════════════════════════════
function buildCornellBox() {
  const T  = 0.18; // wall thickness
  const HT = T / 2;

  const matCream = new THREE.MeshStandardMaterial({
    color: C.cream, roughness: 0.92, metalness: 0,
  });
  const matRed   = new THREE.MeshStandardMaterial({
    color: C.redWall, roughness: 0.88, metalness: 0,
  });
  const matGreen = new THREE.MeshStandardMaterial({
    color: C.greenWall, roughness: 0.88, metalness: 0,
  });

  const addWall = (w, h, d, x, y, z, mat, physHalf) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    if (physHalf)
      makeStaticBox(...physHalf, x, y, z);
  };

  // Floor
  addWall(BOX, T, BOX, 0, -HALF, 0, matCream, [HALF, HT, HALF]);
  // Ceiling
  addWall(BOX, T, BOX, 0,  HALF, 0, matCream, [HALF, HT, HALF]);
  // Back wall
  addWall(BOX, BOX, T, 0, 0, -HALF, matCream, [HALF, HALF, HT]);
  // Left wall – RED
  addWall(T, BOX, BOX, -HALF, 0, 0, matRed,   [HT, HALF, HALF]);
  // Right wall – GREEN
  addWall(T, BOX, BOX,  HALF, 0, 0, matGreen, [HT, HALF, HALF]);
  // (No front wall — open face toward camera)
}

// ═══════════════════════════════════════════
//  CORNELL BOX OBJECTS (classic scene)
// ═══════════════════════════════════════════
function buildBoxObjects() {
  const matCream = new THREE.MeshStandardMaterial({
    color: C.cream, roughness: 0.88, metalness: 0,
  });

  // ── Tall box (back-left, rotated) ──
  const tallH  = 3.2;
  const tallGeo = new THREE.BoxGeometry(1.6, tallH, 1.6);
  const tallMesh = new THREE.Mesh(tallGeo, matCream);
  tallMesh.position.set(-1.6, -HALF + tallH/2, -1.5);
  tallMesh.rotation.y = -0.28;
  tallMesh.castShadow = true; tallMesh.receiveShadow = true;
  scene.add(tallMesh);
  {
    const b = new CANNON.Body({ mass: 0, material: matWall });
    b.addShape(new CANNON.Box(new CANNON.Vec3(0.8, tallH/2, 0.8)));
    b.position.set(-1.6, -HALF + tallH/2, -1.5);
    b.quaternion.setFromEuler(0, -0.28, 0);
    world.addBody(b);
  }

  // ── Short box (back-right, rotated) ──
  const shortH  = 1.6;
  const shortGeo = new THREE.BoxGeometry(1.6, shortH, 1.6);
  const shortMesh = new THREE.Mesh(shortGeo, matCream);
  shortMesh.position.set(1.5, -HALF + shortH/2, -1.6);
  shortMesh.rotation.y = 0.26;
  shortMesh.castShadow = true; shortMesh.receiveShadow = true;
  scene.add(shortMesh);
  {
    const b = new CANNON.Body({ mass: 0, material: matWall });
    b.addShape(new CANNON.Box(new CANNON.Vec3(0.8, shortH/2, 0.8)));
    b.position.set(1.5, -HALF + shortH/2, -1.6);
    b.quaternion.setFromEuler(0, 0.26, 0);
    world.addBody(b);
  }

  // ── Large metallic sphere ──
  const lsr = 1.15;
  const lsMesh = new THREE.Mesh(
    new THREE.SphereGeometry(lsr, 48, 32),
    new THREE.MeshStandardMaterial({ color: 0xd4c8b0, metalness: 0.08, roughness: 0.38 })
  );
  lsMesh.position.set(-1.4, -HALF + lsr, 0.6);
  lsMesh.castShadow = true; lsMesh.receiveShadow = true;
  scene.add(lsMesh);
  makeStaticSphere(lsr, -1.4, -HALF + lsr, 0.6);

  // ── Small matte sphere ──
  const ssr = 0.75;
  const ssMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ssr, 36, 24),
    new THREE.MeshStandardMaterial({ color: 0xd8c4a8, metalness: 0, roughness: 0.82 })
  );
  ssMesh.position.set(1.7, -HALF + ssr, 0.8);
  ssMesh.castShadow = true; ssMesh.receiveShadow = true;
  scene.add(ssMesh);
  makeStaticSphere(ssr, 1.7, -HALF + ssr, 0.8);
}

// ═══════════════════════════════════════════
//  LIGHTING
// ═══════════════════════════════════════════
let ceilingLight;

function buildLighting() {
  // Ambient – low, warm
  scene.add(new THREE.AmbientLight(0x405040, 0.6));

  // Emissive ceiling panel (visual)
  const panelMat = new THREE.MeshStandardMaterial({
    color:    C.warmLight,
    emissive: C.warmLight,
    emissiveIntensity: 2.5,
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), panelMat);
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, HALF - 0.12, 0);
  scene.add(panel);

  // Pendant sphere
  const pendantMat = new THREE.MeshStandardMaterial({
    color:    C.warmLight,
    emissive: C.warmLight,
    emissiveIntensity: 4,
  });
  const pendant = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), pendantMat);
  pendant.position.set(0, HALF - 0.52, 0);
  scene.add(pendant);

  // Point light from ceiling
  ceilingLight = new THREE.PointLight(C.warmLight, 9, 20, 1.6);
  ceilingLight.position.set(0, HALF - 0.52, 0);
  ceilingLight.castShadow = true;
  ceilingLight.shadow.mapSize.set(1024, 1024);
  ceilingLight.shadow.bias   = -0.001;
  ceilingLight.shadow.radius = 3;
  scene.add(ceilingLight);
}

// ═══════════════════════════════════════════
//  COLORFUL LOW-POLY BUNNY  (vertex-coloured icosahedron)
//  Floats in upper area, rotates → nod to card-back
// ═══════════════════════════════════════════
let bunnyMesh;

function buildBunny() {
  const geo = new THREE.IcosahedronGeometry(0.55, 1);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i += 3) {
    const hue = Math.random();
    const col = new THREE.Color().setHSL(hue, 0.85, 0.55);
    for (let j = 0; j < 3; j++) {
      colors[(i + j) * 3]     = col.r;
      colors[(i + j) * 3 + 1] = col.g;
      colors[(i + j) * 3 + 2] = col.b;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    flatShading:  true,
    shininess:    40,
  });

  bunnyMesh = new THREE.Mesh(geo, mat);
  bunnyMesh.position.set(0, 2.6, -1.5);
  bunnyMesh.castShadow = true;
  scene.add(bunnyMesh);
}

// ═══════════════════════════════════════════
//  TARGETS  (glowing octahedra — hit for points)
// ═══════════════════════════════════════════
const targets = [];

const TARGET_SPAWN_ZONES = [
  new THREE.Vector3(-2.0,  0.5, -1.2),
  new THREE.Vector3( 2.2,  0.2, -1.8),
  new THREE.Vector3( 0.0, -0.8, -0.5),
];

function buildTargets() {
  TARGET_SPAWN_ZONES.forEach((pos, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color:            0x22ff88,
      emissive:         0x00cc55,
      emissiveIntensity: 1.2,
      metalness: 0,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat);
    mesh.position.copy(pos);
    mesh.castShadow = true;
    scene.add(mesh);
    targets.push({ mesh, isHit: false, baseY: pos.y, basePos: pos.clone(), index: i });
  });
}

function respawnTarget(t) {
  const margin = 1.5;
  t.mesh.position.set(
    (Math.random() * 2 - 1) * (HALF - margin),
    (Math.random() * 0.6 - 0.2),
    (Math.random() * 2 - 1) * (HALF - margin) * 0.5 - 0.8
  );
  t.baseY = t.mesh.position.y;
  t.mesh.material.color.set(0x22ff88);
  t.mesh.material.emissive.set(0x00cc55);
  t.mesh.material.emissiveIntensity = 1.2;
  t.isHit = false;
}

// ═══════════════════════════════════════════
//  BALLS  (player-thrown physics spheres)
// ═══════════════════════════════════════════
const balls = [];
let totalBalls  = 0;
let score       = 0;
let bestScore   = parseInt(localStorage.getItem('balea_best') || '0');
const raycaster = new THREE.Raycaster();
const throwPlaneNormal = new THREE.Vector3(0, 0, 1);
const throwPlane = new THREE.Plane(throwPlaneNormal, -(HALF - 0.6));

document.getElementById('best-score').textContent = bestScore;

function throwBall(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const nx = ((clientX - rect.left) / rect.width)  * 2 - 1;
  const ny = -((clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);

  // Aim point: intersection with a plane at the front of the Cornell Box
  const aimPt = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(throwPlane, aimPt)) {
    aimPt.set(0, 0, 0);
  }

  // Spawn just ahead of camera
  const spawnPt = camera.position.clone()
    .addScaledVector(raycaster.ray.direction, 1.8);

  const radius = 0.15 + Math.random() * 0.18;
  const hue    = Math.random();

  // Visual mesh
  const geo  = new THREE.SphereGeometry(radius, 20, 14);
  const col  = new THREE.Color().setHSL(hue, 0.88, 0.55);
  const mat  = new THREE.MeshStandardMaterial({
    color:             col,
    emissive:          col,
    emissiveIntensity: 0.35,
    metalness: 0.2,
    roughness: 0.35,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(spawnPt);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Physics body
  const body = new CANNON.Body({
    mass:            1,
    material:        matBall,
    linearDamping:   0.06,
    angularDamping:  0.06,
    allowSleep:      true,
    sleepSpeedLimit: 0.4,
    sleepTimeLimit:  1.5,
  });
  body.addShape(new CANNON.Sphere(radius));
  body.position.set(spawnPt.x, spawnPt.y, spawnPt.z);

  const dir = new THREE.Vector3().subVectors(aimPt, spawnPt).normalize();
  body.velocity.set(dir.x * BALL_SPEED, dir.y * BALL_SPEED, dir.z * BALL_SPEED);
  world.addBody(body);

  balls.push({ mesh, body });
  totalBalls++;
  document.getElementById('ball-count').textContent = totalBalls;

  // Remove oldest when over limit
  if (balls.length > MAX_BALLS) {
    const old = balls.shift();
    scene.remove(old.mesh);
    old.mesh.geometry.dispose();
    old.mesh.material.dispose();
    world.removeBody(old.body);
  }
}

// ═══════════════════════════════════════════
//  SCORE / TARGET HIT
// ═══════════════════════════════════════════
const scoreBurst = document.getElementById('score-burst');

function hitTarget(t, ballMesh) {
  t.isHit = true;

  // Flash effect
  t.mesh.material.color.set(0xffffff);
  t.mesh.material.emissive.set(0xffffff);
  t.mesh.material.emissiveIntensity = 8;

  // Update score
  score += 10;
  document.getElementById('score-value').textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('balea_best', bestScore);
    document.getElementById('best-score').textContent = bestScore;
  }

  // Score burst UI animation
  const rect  = canvas.getBoundingClientRect();
  const pos3D = ballMesh.position.clone().project(camera);
  const sx    = (pos3D.x * 0.5 + 0.5) * rect.width  + rect.left;
  const sy    = (-pos3D.y * 0.5 + 0.5) * rect.height + rect.top;
  scoreBurst.textContent = '+10';
  scoreBurst.style.left  = sx + 'px';
  scoreBurst.style.top   = sy + 'px';
  scoreBurst.style.opacity = '1';
  scoreBurst.style.transform = 'translateY(0px)';

  requestAnimationFrame(() => {
    scoreBurst.style.transition = 'opacity 0.8s, transform 0.8s';
    scoreBurst.style.opacity    = '0';
    scoreBurst.style.transform  = 'translateY(-50px)';
  });
  setTimeout(() => { scoreBurst.style.transition = 'none'; }, 900);

  // Respawn after delay
  setTimeout(() => respawnTarget(t), 1600);
}

function checkCollisions() {
  for (const { mesh: bm } of balls) {
    for (const t of targets) {
      if (t.isHit) continue;
      if (bm.position.distanceTo(t.mesh.position) < 0.5) {
        hitTarget(t, bm);
      }
    }
  }
}

// ═══════════════════════════════════════════
//  GRAVITY TOGGLE
// ═══════════════════════════════════════════
let gravOn = true;
document.getElementById('gravity-btn').addEventListener('click', () => {
  gravOn = !gravOn;
  world.gravity.set(0, gravOn ? -9.82 : 0, 0);
  document.getElementById('gravity-btn').textContent = gravOn ? '🌍' : '🚀';
  // Wake sleeping bodies
  for (const { body } of balls) body.wakeUp();
});

// ═══════════════════════════════════════════
//  RESET
// ═══════════════════════════════════════════
document.getElementById('reset-btn').addEventListener('click', () => {
  for (const { mesh, body } of balls) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    world.removeBody(body);
  }
  balls.length  = 0;
  totalBalls    = 0;
  document.getElementById('ball-count').textContent = '0';
});

// ═══════════════════════════════════════════
//  EXPLODE
// ═══════════════════════════════════════════
document.getElementById('explode-btn').addEventListener('click', () => {
  for (const { body } of balls) {
    body.wakeUp();
    const f = 18 + Math.random() * 14;
    const dir = new CANNON.Vec3(
      (Math.random() * 2 - 1),
      (Math.random() * 0.5 + 0.5),
      (Math.random() * 2 - 1)
    ).unit();
    body.velocity.set(dir.x * f, dir.y * f, dir.z * f);
  }
});

// ═══════════════════════════════════════════
//  PORTFOLIO NAV
// ═══════════════════════════════════════════
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const section = document.getElementById('section-' + btn.dataset.section);
    if (section) section.classList.add('active');
    // Subtle auto-rotate peek when navigating
    controls.autoRotate = true;
    setTimeout(() => { controls.autoRotate = false; }, 1800);
  });
});

// ═══════════════════════════════════════════
//  INPUT – click / touch to throw
// ═══════════════════════════════════════════
let pointerDown = { x: 0, y: 0 };
let dragged = false;

canvas.addEventListener('pointerdown', e => {
  pointerDown = { x: e.clientX, y: e.clientY };
  dragged = false;
});

canvas.addEventListener('pointermove', e => {
  if (Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 6) {
    dragged = true;
  }
});

canvas.addEventListener('pointerup', e => {
  if (!dragged) throwBall(e.clientX, e.clientY);
});

// ═══════════════════════════════════════════
//  RESIZE
// ═══════════════════════════════════════════
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.resolution.set(w, h);
}
window.addEventListener('resize', onResize);
onResize();

// ═══════════════════════════════════════════
//  INTRO ANIMATION  (camera dolly-in)
// ═══════════════════════════════════════════
let introT = 0;
const INTRO_DUR = 2200; // ms
const introStartZ = 22;
camera.position.z = introStartZ;
controls.enabled = false;

// ═══════════════════════════════════════════
//  ANIMATE
// ═══════════════════════════════════════════
let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now   = performance.now();
  const delta = Math.min((now - prevTime) / 1000, 0.05);
  prevTime    = now;

  // ── Intro dolly-in ──
  if (introT < 1) {
    introT += delta / (INTRO_DUR / 1000);
    const t = 1 - Math.pow(1 - Math.min(introT, 1), 3); // ease-out cubic
    camera.position.z = introStartZ + (13 - introStartZ) * t;
    if (introT >= 1) controls.enabled = true;
  }

  // ── Physics ──
  world.step(1 / 60, delta, 3);

  // ── Sync ball meshes ──
  for (const { mesh, body } of balls) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }

  // ── Target collisions ──
  checkCollisions();

  // ── Target float + spin ──
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    t.mesh.rotation.y += 0.025;
    t.mesh.rotation.x += 0.015;
    t.mesh.position.y  = t.baseY + Math.sin(now * 0.001 + i * 2.1) * 0.25;
  }

  // ── Bunny spin + bob ──
  if (bunnyMesh) {
    bunnyMesh.rotation.y += 0.012;
    bunnyMesh.rotation.x += 0.005;
    bunnyMesh.position.y  = 2.6 + Math.sin(now * 0.0008) * 0.18;
  }

  // ── Ceiling light flicker (subtle) ──
  if (ceilingLight) {
    ceilingLight.intensity = 9 + Math.sin(now * 0.003) * 0.3;
  }

  controls.update();
  composer.render();
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
buildCornellBox();
buildBoxObjects();
buildLighting();
buildBunny();
buildTargets();
animate();

// Hide loading screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
    // Animate skill bars in when skills section is opened
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.section === 'skills') {
          setTimeout(() => {
            document.querySelectorAll('.skill-fill').forEach(el => {
              el.style.width = el.style.width; // re-trigger CSS transition
            });
          }, 50);
        }
      });
    });
  }, 600);
});

import Matter from 'matter-js';

const {
  Engine, Bodies, Body, Composite,
  Runner, Mouse, MouseConstraint,
  Events, Query,
} = Matter;

// ── DOM references ────────────────────────────────────────────────────
const blocksLayer = document.getElementById('blocks-layer');
const canvas      = document.getElementById('physics-canvas');

// ── Viewport dimensions ───────────────────────────────────────────────
let W = window.innerWidth;
let H = window.innerHeight;
canvas.width  = W;
canvas.height = H;

// ── Physics engine ────────────────────────────────────────────────────
const engine = Engine.create({ gravity: { x: 0, y: 1.6 } });
const runner  = Runner.create();

// ── Static boundary walls ─────────────────────────────────────────────
const T = 600;  // wall thickness — prevents fast blocks tunnelling through
const floor = Bodies.rectangle(W / 2, H + T / 2,    W * 4, T,      { isStatic: true });
const wallL = Bodies.rectangle(-T / 2,    H / 2, T, H * 12, { isStatic: true });
const wallR = Bodies.rectangle(W + T / 2, H / 2, T, H * 12, { isStatic: true });
Composite.add(engine.world, [floor, wallL, wallR]);

// ── Mouse / touch constraint ──────────────────────────────────────────
const mouse           = Mouse.create(canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: { stiffness: 0.18, damping: 0.12, render: { visible: false } },
});
Composite.add(engine.world, mouseConstraint);

// ── SVG icon helpers ──────────────────────────────────────────────────
function icon(pathData, filled = true) {
  const f = filled ? 'currentColor' : 'none';
  const s = filled ? 'none'         : 'currentColor';
  return `<svg viewBox="0 0 24 24" fill="${f}" stroke="${s}" `
       + `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`
       + pathData + `</svg>`;
}

const ICONS = {
  star:     icon('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'),
  flame:    icon('<path d="M12 3S7 9 7 14a5 5 0 0010 0c0-5-5-11-5-11zm0 14a2 2 0 01-2-2c0-1.8 2-4.5 2-4.5s2 2.7 2 4.5a2 2 0 01-2 2z"/>'),
  sparkle:  icon('<path d="M12 2l1.8 5.4L19.5 9l-5.7 1.8L12 16.5l-1.8-5.7L4.5 9l5.7-1.6z"/>'
               + '<path d="M20.5 2l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" opacity=".55"/>'
               + '<path d="M3.5 16l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z" opacity=".55"/>'),
  heartOut: icon('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>', false),
  starOut:  icon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', false),
  bolt:     icon('<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>'),
  gem:      icon('<polygon points="8 3 16 3 21 9 12 22 3 9"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="12" y1="3" x2="12" y2="22"/>', false),
};

// ── Block definitions ─────────────────────────────────────────────────
const BLOCKS = [
  { color: '#7c3aed', icon: ICONS.star     },   // violet  + star
  { color: '#ea580c', icon: ICONS.flame    },   // orange  + flame
  { color: '#d97706', icon: ICONS.sparkle  },   // amber   + sparkle
  { color: '#0891b2', icon: ICONS.heartOut },   // cyan    + heart
  { color: '#1e293b', icon: ICONS.starOut  },   // slate   + star outline
  { color: '#15803d', icon: ICONS.bolt     },   // green   + bolt
  { color: '#be185d', icon: ICONS.gem      },   // pink    + gem
];

const BW = 108, BH = 108;   // block width / height (px)

// ── Spawn blocks ──────────────────────────────────────────────────────
// Stagger them vertically so they don't all collide mid-air
const blocks = BLOCKS.map((def, i) => {
  // Random horizontal position, staggered start heights above viewport
  const x = BW / 2 + 20 + Math.random() * Math.max(W - BW - 40, 1);
  const y = -(BH / 2 + 60 + i * 180);

  const body = Bodies.rectangle(x, y, BW, BH, {
    restitution: 0.30,
    friction:    0.06,
    frictionAir: 0.016,
    density:     0.0018,
    chamfer:     { radius: 18 },   // rounded physics corners
  });
  // Give a gentle random spin on spawn
  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.22);
  Composite.add(engine.world, body);

  // Matching DOM element (visual only)
  const el = document.createElement('div');
  el.className = 'nf-block';
  el.style.cssText = `width:${BW}px;height:${BH}px;background:${def.color};`;
  el.innerHTML = def.icon;
  blocksLayer.appendChild(el);

  return { body, el };
});

// ── Sync DOM positions to physics each tick ───────────────────────────
function syncBlocks() {
  for (const { body, el } of blocks) {
    const { x, y } = body.position;
    const a        = body.angle;
    el.style.transform =
      `translate(${(x - BW / 2).toFixed(2)}px,${(y - BH / 2).toFixed(2)}px) rotate(${a.toFixed(4)}rad)`;
  }
}

// ── Respawn blocks that escape below the viewport ─────────────────────
function respawnOOB() {
  for (const { body } of blocks) {
    if (body.position.y > H + T + BH) {
      const nx = BW / 2 + 20 + Math.random() * Math.max(W - BW - 40, 1);
      Body.setPosition(body, { x: nx, y: -(BH / 2 + 60) });
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.22);
    }
  }
}

// ── Cursor feedback ───────────────────────────────────────────────────
const allBodies = blocks.map(b => b.body);

Events.on(mouseConstraint, 'mousemove', () => {
  const hits = Query.point(allBodies, mouse.position);
  canvas.style.cursor = hits.length ? 'grab' : 'default';
});
Events.on(mouseConstraint, 'startdrag', () => { canvas.style.cursor = 'grabbing'; });
Events.on(mouseConstraint, 'enddrag',   () => { canvas.style.cursor = 'default';  });

// ── Responsive resize ─────────────────────────────────────────────────
window.addEventListener('resize', () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  // Move walls to new edges
  Body.setPosition(floor, { x: W / 2, y: H + T / 2    });
  Body.setPosition(wallL, { x: -T / 2,    y: H / 2 });
  Body.setPosition(wallR, { x: W + T / 2, y: H / 2 });
}, { passive: true });

// ── Run ───────────────────────────────────────────────────────────────
Runner.run(runner, engine);
Events.on(engine, 'afterUpdate', () => { syncBlocks(); respawnOOB(); });

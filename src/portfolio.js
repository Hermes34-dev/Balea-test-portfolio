/* portfolio.js – Alejandro Balea Moreno */
import { PROJECTS } from './projects-data.js';

(function () {

  // ── Nav + scroll ────────────────────────────────────────────────────
  var nav      = document.getElementById('nav');
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelector('.nav-links');
  var hamburger = document.querySelector('.nav-hamburger');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    var current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    document.querySelectorAll('.nav-links a[data-section]').forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }, { passive: true });

  // ── Intersection Observer ───────────────────────────────────────────
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // ── Mobile hamburger ────────────────────────────────────────────────
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });
  }

  // ── Populate card images from project data ───────────────────────────
  document.querySelectorAll('.project-card[data-project]').forEach(function (card) {
    var id = card.dataset.project;
    var p  = PROJECTS[id];
    if (!p) return;
    var imgDiv = card.querySelector('.project-img');
    if (!imgDiv) return;

    if (p.image) {
      var img = document.createElement('img');
      img.src     = p.image;
      img.alt     = p.title;
      img.loading = 'lazy';
      imgDiv.appendChild(img);
    } else {
      imgDiv.style.background = p.gradient;
      imgDiv.classList.add('project-img-gradient');
    }
  });

  // ── HTML builder helpers ─────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildDetailHTML(p) {
    // Hero image / gradient (bleeds full-width via negative margins in CSS)
    var imgSection;
    if (p.image) {
      imgSection = '<div class="pp-img-section">' +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" />' +
        '</div>';
    } else {
      imgSection = '<div class="pp-img-section pp-img-gradient" style="background:' +
        esc(p.gradient) + '"></div>';
    }

    var companyHTML = p.company
      ? '<p class="pp-role">' + esc(p.role) +
        ' &nbsp;&middot;&nbsp; <span>' + esc(p.company) + '</span></p>'
      : '';

    var highlightsHTML = p.highlights.map(function (h) {
      return '<li>' + esc(h) + '</li>';
    }).join('');

    var chipsHTML = p.chips.map(function (c) {
      return '<span>' + esc(c) + '</span>';
    }).join('');

    var linksHTML = '';
    if (p.links && p.links.length) {
      linksHTML = '<div class="pp-section"><div class="pp-links">' +
        p.links.map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener" class="pp-link">' +
            esc(l.label) + ' &#8599;</a>';
        }).join('') +
        '</div></div>';
    }

    return imgSection +
      '<div class="pp-hero-section">' +
        '<div class="pp-title-row">' +
          '<h2 class="pp-title">' + esc(p.title) + '</h2>' +
          '<span class="badge ' + esc(p.status) + '">' + esc(p.statusLabel) + '</span>' +
        '</div>' +
        '<p class="pp-category">' + esc(p.category) + '</p>' +
        companyHTML +
        '<p class="pp-period">' + esc(p.period) + '</p>' +
      '</div>' +
      '<div class="pp-section">' +
        '<p class="pp-desc">' + esc(p.description) + '</p>' +
      '</div>' +
      '<div class="pp-section">' +
        '<h3 class="pp-section-label">Highlights</h3>' +
        '<ul class="pp-highlights">' + highlightsHTML + '</ul>' +
      '</div>' +
      '<div class="pp-section">' +
        '<h3 class="pp-section-label">Tech Stack</h3>' +
        '<div class="chips">' + chipsHTML + '</div>' +
      '</div>' +
      linksHTML;
  }

  // ── Project detail panel ─────────────────────────────────────────────
  var ppPanel    = document.getElementById('project-panel');
  var ppBackdrop = document.getElementById('pp-backdrop');
  var ppBody     = document.getElementById('pp-body');
  var ppCloseBtn = document.getElementById('pp-close-btn');

  function openProjectPanel(id) {
    var data = PROJECTS[id];
    if (!data || !ppPanel) return;
    ppBody.innerHTML = buildDetailHTML(data);
    ppPanel.classList.add('open');
    ppPanel.setAttribute('aria-hidden', 'false');
    ppBackdrop.classList.add('active');
    ppPanel.scrollTop = 0;
    history.pushState(null, '', '#project/' + id);
  }

  function closeProjectPanel() {
    if (!ppPanel) return;
    ppPanel.classList.remove('open');
    ppPanel.setAttribute('aria-hidden', 'true');
    ppBackdrop.classList.remove('active');
    history.pushState(null, '', window.location.pathname + window.location.search);
  }

  if (ppCloseBtn)  ppCloseBtn.addEventListener('click', closeProjectPanel);
  if (ppBackdrop)  ppBackdrop.addEventListener('click', closeProjectPanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeProjectPanel();
  });

  // "View project →" buttons
  document.querySelectorAll('.project-view-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openProjectPanel(btn.dataset.project);
    });
  });

  // Clicking anywhere on the card also opens the panel
  document.querySelectorAll('.project-card[data-project]').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      openProjectPanel(card.dataset.project);
    });
  });

  // Handle deep-link hash on page load
  var initHash = window.location.hash;
  if (initHash && initHash.startsWith('#project/')) {
    openProjectPanel(initHash.slice(9));
  }

  window.addEventListener('popstate', function () {
    var h = window.location.hash;
    if (h && h.startsWith('#project/')) {
      openProjectPanel(h.slice(9));
    } else {
      closeProjectPanel();
    }
  });

  // ── Hero: boids flocking simulation ─────────────────────────────────
  (function () {
    var heroEl = document.getElementById('hero');
    var canvas = document.getElementById('hero-canvas');
    if (!heroEl || !canvas) return;

    var ctx = canvas.getContext('2d');
    var W = 1, H = 1;
    var boids = [];
    var N = 0;

    // ── Tuning ────────────────────────────────────────
    var SEP_R = 26,  ALI_R = 58,  COH_R = 82;   // radii
    var SEP_W = 1.7, ALI_W = 1.0, COH_W = 0.85; // rule weights
    var MAX_SPD = 2.1, MIN_SPD = 0.85, MAX_F = 0.055;

    function norm(vx, vy, len) {
      var l = Math.sqrt(vx * vx + vy * vy);
      return l < 0.001 ? [0, 0] : [vx / l * len, vy / l * len];
    }
    function clampF(dx, dy) {
      var l = Math.sqrt(dx * dx + dy * dy);
      return l > MAX_F ? [dx / l * MAX_F, dy / l * MAX_F] : [dx, dy];
    }

    function resize() {
      W = canvas.width  = heroEl.offsetWidth;
      H = canvas.height = heroEl.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      N = W < 600 ? 65 : 120;
      boids = [];
      for (var i = 0; i < N; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = MIN_SPD + Math.random() * (MAX_SPD - MIN_SPD);
        boids.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: Math.cos(a) * s,  vy: Math.sin(a) * s,
          hue: 132 + Math.random() * 28
        });
      }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function frame() {
      // Fade canvas → glowing trails
      ctx.fillStyle = 'rgba(7,18,11,0.062)';
      ctx.fillRect(0, 0, W, H);

      for (var i = 0; i < N; i++) {
        var b = boids[i];

        var sx=0, sy=0, sn=0;
        var ax=0, ay=0, an=0;
        var cx=0, cy=0, cn=0;

        for (var j = 0; j < N; j++) {
          if (i === j) continue;
          var o = boids[j];
          var dx = o.x - b.x, dy = o.y - b.y;
          var d  = Math.sqrt(dx * dx + dy * dy);
          if (d < SEP_R)             { sx -= dx / d; sy -= dy / d; sn++; }
          if (d < ALI_R)             { ax += o.vx;   ay += o.vy;   an++; }
          if (d < COH_R)             { cx += o.x;    cy += o.y;    cn++; }
        }

        var fx = 0, fy = 0, sv, f;
        if (sn) { sv=norm(sx/sn,sy/sn,MAX_SPD); f=clampF(sv[0]-b.vx,sv[1]-b.vy); fx+=f[0]*SEP_W; fy+=f[1]*SEP_W; }
        if (an) { sv=norm(ax/an,ay/an,MAX_SPD); f=clampF(sv[0]-b.vx,sv[1]-b.vy); fx+=f[0]*ALI_W; fy+=f[1]*ALI_W; }
        if (cn) { sv=norm(cx/cn-b.x,cy/cn-b.y,MAX_SPD); f=clampF(sv[0]-b.vx,sv[1]-b.vy); fx+=f[0]*COH_W; fy+=f[1]*COH_W; }

        b.vx += fx; b.vy += fy;
        var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if      (sp > MAX_SPD && sp > 0) { b.vx = b.vx/sp*MAX_SPD; b.vy = b.vy/sp*MAX_SPD; }
        else if (sp < MIN_SPD && sp > 0) { b.vx = b.vx/sp*MIN_SPD; b.vy = b.vy/sp*MIN_SPD; }

        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x += W; else if (b.x > W) b.x -= W;
        if (b.y < 0) b.y += H; else if (b.y > H) b.y -= H;

        // Draw as a small arrow-triangle pointing in direction of travel
        sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (sp < 0.001) continue;
        var nx = b.vx / sp, ny = b.vy / sp;
        var L = 6.5, S = 2.6;
        ctx.beginPath();
        ctx.moveTo(b.x + nx * L,           b.y + ny * L);
        ctx.lineTo(b.x - nx * S - ny * S,  b.y - ny * S + nx * S);
        ctx.lineTo(b.x - nx * S + ny * S,  b.y - ny * S - nx * S);
        ctx.closePath();
        ctx.fillStyle = 'hsla(' + b.hue + ',70%,62%,0.72)';
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }
    frame();
  }());

}());

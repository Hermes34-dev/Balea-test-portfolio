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

  // ── Hero: aurora ribbons + starfield ────────────────────────────────
  (function () {
    var heroEl = document.getElementById('hero');
    var canvas = document.getElementById('hero-canvas');
    if (!heroEl || !canvas) return;

    var ctx = canvas.getContext('2d');
    var W = 1, H = 1;
    var mX = -9999, mY = -9999;
    var t0 = performance.now();

    // Stars
    var NSTARS = 130;
    var stars = [];
    function initStars() {
      stars = [];
      for (var i = 0; i < NSTARS; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: Math.random() * 1.0 + 0.25,
          a: Math.random() * 0.55 + 0.15,
          ts: Math.random() * Math.PI * 2,
          tv: Math.random() * 1.8 + 0.4
        });
      }
    }

    function resize() {
      W = canvas.width  = heroEl.offsetWidth;
      H = canvas.height = heroEl.offsetHeight;
      initStars();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mX = e.clientX - r.left; mY = e.clientY - r.top;
    }, { passive: true });
    heroEl.addEventListener('mouseleave', function () { mX = -9999; }, { passive: true });
    heroEl.addEventListener('touchmove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mX = e.touches[0].clientX - r.left; mY = e.touches[0].clientY - r.top;
    }, { passive: true });
    heroEl.addEventListener('touchend', function () { mX = -9999; }, { passive: true });

    // Aurora band definitions — each a slow sinusoidal ribbon
    var BANDS = [
      { cy: 0.28, A: 0.07, f: 1.7, spd: 0.14, hue: 145, ht: 0.09 },
      { cy: 0.42, A: 0.10, f: 2.3, spd: 0.21, hue: 155, ht: 0.11 },
      { cy: 0.57, A: 0.08, f: 1.4, spd: 0.11, hue: 132, ht: 0.08 },
      { cy: 0.34, A: 0.12, f: 2.9, spd: 0.27, hue: 148, ht: 0.07 },
      { cy: 0.50, A: 0.06, f: 1.9, spd: 0.17, hue: 162, ht: 0.06 },
    ];

    function bandY(b, x, t) {
      var wave = Math.sin(x * b.f / W * Math.PI * 2 + t * b.spd)
               + 0.38 * Math.sin(x * b.f * 1.75 / W * Math.PI * 2 - t * b.spd * 0.65);
      var y = b.cy * H + wave * b.A * H;
      // Mouse warps the ribbon toward cursor
      if (mX > -100) {
        var dx = Math.abs(x - mX);
        if (dx < 280) {
          var pull = Math.pow(1 - dx / 280, 2) * 0.30;
          y += (mY - b.cy * H) * pull;
        }
      }
      return y;
    }

    function drawBand(b, t) {
      var STEPS = Math.ceil(W / 3);
      var ht = b.ht * H;
      var cy = b.cy * H;

      ctx.beginPath();
      for (var i = 0; i <= STEPS; i++) {
        var x = (i / STEPS) * W;
        var y = bandY(b, x, t) - ht;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      for (var i = STEPS; i >= 0; i--) {
        var x = (i / STEPS) * W;
        ctx.lineTo(x, bandY(b, x, t) + ht);
      }
      ctx.closePath();

      var g = ctx.createLinearGradient(0, cy - ht * 2.2, 0, cy + ht * 2.2);
      g.addColorStop(0,    'hsla(' + b.hue + ',68%,55%,0)');
      g.addColorStop(0.30, 'hsla(' + b.hue + ',68%,55%,0.055)');
      g.addColorStop(0.50, 'hsla(' + b.hue + ',72%,62%,0.10)');
      g.addColorStop(0.70, 'hsla(' + b.hue + ',68%,55%,0.055)');
      g.addColorStop(1,    'hsla(' + b.hue + ',68%,55%,0)');
      ctx.fillStyle = g;
      ctx.fill();

      // Bright core stroke
      ctx.beginPath();
      for (var i = 0; i <= STEPS; i++) {
        var x = (i / STEPS) * W;
        var y = bandY(b, x, t);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'hsla(' + b.hue + ',72%,70%,0.09)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function draw() {
      var now = performance.now();
      var t = (now - t0) * 0.001;

      ctx.clearRect(0, 0, W, H);

      // Stars beneath the aurora
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = 0.45 + 0.55 * Math.sin(t * s.tv + s.ts);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(190,255,210,' + (s.a * tw).toFixed(3) + ')';
        ctx.fill();
      }

      // Aurora ribbons
      for (var i = 0; i < BANDS.length; i++) {
        drawBand(BANDS[i], t);
      }

      // Soft mouse glow on top
      if (mX > -100) {
        var mg = ctx.createRadialGradient(mX, mY, 0, mX, mY, 200);
        mg.addColorStop(0,   'rgba(34,197,94,0.08)');
        mg.addColorStop(0.5, 'rgba(34,197,94,0.03)');
        mg.addColorStop(1,   'rgba(34,197,94,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, W, H);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }());

}());

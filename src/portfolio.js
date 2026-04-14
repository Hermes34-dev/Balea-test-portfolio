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

  // ── Interactive hero canvas grid ────────────────────────────────────
  (function () {
    var heroEl = document.getElementById('hero');
    var canvas = document.getElementById('hero-canvas');
    if (!heroEl || !canvas) return;

    var ctx  = canvas.getContext('2d');
    var mX   = -9999;
    var mY   = -9999;
    var CELL    = 52;   // grid spacing px
    var GLOW_R  = 170;  // mouse influence radius px
    var DOT_MIN = 1.4;  // base dot radius
    var DOT_MAX = 5.2;  // dot radius at cursor

    function resize() {
      canvas.width  = heroEl.offsetWidth;
      canvas.height = heroEl.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mX = e.clientX - r.left;
      mY = e.clientY - r.top;
    }, { passive: true });
    heroEl.addEventListener('mouseleave', function () { mX = -9999; mY = -9999; }, { passive: true });
    heroEl.addEventListener('touchmove', function (e) {
      var r = heroEl.getBoundingClientRect();
      mX = e.touches[0].clientX - r.left;
      mY = e.touches[0].clientY - r.top;
    }, { passive: true });
    heroEl.addEventListener('touchend', function () { mX = -9999; mY = -9999; }, { passive: true });

    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Soft green glow halo around cursor
      if (mX > -100) {
        var grd = ctx.createRadialGradient(mX, mY, 0, mX, mY, GLOW_R * 1.3);
        grd.addColorStop(0,   'rgba(34,197,94,0.09)');
        grd.addColorStop(0.5, 'rgba(34,197,94,0.04)');
        grd.addColorStop(1,   'rgba(34,197,94,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }

      // Grid dots
      var cols = Math.ceil(w / CELL) + 1;
      var rows = Math.ceil(h / CELL) + 1;
      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          var px = c * CELL;
          var py = r * CELL;
          var dist = Math.hypot(px - mX, py - mY);
          var t = Math.max(0, 1 - dist / GLOW_R);
          var t2 = t * t; // quadratic ease
          var radius = DOT_MIN + (DOT_MAX - DOT_MIN) * t2;
          var alpha  = 0.14 + 0.78 * t2;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, 6.283);
          ctx.fillStyle = 'rgba(34,197,94,' + alpha.toFixed(3) + ')';
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }());

}());

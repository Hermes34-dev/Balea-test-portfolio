/* portfolio.js – Alejandro Balea Moreno */
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

  // ── Project data ────────────────────────────────────────────────────
  var PROJECTS = {
    raytracer: {
      title: 'Multithreaded CPU Raytracer',
      status: 'done', statusLabel: 'Done',
      category: 'Personal Project',
      period: '2021 – 2023',
      role: null, company: null,
      description: 'CPU-only offline path tracer implemented from scratch in C++. Simulates physically-based light transport with diffuse, metallic, and dielectric (glass) materials. Supports GLTF scene loading and BVH acceleration for fast intersection tests. Extended into a Volumetric Cloud Renderer. The Cornell Box rendered on my business card was produced with this engine.',
      highlights: [
        'Physically-based light transport: diffuse, metallic, dielectric materials',
        'Bounding Volume Hierarchy (BVH) acceleration structure',
        'GLTF scene and material loading',
        'Tile-based multithreaded rendering for faster output',
        'Extended with a Volumetric Cloud Renderer',
        'Cornell Box on my business card rendered with this engine',
      ],
      chips: ['C++', 'Path Tracing', 'BVH', 'GLTF', 'Multithreading'],
      links: [],
    },

    nonogram: {
      title: 'Daily Nonogram Web App',
      status: 'done', statusLabel: 'Done',
      category: 'Personal Project',
      period: '2023 – 2024',
      role: null, company: null,
      description: 'Self-hosted "Wordle"-like daily Nonogram puzzle game. Users receive a fresh puzzle each day, can track their solve streak, and compete on a shared daily challenge. Backend written in Rust (Actix-Web) serving a React frontend. User and puzzle data stored in PostgreSQL; static assets managed via MinIO (S3-compatible storage).',
      highlights: [
        'Daily puzzle rotation with deterministic seeding',
        'User accounts with daily streak tracking',
        'Rust + Actix-Web REST API backend',
        'React frontend with animated puzzle grid',
        'PostgreSQL for user and puzzle persistence',
        'MinIO (S3-compatible) for static asset storage',
      ],
      chips: ['Rust', 'Actix-Web', 'React', 'PostgreSQL', 'MinIO', 'REST API'],
      links: [],
    },

    enrouter: {
      title: 'Bus Worker Enrouter',
      status: 'done', statusLabel: 'Done · In Production',
      category: 'Personal Project',
      period: '2022 – 2023',
      role: null, company: null,
      description: 'Optimisation tool that solves a Vehicle Routing Problem with Time Windows (VRPTW) to find the most efficient routes for transporting bus operators from their homes to the depot before their shift starts. Currently deployed in production by Bilbobus, Bilbao\'s public bus operator.',
      highlights: [
        'Vehicle Routing Problem with Time Windows (VRPTW) solver',
        'Deployed in production by Bilbobus — Bilbao\'s public transit operator',
        'Minimises total travel distance while respecting time windows',
        'Real-world driver pickup route planning across the city',
      ],
      chips: ['VRPTW', 'Operations Research', 'Optimisation', 'C++'],
      links: [],
    },

    fair: {
      title: 'fAIr: Fight Fire with fAIr',
      status: 'active', statusLabel: 'Active',
      category: 'Professional',
      period: '01/2025 – 03/2026',
      role: 'Research Engineer',
      company: 'Gradiant',
      description: 'European-level SaaS platform for detecting AI-generated and AI-manipulated media content. Developed in partnership with INCIBE and international police authorities to combat digital fraud at scale. Responsible for the backend framework architecture, REST API design, C++ cryptographic integrity modules, neural network inference wrappers, and distributed worker jobs built on Docker + RabbitMQ.',
      highlights: [
        'European project in partnership with INCIBE & international law enforcement',
        'Multimodal AI content detection across images, video, audio, and text',
        'C++ cryptographic integrity verification module (OpenSSL)',
        'Neural network inference pipeline integration',
        'Docker + RabbitMQ distributed job architecture',
        'REST API backend design and implementation',
        'Presented multiple internal technical talks company-wide',
      ],
      chips: ['C++', 'Python', 'Docker', 'RabbitMQ', 'OpenSSL', 'REST API', 'Backend', 'DevOps'],
      links: [],
    },

    arruyo: {
      title: 'Arruyo',
      status: 'done', statusLabel: 'Done',
      category: 'Internship · Team Project',
      period: '09/2021 – 04/2022',
      role: 'Graphics / VFX Programmer',
      company: 'Tequila Works (Internship)',
      description: 'Senior 3D game built by an 11-person student team using a custom C++ engine during an internship at Tequila Works. Responsible for the visual effects system, core gameplay mechanics, and level lighting design. The game was published on Steam.',
      highlights: [
        '11-person multidisciplinary team collaboration',
        'Custom C++ game engine',
        'Particle-based VFX system design and implementation',
        'Level lighting design and placement',
        'Core gameplay mechanic implementation',
        'Published on Steam',
      ],
      chips: ['C++', 'VFX', 'OpenGL', 'Custom Engine'],
      links: [
        { label: 'View on Steam', url: 'https://store.steampowered.com/app/1849900/Arruyo/' },
      ],
    },

    arclight2: {
      title: 'Arclight 2',
      status: 'done', statusLabel: 'Done',
      category: 'Academic · Team Project',
      period: '09/2020 – 04/2021',
      role: 'Engine / Graphics Programmer',
      company: 'DigiPen Institute of Technology Europe',
      description: '3rd-year 3D game built by a 7-person team using a custom C++ engine at DigiPen. Designed and implemented the complete OpenGL 3D graphics pipeline from scratch, including the shader pipeline, shadow maps, post-processing visual effects, and the UI framework.',
      highlights: [
        '7-person team collaboration',
        'Full OpenGL 3D graphics pipeline designed from scratch',
        'Custom GLSL shader system',
        'Shadow mapping with PCF filtering',
        'Post-processing visual effects',
        'UI framework design and implementation',
        'Custom Entity-Component-System (ECS) architecture',
      ],
      chips: ['C++', 'OpenGL', 'ECS', 'GLSL', 'Shadow Mapping', 'Custom Engine'],
      links: [],
    },

    entails: {
      title: 'Entails',
      status: 'done', statusLabel: 'Done',
      category: 'Academic · Team Project',
      period: '09/2019 – 04/2020',
      role: 'Engine / Graphics Programmer',
      company: 'DigiPen Institute of Technology Europe',
      description: '2nd-year 2D game built by an 11-person team using a custom C++ engine at DigiPen. Built the entire 2D graphics pipeline from scratch, including sprite batching, animation, and dynamic 2D lighting. Created a fully integrated level-creation editor using ImGui embedded directly in the engine.',
      highlights: [
        '11-person team collaboration',
        'Complete 2D graphics pipeline built from scratch',
        'Sprite batching and frame animation system',
        'Dynamic 2D lighting',
        'ImGui level-creation editor integrated in-engine',
        'Custom C++ engine architecture',
      ],
      chips: ['C++', 'OpenGL', 'ImGui', '2D Graphics', 'Custom Engine'],
      links: [],
    },
  };

  // ── Project panel ────────────────────────────────────────────────────
  var ppPanel   = document.getElementById('project-panel');
  var ppBackdrop = document.getElementById('pp-backdrop');
  var ppBody    = document.getElementById('pp-body');
  var ppCloseBtn = document.getElementById('pp-close-btn');

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildProjectHTML(p) {
    var chipsHTML = p.chips.map(function (c) {
      return '<span>' + esc(c) + '</span>';
    }).join('');

    var highlightsHTML = p.highlights.map(function (h) {
      return '<li>' + esc(h) + '</li>';
    }).join('');

    var companyHTML = '';
    if (p.company) {
      companyHTML = '<p class="pp-role">' + esc(p.role) +
        ' &nbsp;&middot;&nbsp; <span>' + esc(p.company) + '</span></p>';
    }

    var linksHTML = '';
    if (p.links && p.links.length) {
      linksHTML = '<div class="pp-section"><div class="pp-links">' +
        p.links.map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener" class="pp-link">' +
            esc(l.label) + ' &#8599;</a>';
        }).join('') +
        '</div></div>';
    }

    return (
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
      linksHTML
    );
  }

  function openProjectPanel(id) {
    var data = PROJECTS[id];
    if (!data || !ppPanel) return;
    ppBody.innerHTML = buildProjectHTML(data);
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

  if (ppCloseBtn) ppCloseBtn.addEventListener('click', closeProjectPanel);
  if (ppBackdrop) ppBackdrop.addEventListener('click', closeProjectPanel);
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

  // Handle direct URL with hash (e.g. share link)
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

}());

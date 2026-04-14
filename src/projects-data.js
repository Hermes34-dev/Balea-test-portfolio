// ─── Shared project data ────────────────────────────────────────────────────
// Used by both portfolio.js (portfolio page) and main.js (3D scene).
//
// To add a real screenshot for any project, set its `image` field to the URL:
//   image: 'https://alejandrobalea.com/images/raytracer.jpg'
//
// The `gradient` field is used as a full-bleed hero background when no image
// is provided — each one is hand-crafted to the project's mood/domain.
// ────────────────────────────────────────────────────────────────────────────

export const PROJECTS = {

  raytracer: {
    title: 'Multithreaded CPU Raytracer',
    status: 'done', statusLabel: 'Done',
    category: 'Personal Project',
    period: '2021 – 2023',
    role: null, company: null,
    gradient: 'linear-gradient(135deg, #070e1f 0%, #102050 55%, #1a3a8a 100%)',
    image: null, // e.g. 'https://alejandrobalea.com/images/raytracer.jpg'
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
    gradient: 'linear-gradient(135deg, #0d0820 0%, #1e0e45 55%, #3a1a80 100%)',
    image: null,
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
    gradient: 'linear-gradient(135deg, #050e07 0%, #0e2818 55%, #1a5030 100%)',
    image: null,
    description: "Optimisation tool that solves a Vehicle Routing Problem with Time Windows (VRPTW) to find the most efficient routes for transporting bus operators from their homes to the depot before their shift starts. Currently deployed in production by Bilbobus, Bilbao's public bus operator.",
    highlights: [
      'Vehicle Routing Problem with Time Windows (VRPTW) solver',
      "Deployed in production by Bilbobus — Bilbao's public transit operator",
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
    gradient: 'linear-gradient(135deg, #120800 0%, #301500 55%, #602800 100%)',
    image: null,
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
    gradient: 'linear-gradient(135deg, #040808 0%, #0a1810 55%, #102818 100%)',
    image: null,
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
    gradient: 'linear-gradient(135deg, #05080f 0%, #0a1a30 55%, #0d3060 100%)',
    image: null,
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
    gradient: 'linear-gradient(135deg, #080510 0%, #180c30 55%, #280e50 100%)',
    image: null,
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

/**
 * Three.js Scene — Particle grid background for hero section
 * Particles react to mouse position. Accent-colored glow particles.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let scene, camera, renderer, particles, mouseX = 0, mouseY = 0;
  let animationId;
  const PARTICLE_COUNT = 1500;
  const ACCENT_COLOR = new THREE.Color(0xEB4330);
  const BASE_COLOR = new THREE.Color(0x312726);

  function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Grid-like distribution with slight randomness
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 80;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;

      // Most particles are dim, ~10% are accent colored
      if (Math.random() > 0.9) {
        colors[i3] = ACCENT_COLOR.r;
        colors[i3 + 1] = ACCENT_COLOR.g;
        colors[i3 + 2] = ACCENT_COLOR.b;
        sizes[i] = Math.random() * 2 + 1;
      } else {
        colors[i3] = BASE_COLOR.r;
        colors[i3 + 1] = BASE_COLOR.g;
        colors[i3 + 2] = BASE_COLOR.b;
        sizes[i] = Math.random() * 1.2 + 0.3;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (!particles || !renderer || !scene || !camera) return;

    // Subtle rotation following mouse
    particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.02;
    particles.rotation.y += (mouseX * 0.1 - particles.rotation.y) * 0.02;

    // Slow auto-rotation
    particles.rotation.z += 0.0003;

    // Float individual particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i * 0.1) * 0.005;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  // Initialize when Three.js is available
  function tryInit() {
    if (typeof THREE === 'undefined') {
      setTimeout(tryInit, 100);
      return;
    }
    init();
    animate();
  }

  // Start after loader completes
  window.addEventListener('loaderComplete', tryInit);
  // Fallback: start after 3s even if loader event missed
  setTimeout(tryInit, 3000);

  // Cleanup if navigating away
  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
  });
})();

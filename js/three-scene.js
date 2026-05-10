/**
 * Three.js Scene — Round ambient particles (no mouse trail)
 * Circular particles with glow. Gentle drift.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let scene, camera, renderer;
  let particles;
  let mouseNDCX = 0, mouseNDCY = 0;
  let animationId;

  const PARTICLE_COUNT = 1000;
  const ACCENT = { r: 0, g: 0.898, b: 1.0 };
  const DIM = { r: 0.1, g: 0.1, b: 0.18 };

  // Create circular glow texture via canvas
  function createCircleTexture(size, color) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const half = size / 2;

    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.6, color.replace('1)', '0.3)'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function init() {
    if (typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const accentTex = createCircleTexture(64, 'rgba(0, 229, 255, 1)');

    // ── Background particles ──
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 120;
      positions[i3 + 1] = (Math.random() - 0.5) * 90;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      velocities[i3] = (Math.random() - 0.5) * 0.015;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.012;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.008;

      if (Math.random() > 0.85) {
        colors[i3] = ACCENT.r;
        colors[i3 + 1] = ACCENT.g;
        colors[i3 + 2] = ACCENT.b;
      } else {
        colors[i3] = DIM.r;
        colors[i3 + 1] = DIM.g;
        colors[i3 + 2] = DIM.b;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.0,
      map: accentTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geo, mat);
    particles.userData.velocities = velocities;
    scene.add(particles);

    document.addEventListener('mousemove', (e) => {
      mouseNDCX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDCY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  let frameCount = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (!particles || !renderer) return;

    frameCount++;

    // Gentle rotation following mouse
    particles.rotation.x += (mouseNDCY * 0.03 - particles.rotation.x) * 0.01;
    particles.rotation.y += (mouseNDCX * 0.03 - particles.rotation.y) * 0.01;
    particles.rotation.z += 0.0001;

    // Drift particles
    const pos = particles.geometry.attributes.position.array;
    const vel = particles.userData.velocities;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];

      if (pos[i3] > 60) pos[i3] = -60;
      if (pos[i3] < -60) pos[i3] = 60;
      if (pos[i3 + 1] > 45) pos[i3 + 1] = -45;
      if (pos[i3 + 1] < -45) pos[i3 + 1] = 45;

      pos[i3 + 1] += Math.sin(frameCount * 0.003 + i * 0.05) * 0.002;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function tryInit() {
    if (typeof THREE === 'undefined') {
      setTimeout(tryInit, 100);
      return;
    }
    init();
    animate();
  }

  window.addEventListener('loaderComplete', tryInit);
  setTimeout(tryInit, 3000);

  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
  });
})();

/**
 * Three.js Scene — Round particles + Mouse Trail
 * Circular particles with glow. Mouse leaves a cyan trail.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let scene, camera, renderer;
  let particles, trailParticles;
  let mouseX = 0, mouseY = 0;
  let prevMouseX = 0, prevMouseY = 0;
  let animationId;

  const PARTICLE_COUNT = 1200;
  const TRAIL_COUNT = 80;
  const ACCENT = { r: 0, g: 0.898, b: 1.0 };      // #00E5FF
  const DIM = { r: 0.1, g: 0.1, b: 0.18 };         // dim blue

  // ── Create circular glow texture via canvas ──
  function createCircleTexture(size, color, glowRadius) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const half = size / 2;

    // Outer glow
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

    // ── Textures ──
    const accentTex = createCircleTexture(64, 'rgba(0, 229, 255, 1)', 32);
    const dimTex = createCircleTexture(32, 'rgba(100, 130, 180, 1)', 16);

    // ══════════ BACKGROUND PARTICLES ══════════
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 120;
      positions[i3 + 1] = (Math.random() - 0.5) * 90;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      // Velocity for slow drift
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // ~15% bright cyan, rest are dim
      if (Math.random() > 0.85) {
        colors[i3] = ACCENT.r;
        colors[i3 + 1] = ACCENT.g;
        colors[i3 + 2] = ACCENT.b;
        sizes[i] = Math.random() * 3 + 1.5;
      } else {
        colors[i3] = DIM.r;
        colors[i3 + 1] = DIM.g;
        colors[i3 + 2] = DIM.b;
        sizes[i] = Math.random() * 1.5 + 0.4;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 1.2,
      map: accentTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geo, mat);
    particles.userData.velocities = velocities;
    scene.add(particles);

    // ══════════ MOUSE TRAIL PARTICLES ══════════
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(TRAIL_COUNT * 3);
    const trailColors = new Float32Array(TRAIL_COUNT * 3);
    const trailSizes = new Float32Array(TRAIL_COUNT);
    const trailAlphas = new Float32Array(TRAIL_COUNT);
    const trailLife = new Float32Array(TRAIL_COUNT);

    for (let i = 0; i < TRAIL_COUNT; i++) {
      trailPositions[i * 3] = 0;
      trailPositions[i * 3 + 1] = 0;
      trailPositions[i * 3 + 2] = 5;
      trailColors[i * 3] = ACCENT.r;
      trailColors[i * 3 + 1] = ACCENT.g;
      trailColors[i * 3 + 2] = ACCENT.b;
      trailSizes[i] = 0;
      trailLife[i] = 0;
    }

    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    trailGeo.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));

    const trailTex = createCircleTexture(64, 'rgba(0, 229, 255, 1)', 32);

    const trailMat = new THREE.PointsMaterial({
      size: 2.5,
      map: trailTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    trailParticles = new THREE.Points(trailGeo, trailMat);
    trailParticles.userData.life = trailLife;
    trailParticles.userData.nextIndex = 0;
    scene.add(trailParticles);

    // Mouse tracking
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
  }

  let mouseNDCX = 0, mouseNDCY = 0;

  function onMouseMove(e) {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseNDCX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDCY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Convert screen coords to Three.js world coords
  function screenToWorld(sx, sy) {
    const vec = new THREE.Vector3(
      (sx / window.innerWidth) * 2 - 1,
      -(sy / window.innerHeight) * 2 + 1,
      0.5
    );
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = (5 - camera.position.z) / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(dist));
    return pos;
  }

  let frameCount = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    if (!particles || !renderer || !scene || !camera) return;

    frameCount++;

    // ── Rotate background particles with mouse ──
    particles.rotation.x += (mouseNDCY * 0.05 - particles.rotation.x) * 0.015;
    particles.rotation.y += (mouseNDCX * 0.05 - particles.rotation.y) * 0.015;
    particles.rotation.z += 0.0002;

    // ── Drift background particles ──
    const pos = particles.geometry.attributes.position.array;
    const vel = particles.userData.velocities;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];

      // Wrap around
      if (pos[i3] > 60) pos[i3] = -60;
      if (pos[i3] < -60) pos[i3] = 60;
      if (pos[i3 + 1] > 45) pos[i3 + 1] = -45;
      if (pos[i3 + 1] < -45) pos[i3 + 1] = 45;

      // Subtle sine wave
      pos[i3 + 1] += Math.sin(frameCount * 0.005 + i * 0.05) * 0.003;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // ── Emit trail particles on mouse move ──
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    if (speed > 2 && trailParticles) {
      const trailPos = trailParticles.geometry.attributes.position.array;
      const trailSizes = trailParticles.geometry.attributes.size.array;
      const trailLife = trailParticles.userData.life;
      const idx = trailParticles.userData.nextIndex;

      // Emit 1-3 particles per frame based on speed
      const emitCount = Math.min(3, Math.ceil(speed / 10));
      for (let e = 0; e < emitCount; e++) {
        const ci = ((idx + e) % TRAIL_COUNT);
        const worldPos = screenToWorld(
          mouseX + (Math.random() - 0.5) * speed * 0.5,
          mouseY + (Math.random() - 0.5) * speed * 0.5
        );
        trailPos[ci * 3] = worldPos.x;
        trailPos[ci * 3 + 1] = worldPos.y;
        trailPos[ci * 3 + 2] = worldPos.z;
        trailSizes[ci] = Math.min(speed * 0.08, 4) + Math.random() * 1.5;
        trailLife[ci] = 1.0;
      }
      trailParticles.userData.nextIndex = (idx + emitCount) % TRAIL_COUNT;

      trailParticles.geometry.attributes.position.needsUpdate = true;
      trailParticles.geometry.attributes.size.needsUpdate = true;
    }

    // ── Fade trail particles ──
    if (trailParticles) {
      const trailSizes = trailParticles.geometry.attributes.size.array;
      const trailColors = trailParticles.geometry.attributes.color.array;
      const trailLife = trailParticles.userData.life;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        if (trailLife[i] > 0) {
          trailLife[i] -= 0.02; // Fade speed
          if (trailLife[i] < 0) trailLife[i] = 0;

          // Shrink as they fade
          trailSizes[i] *= 0.97;

          // Color fades from bright cyan to dim
          const t = trailLife[i];
          trailColors[i * 3] = ACCENT.r * t;
          trailColors[i * 3 + 1] = ACCENT.g * t;
          trailColors[i * 3 + 2] = ACCENT.b * t;
        } else {
          trailSizes[i] = 0;
        }
      }

      trailParticles.geometry.attributes.size.needsUpdate = true;
      trailParticles.geometry.attributes.color.needsUpdate = true;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;

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

  window.addEventListener('loaderComplete', tryInit);
  setTimeout(tryInit, 3000);

  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) renderer.dispose();
  });
})();

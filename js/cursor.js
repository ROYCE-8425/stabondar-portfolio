/**
 * Custom Cursor — Red dot (#EB4330) with hover scaling
 * Hidden on touch devices. Smooth lerp movement.
 */
(function () {
  'use strict';

  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Hide on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    document.body.classList.remove('has-custom-cursor');
    return;
  }

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const lerp = 0.15;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));

  // Hover detection for interactive elements
  function setupHoverTargets() {
    const targets = document.querySelectorAll(
      'a, button, [data-cursor-hover], input, textarea, .project-card, .cases-grid__item'
    );
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  // Run after DOM + transitions
  setupHoverTargets();
  // Re-run if new content loaded
  window.addEventListener('contentLoaded', setupHoverTargets);

  function animate() {
    cursorX += (mouseX - cursorX) * lerp;
    cursorY += (mouseY - cursorY) * lerp;
    cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`;
    requestAnimationFrame(animate);
  }

  animate();
})();

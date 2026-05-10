/**
 * Custom Cursor — Sleek ring style
 * Hidden on touch/mobile. Only appears when mouse moves.
 * Auto-hides after inactivity.
 */
(function () {
  'use strict';

  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Hide on touch devices completely
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    document.body.classList.remove('has-custom-cursor');
    return;
  }

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  const lerp = 0.12;
  let hideTimer = null;
  let isVisible = false;

  function showCursor() {
    if (!isVisible) {
      cursor.classList.add('is-visible');
      isVisible = true;
    }
    // Auto-hide after 3s of no movement
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      cursor.classList.remove('is-visible');
      isVisible = false;
    }, 3000);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    showCursor();
  });

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-visible');
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    showCursor();
  });

  // Hover detection for interactive elements
  function setupHoverTargets() {
    const targets = document.querySelectorAll(
      'a, button, [data-cursor-hover], input, textarea, .project-card, .cases-grid__item, .skill-card'
    );
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  setupHoverTargets();
  window.addEventListener('contentLoaded', setupHoverTargets);

  function animate() {
    cursorX += (mouseX - cursorX) * lerp;
    cursorY += (mouseY - cursorY) * lerp;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }

  animate();
})();

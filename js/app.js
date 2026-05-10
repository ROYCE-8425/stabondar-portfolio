/**
 * App.js — Entry point
 * Initializes Lenis smooth scrolling and coordinates all modules.
 */
(function () {
  'use strict';

  function initApp() {
    // ── Initialize Lenis smooth scroll ──
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
      });

      // Connect Lenis to GSAP ScrollTrigger
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
      } else {
        // Fallback: manual raf loop
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    // ── Generate placeholder project images ──
    generateProjectPlaceholders();

    console.log('✦ Portfolio initialized');
  }

  /**
   * Generate colorful SVG placeholder images for projects
   * (Replaces empty src attributes with dynamic SVG data URIs)
   */
  function generateProjectPlaceholders() {
    const projects = [
      { id: 'project-img-1', label: 'E-Commerce', colors: ['#EB4330', '#1a1a1a'] },
      { id: 'project-img-2', label: '3D Viewer', colors: ['#312726', '#EB4330'] },
      { id: 'project-img-3', label: 'Agency', colors: ['#111111', '#EB4330'] },
      { id: 'project-img-4', label: 'Dashboard', colors: ['#EB4330', '#322D2C'] },
      { id: 'project-img-5', label: 'Mobile App', colors: ['#1a1a1a', '#EB4330'] },
      { id: 'project-img-6', label: 'Brand', colors: ['#312726', '#EB4330'] }
    ];

    projects.forEach((proj, index) => {
      const img = document.getElementById(proj.id);
      if (!img || img.src) return;

      // Create dynamic SVG placeholder
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
          <defs>
            <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${proj.colors[0]};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${proj.colors[1]};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="600" height="450" fill="url(#grad${index})"/>
          <!-- Grid dots -->
          ${generateGridDots()}
          <!-- Project number -->
          <text x="50" y="400" font-family="monospace" font-size="80" fill="rgba(255,255,255,0.08)" font-weight="300">
            #0${index + 1}
          </text>
          <!-- Label -->
          <text x="300" y="230" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.4)" text-anchor="middle" font-weight="400">
            ${proj.label}
          </text>
          <!-- Geometric shape -->
          <circle cx="300" cy="200" r="60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <rect x="260" y="160" width="80" height="80" fill="none" stroke="rgba(235,67,48,0.15)" stroke-width="1" transform="rotate(45 300 200)"/>
        </svg>
      `;

      img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    });
  }

  function generateGridDots() {
    let dots = '';
    for (let x = 0; x < 600; x += 30) {
      for (let y = 0; y < 450; y += 30) {
        dots += `<circle cx="${x}" cy="${y}" r="0.5" fill="rgba(255,255,255,0.1)"/>`;
      }
    }
    return dots;
  }

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure GSAP/Lenis loaded
      setTimeout(initApp, 100);
    });
  } else {
    setTimeout(initApp, 100);
  }
})();

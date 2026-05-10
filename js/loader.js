/**
 * Loader — Glitch text effect + progress counter
 * Uses GSAP timeline for sequencing.
 */
(function () {
  'use strict';

  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loader-text');
  const loaderCounter = document.getElementById('loader-counter');
  const loaderBar = document.getElementById('loader-bar');
  if (!loader) return;

  // Glitch text variants
  const glitchWords = [
    'Developer', 'DeveloPer', 'DEVELOPER', 'D3V3L0P3R',
    'Develope_', '_ _ _ _ _', 'CREATIVE', 'Cr3at1ve',
    'Developer'
  ];

  let glitchIndex = 0;
  const glitchInterval = setInterval(() => {
    glitchIndex = (glitchIndex + 1) % glitchWords.length;
    loaderText.textContent = glitchWords[glitchIndex];
  }, 200);

  // Wait for GSAP
  function initLoader() {
    if (typeof gsap === 'undefined') {
      setTimeout(initLoader, 50);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        clearInterval(glitchInterval);
        loaderText.textContent = 'Developer';

        // Fade out loader
        gsap.to(loader, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            document.body.classList.remove('is-loading');

            // Trigger hero animations
            window.dispatchEvent(new Event('loaderComplete'));
          }
        });
      }
    });

    // Animate counter 0% → 100%
    const counter = { value: 0 };
    tl.to(counter, {
      value: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(counter.value);
        loaderCounter.textContent = val + '%';
        loaderBar.style.width = val + '%';
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }
})();

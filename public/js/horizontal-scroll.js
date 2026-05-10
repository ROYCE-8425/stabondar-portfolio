/**
 * Horizontal Scroll — GSAP ScrollTrigger pin
 * Vertical scroll → horizontal movement for project cards
 */
(function () {
  'use strict';

  function initHorizontalScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initHorizontalScroll, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer = document.getElementById('horizontal-scroll');
    const projectsSection = document.getElementById('projects');
    if (!scrollContainer || !projectsSection) return;

    // Calculate total scroll width
    const cards = scrollContainer.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    function setupScroll() {
      // Kill previous ScrollTrigger if exists
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars && st.vars.trigger === projectsSection) st.kill();
      });

      const totalWidth = scrollContainer.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = totalWidth - viewportWidth + 100;

      if (scrollDistance <= 0) return;

      gsap.to(scrollContainer, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: projectsSection,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Parallax effect on card numbers
      cards.forEach((card, i) => {
        const num = card.querySelector('.project-card__num');
        if (num) {
          gsap.to(num, {
            x: -50 * (i + 1) * 0.3,
            ease: 'none',
            scrollTrigger: {
              trigger: projectsSection,
              start: 'top top',
              end: () => `+=${scrollDistance}`,
              scrub: 1
            }
          });
        }
      });
    }

    // Setup on loader complete or with delay
    window.addEventListener('loaderComplete', () => {
      setTimeout(setupScroll, 200);
    });

    // Fallback
    setTimeout(setupScroll, 3500);

    // Recalculate on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    });
  }

  window.addEventListener('cmsDataLoaded', initHorizontalScroll);
})();

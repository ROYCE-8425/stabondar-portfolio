/**
 * Navigation — Menu overlay toggle with GSAP stagger
 */
(function () {
  'use strict';

  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const menuOverlay = document.getElementById('menu-overlay');
  if (!menuToggle || !menuOverlay) return;

  const menuLinks = menuOverlay.querySelectorAll('.menu-overlay__link');
  let isOpen = false;

  function openMenu() {
    if (typeof gsap === 'undefined') return;
    isOpen = true;
    menuOverlay.classList.add('is-open');
    menuToggle.textContent = 'Close';

    // Animate links in
    gsap.fromTo(menuLinks, 
      { y: '110%', opacity: 0 },
      { 
        y: '0%', 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: 'expo.out',
        delay: 0.3
      }
    );
  }

  function closeMenu() {
    if (typeof gsap === 'undefined') return;
    isOpen = false;
    menuToggle.textContent = 'Menu';

    gsap.to(menuLinks, {
      y: '-80%',
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.in',
      onComplete: () => {
        menuOverlay.classList.remove('is-open');
      }
    });
  }

  menuToggle.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close when clicking a link
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(closeMenu, 100);
    });
  });
})();

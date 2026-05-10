/**
 * Scroll Animations — GSAP ScrollTrigger
 * Reveal on scroll, counter animation, text reveals
 */
(function () {
  'use strict';

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(initScrollAnimations, 100);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Hero entrance after loader ──
    window.addEventListener('loaderComplete', () => {
      const heroContent = document.querySelector('.hero__content');
      if (!heroContent) return;

      // Animate hero line masks
      gsap.to('.line-mask__inner', {
        y: '0%',
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.15,
        delay: 0.2
      });

      // Fade in reveal elements in hero
      gsap.to('.hero .reveal', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1,
        delay: 0.6
      });

      // Hero outline text parallax
      gsap.to('.hero__outline-text', {
        xPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    // ── General reveal elements ──
    const reveals = document.querySelectorAll('.reveal:not(.hero .reveal)');
    reveals.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── Stagger children ──
    const staggerGroups = document.querySelectorAll('.stagger-children');
    staggerGroups.forEach((group) => {
      const children = group.children;
      gsap.fromTo(children,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // ── Counter animation ──
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.counter, 10);
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counter,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          counter.textContent = Math.round(obj.val) + '+';
        }
      });
    });

    // ── About text highlight ──
    const aboutText = document.querySelector('.about__text');
    if (aboutText) {
      gsap.fromTo(aboutText,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: aboutText,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // ── Awards section items ──
    const awardItems = document.querySelectorAll('.awards__item');
    if (awardItems.length) {
      gsap.fromTo(awardItems,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.awards',
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // ── Nav background on scroll ──
    const nav = document.getElementById('nav');
    if (nav) {
      ScrollTrigger.create({
        start: 'top -100',
        onUpdate: (self) => {
          if (self.direction === 1 && self.scroll() > 100) {
            nav.style.background = 'rgba(0, 0, 0, 0.8)';
            nav.style.backdropFilter = 'blur(10px)';
          } else if (self.scroll() < 100) {
            nav.style.background = 'rgba(0, 0, 0, 0)';
            nav.style.backdropFilter = 'none';
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
})();

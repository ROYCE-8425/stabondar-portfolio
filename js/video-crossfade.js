/**
 * Dual-Video Crossfade — Seamless loop with zero jitter
 * Uses two <video> elements and requestAnimationFrame for
 * frame-perfect smooth opacity transitions.
 */
(function () {
  'use strict';

  const videoA = document.getElementById('hero-video-a');
  const videoB = document.getElementById('hero-video-b');
  if (!videoA || !videoB) return;

  const CROSSFADE_SECONDS = 2.5; // how long the crossfade takes
  let activeVideo = videoA;
  let standbyVideo = videoB;
  let isCrossfading = false;
  let crossfadeStart = 0;

  // Start playing video A
  function startPlayback() {
    activeVideo.currentTime = 0;
    activeVideo.style.opacity = '1';
    standbyVideo.style.opacity = '0';
    activeVideo.play().catch(() => {});
  }

  // Wait for video to be ready
  videoA.addEventListener('loadeddata', function () {
    startPlayback();
    // Pre-buffer standby video
    standbyVideo.load();
  });

  // The main loop using requestAnimationFrame
  function tick() {
    requestAnimationFrame(tick);

    if (!activeVideo.duration || isNaN(activeVideo.duration)) return;

    const timeLeft = activeVideo.duration - activeVideo.currentTime;

    // ── Start crossfade when near the end ──
    if (timeLeft <= CROSSFADE_SECONDS && !isCrossfading) {
      isCrossfading = true;
      crossfadeStart = performance.now();

      // Start standby video from beginning
      standbyVideo.currentTime = 0;
      standbyVideo.play().catch(() => {});
    }

    // ── Animate crossfade ──
    if (isCrossfading) {
      const elapsed = (performance.now() - crossfadeStart) / 1000;
      const progress = Math.min(elapsed / CROSSFADE_SECONDS, 1);

      // Smooth easing (ease-in-out cubic)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      activeVideo.style.opacity = String(1 - eased);
      standbyVideo.style.opacity = String(eased);

      // Crossfade complete — swap roles
      if (progress >= 1) {
        isCrossfading = false;

        // Pause old active, it's now hidden
        activeVideo.pause();
        activeVideo.currentTime = 0;
        activeVideo.style.opacity = '0';

        // Swap
        const temp = activeVideo;
        activeVideo = standbyVideo;
        standbyVideo = temp;

        // Ensure active is fully visible
        activeVideo.style.opacity = '1';
      }
    }
  }

  requestAnimationFrame(tick);

  // Handle page visibility (pause/resume)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      activeVideo.pause();
      standbyVideo.pause();
    } else {
      activeVideo.play().catch(() => {});
    }
  });
})();

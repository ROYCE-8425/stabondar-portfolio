/**
 * Video Loop Crossfade — Smooth transition when video restarts
 * Fades video to black near the end, then fades back in after loop
 */
(function () {
  'use strict';

  const video = document.getElementById('hero-video');
  if (!video) return;

  const FADE_DURATION = 1.5; // seconds before end to start fade
  const FADE_IN_DURATION = 0.8; // seconds to fade back in

  // CSS transition for smooth opacity changes
  video.style.transition = 'opacity 0.8s ease-in-out';

  video.addEventListener('timeupdate', function () {
    if (!video.duration || isNaN(video.duration)) return;

    const timeLeft = video.duration - video.currentTime;

    if (timeLeft <= FADE_DURATION) {
      // Fade out progressively
      const progress = timeLeft / FADE_DURATION;
      video.style.opacity = Math.max(0, progress);
    } else if (video.currentTime < FADE_IN_DURATION) {
      // Fade in at the start
      const progress = video.currentTime / FADE_IN_DURATION;
      video.style.opacity = Math.min(1, progress);
    } else {
      video.style.opacity = 1;
    }
  });

  // Ensure smooth restart
  video.addEventListener('seeking', function () {
    if (video.currentTime < 0.1) {
      video.style.opacity = 0;
    }
  });
})();

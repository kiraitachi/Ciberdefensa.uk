/**
 * favicon-pulse.js
 *
 * Animates the browser tab favicon as a single orange dot with a
 * breathing glow — same accent color and pulse feel as the dot next
 * to "Adel de la Llave Ramadan.log" in the nav, just live in the tab.
 *
 * Static .ico files can't animate reliably across browsers, so this
 * redraws to an offscreen canvas on an interval and swaps the
 * <link rel="icon"> href for a fresh data URL each frame.
 *
 * Include on every page that should show the pulsing favicon:
 *   <script src="/favicon-pulse.js" defer></script>
 *
 * Respects prefers-reduced-motion (falls back to a static dot, no
 * pulse) and pauses while the tab is in the background.
 */
(function () {
  var COLOR = '#ff9d3d'; // site accent — same orange as the nav dot
  var SIZE = 32;
  var PERIOD_MS = 1800;   // time for one full pulse cycle
  var FRAME_MS = 90;      // redraw ~11x/sec — smooth without hammering the tab

  function getOrCreateFaviconLink() {
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    return link;
  }

  function drawPulse(ctx, hex, phase) {
    // phase: 0 -> 1 -> 0 smoothly, drives both glow size and opacity
    var ease = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2); // smooth 0..1..0

    ctx.clearRect(0, 0, SIZE, SIZE);
    var cx = SIZE / 2, cy = SIZE / 2;

    var glowRadius = SIZE * (0.36 + 0.16 * ease);
    var glowAlpha = 0.55 + 0.35 * ease;

    var glow = ctx.createRadialGradient(cx, cy, SIZE * 0.10, cx, cy, glowRadius);
    glow.addColorStop(0, hexToRgba(hex, glowAlpha));
    glow.addColorStop(1, hexToRgba(hex, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // solid core stays a steady size — only the glow breathes
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function init() {
    var link = getOrCreateFaviconLink();
    var canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    var ctx = canvas.getContext('2d');

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function renderAt(phase) {
      drawPulse(ctx, COLOR, phase);
      link.href = canvas.toDataURL('image/png');
    }

    if (reduceMotion) {
      renderAt(0.5); // static mid-glow, no motion
      return;
    }

    var startTime = Date.now();
    var timer = null;

    function tick() {
      var elapsed = (Date.now() - startTime) % PERIOD_MS;
      renderAt(elapsed / PERIOD_MS);
    }

    function start() {
      if (timer) return;
      timer = setInterval(tick, FRAME_MS);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    start();

    // Don't burn CPU animating a favicon nobody can see.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        startTime = Date.now(); // resync so it doesn't jump on resume
        start();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

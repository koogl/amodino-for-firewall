(function () {
  'use strict';

  // Safety: never leave the document in preload-hidden state
  document.documentElement.classList.remove('pixel-transition-preload');

  // Skip for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var TARGET_SHAPES = 18;
  var COVER_OVERLAP = 1.12; // >1 ensures no seams between circles
  var OUTER_RING_CELLS = 1; // render one ring outside the viewport
  var JITTER_X_RATIO = 0.22; // irregular horizontal offset as a % of cell width
  var JITTER_Y_RATIO = 0.18; // irregular vertical offset as a % of cell height

  // ── Build the overlay ──────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'pixel-transition';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  // Small deterministic hash for organic but bounded per-cell variation.
  function hash2D(x, y, seed) {
    var v = Math.sin((x + 1.37) * 12.9898 + (y + 7.91) * 78.233 + seed) * 43758.5453;
    return v - Math.floor(v);
  }

  function buildShapes() {
    var W = window.innerWidth;
    var H = window.innerHeight;
    var ratio = W / Math.max(H, 1);
    var baseCols = Math.max(1, Math.round(Math.sqrt(TARGET_SHAPES * ratio)));
    var baseRows = Math.max(1, Math.ceil(TARGET_SHAPES / baseCols));
    var cellW = W / baseCols;
    var cellH = H / baseRows;
    var jitterX = cellW * JITTER_X_RATIO;
    var jitterY = cellH * JITTER_Y_RATIO;
    // Grow diameter to account for max jitter so coverage remains seamless.
    var spanW = cellW + jitterX * 2;
    var spanH = cellH + jitterY * 2;
    var size = Math.sqrt(spanW * spanW + spanH * spanH) * COVER_OVERLAP;
    var seed = Date.now() * 0.001;

    overlay.innerHTML = '';

    var fragment = document.createDocumentFragment();

    for (var r = -OUTER_RING_CELLS; r < baseRows + OUTER_RING_CELLS; r++) {
      for (var c = -OUTER_RING_CELLS; c < baseCols + OUTER_RING_CELLS; c++) {
        var circle = document.createElement('div');
        var offsetX = (hash2D(c, r, seed) * 2 - 1) * jitterX;
        var offsetY = (hash2D(c + 31.7, r - 19.3, seed) * 2 - 1) * jitterY;
        circle.className = 'px';
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = c * cellW + cellW * 0.5 - size * 0.5 + offsetX + 'px';
        circle.style.top = r * cellH + cellH * 0.5 - size * 0.5 + offsetY + 'px';
        fragment.appendChild(circle);
      }
    }

    overlay.appendChild(fragment);
    return overlay.querySelectorAll('.px');
  }

  // ── Animations ─────────────────────────────────────────────────────────────
  function cover(onComplete) {
    var shapes = buildShapes();
    overlay.style.pointerEvents = 'auto';

    gsap.set(shapes, { opacity: 1, scale: 0, transformOrigin: '50% 50%' });
    gsap.to(shapes, {
      scale: 1,
      duration: 0.36,
      stagger: { amount: 0.45, from: 'random' },
      ease: 'power2.out',
      onComplete: onComplete,
    });
  }

  function uncover() {
    var shapes = buildShapes();
    overlay.style.pointerEvents = 'auto';

    gsap.set(shapes, { opacity: 1, scale: 1, transformOrigin: '50% 50%' });
    gsap.to(shapes, {
      scale: 0,
      opacity: 0,
      duration: 0.32,
      stagger: { amount: 0.42, from: 'random' },
      ease: 'power2.in',
      onComplete: function () {
        overlay.style.pointerEvents = 'none';
        overlay.innerHTML = '';
      },
    });
  }

  // ── Intercept link clicks ──────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-pixel-transition]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href) return;
    // Skip anchors, mailto, tel, and external links
    if (
      href.charAt(0) === '#' ||
      href.indexOf('mailto:') === 0 ||
      href.indexOf('tel:') === 0 ||
      (href.indexOf('://') !== -1 && href.indexOf(location.hostname) === -1)
    ) return;
    e.preventDefault();
    try {
      sessionStorage.setItem('pixelTransitionPending', '1');
    } catch (err) {}
    cover(function () {
      window.location.href = href;
    });
  });

  // ── Play uncover only when page was entered from an intercepted transition ─
  var shouldUncover = false;
  try {
    shouldUncover = sessionStorage.getItem('pixelTransitionPending') === '1';
    if (shouldUncover) {
      sessionStorage.removeItem('pixelTransitionPending');
    }
  } catch (err) {}

  if (shouldUncover) {
    requestAnimationFrame(function () {
      document.documentElement.classList.remove('pixel-transition-preload');
      uncover();
    });
  } else {
    overlay.style.pointerEvents = 'none';
  }
})();

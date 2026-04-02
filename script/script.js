const cards = document.querySelectorAll(".card-wrap");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

cards.forEach((cardWrap) => {
  const card = cardWrap.querySelector(".card");
  const cardBg = cardWrap.querySelector(".card-bg");

  if (!card || !cardBg || prefersReducedMotion) {
    return;
  }

  cardWrap.addEventListener("mousemove", (e) => {
    const rect = cardWrap.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 15;
    const rotateY = -((x - centerX) / centerX) * -15;

    // Parallax offset for the background image
    const offsetX = -((x - centerX) / centerX) * 20;
    const offsetY = -((y - centerY) / centerY) * 20;

    card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;

    // Apply parallax shift to background
    cardBg.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    // shine effect position
    card.style.setProperty("--x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--y", `${(y / rect.height) * 100}%`);
  });

  cardWrap.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
    cardBg.style.transform = "translate(0px, 0px)";
  });

});

/* NAV HOME HERO */
(function () {
  var root = document.querySelector(".nav-home-hero-asset");
  if (!root) return;

  var menuTrigger = root.querySelector("#menu-toggle");
  var closeTrigger = root.querySelector("#menu-close");
  var overlay = root.querySelector("#full-menu");
  var suppressedFocusEls = [];

  function getFocusableOutsideMenu() {
    var selector = [
      "a[href]",
      "area[href]",
      "button:not([disabled])",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "iframe",
      "[tabindex]",
      "[contenteditable='true']",
      "audio[controls]",
      "video[controls]",
      "summary"
    ].join(",");

    return Array.from(document.querySelectorAll(selector)).filter(function (el) {
      if (!el || !el.isConnected) return false;
      if (root.contains(el)) return false;
      if (el.tabIndex < 0) return false;
      return true;
    });
  }

  function suppressBackgroundFocus() {
    Array.from(document.body.children).forEach(function (child) {
      if (child !== root) child.inert = true;
    });

    suppressedFocusEls = getFocusableOutsideMenu();
    suppressedFocusEls.forEach(function (el) {
      el.setAttribute("data-menu-prev-tabindex", el.getAttribute("tabindex") || "");
      el.setAttribute("tabindex", "-1");
    });
  }

  function restoreBackgroundFocus() {
    Array.from(document.body.children).forEach(function (child) {
      if (child !== root) child.inert = false;
    });

    suppressedFocusEls.forEach(function (el) {
      if (!el || !el.isConnected) return;
      var previous = el.getAttribute("data-menu-prev-tabindex");
      if (previous === "") el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", previous);
      el.removeAttribute("data-menu-prev-tabindex");
    });
    suppressedFocusEls = [];
  }

  function setMenuState(isOpen, moveFocus) {
    root.classList.toggle("is-menu-open", isOpen);
    if (overlay) overlay.setAttribute("aria-hidden", String(!isOpen));
    if (menuTrigger) menuTrigger.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) suppressBackgroundFocus();
    else restoreBackgroundFocus();
    if (moveFocus) {
      if (isOpen && closeTrigger) closeTrigger.focus();
      else if (!isOpen && menuTrigger) menuTrigger.focus();
    }
  }

  if (menuTrigger) {
    menuTrigger.addEventListener("click", function () { setMenuState(true, true); });
    menuTrigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenuState(true, true); }
    });
  }

  if (closeTrigger) {
    closeTrigger.addEventListener("click", function () { setMenuState(false, true); });
    closeTrigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenuState(false, true); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-menu-open")) setMenuState(false, true);
  });

  document.addEventListener("focusin", function (e) {
    if (!root.classList.contains("is-menu-open")) return;
    var target = e.target;
    if (target && !root.contains(target) && closeTrigger) {
      closeTrigger.focus();
    }
  });

  setMenuState(false);
})();

/* Home hero entrance animation (desktop only) – DEFERRED for performance */
document.addEventListener("DOMContentLoaded", function () {
  var triggerAnimation = function() {
    var body = document.body;
    if (!body || !body.classList.contains("home-page")) return;
    if (window.matchMedia("(max-width: 991px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof window.gsap === "undefined") return;

    var heroLogo = document.querySelector(".home-page header .hero-logo");
    var heroArrow = document.querySelector(".home-page header .lrg-img-pointer");
    if (!heroLogo || !heroArrow) return;

    gsap.set(heroLogo, { x: -180, autoAlpha: 0 });
    gsap.set(heroArrow, { autoAlpha: 0, scale: 0.68, transformOrigin: "50% 50%" });

    var timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline.to(heroLogo, {
      x: 0,
      autoAlpha: 1,
      duration: 0.9,
    });
    timeline.to(heroArrow, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.38,
      ease: "back.out(1.8)",
    }, "-=0.02");
  };
  /* Defer animation until browser is idle to prevent blocking initial render */
  if ("requestIdleCallback" in window) {
    requestIdleCallback(triggerAnimation, { timeout: 2000 });
  } else {
    setTimeout(triggerAnimation, 250);
  }
});

/* Home CTA reveal on scroll */
document.addEventListener("DOMContentLoaded", function () {
  var cta = document.querySelector(".home-page .home-cta-section");
  if (!cta) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cta.classList.add("is-revealed");
    return;
  }

  if (!("IntersectionObserver" in window)) {
    cta.classList.add("is-revealed");
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        cta.classList.add("is-revealed");
        observer.disconnect();
      }
    });
  }, {
    root: null,
    threshold: 0.18,
    rootMargin: "0px 0px -6% 0px"
  });

  observer.observe(cta);
});

// Prefetch pages on hover/focus for near-instant navigation
(function () {
  var prefetched = new Set();
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var canPrefetch = true;
  if (connection) {
    var saveData = Boolean(connection.saveData);
    var slowType = typeof connection.effectiveType === "string" && /(^2g$|^slow-2g$)/i.test(connection.effectiveType);
    if (saveData || slowType) canPrefetch = false;
  }
  function prefetch(href) {
    if (!canPrefetch) return;
    if (!href || prefetched.has(href)) return;
    try {
      var url = new URL(href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
    } catch (e) { return; }
    prefetched.add(href);
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest('a[href]');
    if (a) prefetch(a.href);
  });
  document.addEventListener('focusin', function (e) {
    var a = e.target.closest('a[href]');
    if (a) prefetch(a.href);
  });
})();

/* Testimonials slider – LAZY INITIALIZED when visible */
document.addEventListener("DOMContentLoaded", function () {
  var sliderRoot = document.querySelector(".testimonials-slider-wrapper");
  if (!sliderRoot || typeof Swiper === "undefined") {
    return;
  }

  var swiperInitialized = false;

  /* Only initialize Swiper when carousel comes into view */
  if (!("IntersectionObserver" in window)) {
    /* Fallback: initialize immediately if IntersectionObserver not supported */
    initSwiper();
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !swiperInitialized) {
        swiperInitialized = true;
        initSwiper();
        observer.disconnect();
      }
    });
  }, { threshold: 0.05, rootMargin: "50px" });

  observer.observe(sliderRoot);

  function initSwiper() {
    var liveRegion = document.getElementById("swiper-wrapper-f3fbcbe7e663d6f1");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Suppress live-region announcements while autoplay is running */
    if (!reducedMotion && liveRegion) {
      liveRegion.setAttribute("aria-live", "off");
    }

    var swiper = new Swiper(".testimonials-slider-wrapper", {
      navigation: {
        nextEl: ".testimonials-next",
        prevEl: ".testimonials-prev"
      },
      pagination: {
        el: ".testimonials-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<button class="' + className + '" type="button" aria-label="Go to testimonial ' + (index + 1) + '"></button>';
        }
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
        pageUpDown: false
      },
      effect: "cards",
      grabCursor: true,
      autoplay: reducedMotion
        ? false
        : { delay: 5000, disableOnInteraction: true },
      a11y: {
        enabled: true,
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "First slide",
        lastSlideMessage: "Last slide"
      }
    });

    /* Once the user interacts and autoplay stops, restore polite live announcements */
    swiper.on("autoplayStop", function () {
      if (liveRegion) liveRegion.setAttribute("aria-live", "polite");
    });

    /* Foremost card tilt (active slide only) */
    if (!reducedMotion) {
      var tiltStrength = 7;

      function resetTiltAll() {
        sliderRoot.querySelectorAll(".el-temoignages-item").forEach(function (card) {
          card.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
      }

      function getActiveCard() {
        return sliderRoot.querySelector(".swiper-slide-active .el-temoignages-item");
      }

      sliderRoot.addEventListener("mousemove", function (e) {
        var activeCard = getActiveCard();
        if (!activeCard) return;

        var rect = activeCard.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          activeCard.style.transform = "rotateX(0deg) rotateY(0deg)";
          return;
        }

        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        // Match the project-card tilt math, without background parallax.
        var rotateX = -((y - centerY) / centerY) * tiltStrength;
        var rotateY = -((x - centerX) / centerX) * -tiltStrength;

        activeCard.style.setProperty("--x", (x / rect.width) * 100 + "%");
        activeCard.style.setProperty("--y", (y / rect.height) * 100 + "%");
        activeCard.style.transform =
          "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
      });

      sliderRoot.addEventListener("mouseleave", function () {
        resetTiltAll();
      });

      swiper.on("slideChange", resetTiltAll);
    }
  }
});

/* Lazy-autoplay videos on scroll/visibility – deferred performance */
(function () {
  if (!("IntersectionObserver" in window)) {
    /* Fallback: autoplay immediately if IntersectionObserver not supported */
    document.querySelectorAll("[data-autoplay-on-visible]").forEach(function (video) {
      video.autoplay = true;
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target;
      if (entry.isIntersecting) {
        video.autoplay = true;
        video.play().catch(function () { /* muted=true makes autoplay more reliable */ });
      } else {
        video.autoplay = false;
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll("[data-autoplay-on-visible]").forEach(function (video) {
    observer.observe(video);
  });
})();

// Rotate focus accent on each Tab press (static color per focus, no continuous animation)
(function () {
  var colors = [
    { hex: "#FFE256", glow: "rgba(255, 226, 86, 0.55)" },
    { hex: "#56E0FF", glow: "rgba(86, 224, 255, 0.55)" },
    { hex: "#FF56FC", glow: "rgba(255, 86, 252, 0.55)" },
    { hex: "#00AA00", glow: "rgba(0, 170, 0, 0.50)" }
  ];
  var lastIndex = 0;

  function setFocusAccent(index) {
    var root = document.documentElement;
    root.style.setProperty("--focus-accent", colors[index].hex);
    root.style.setProperty("--focus-accent-glow", colors[index].glow);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;

    var nextIndex = lastIndex;
    while (nextIndex === lastIndex) {
      nextIndex = Math.floor(Math.random() * colors.length);
    }
    lastIndex = nextIndex;
    setFocusAccent(nextIndex);
  });
})();
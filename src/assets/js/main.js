(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open");
    });
    // Close nav on any anchor link click
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
    // Close on outside click
    document.addEventListener("click", function (e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
    // Close on Escape key, return focus to toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  // Sticky header: add .scrolled class when page scrolls past threshold
  var header = document.getElementById("site-header");
  if (header) {
    function updateHeader() {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // Scroll-reveal via IntersectionObserver
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: make all reveals visible immediately
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Language dropdown: close on outside click or on selection
  var langDropdown = document.getElementById("lang-dropdown");
  if (langDropdown) {
    document.addEventListener("click", function (e) {
      if (!langDropdown.contains(e.target)) {
        langDropdown.removeAttribute("open");
      }
    });
    langDropdown.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        langDropdown.removeAttribute("open");
      });
    });
  }

  // Beehive easter egg: click releases bees for ~3.5s
  var beehive = document.querySelector(".beehive");
  var beehiveBtn = beehive && beehive.querySelector(".beehive-btn");
  if (beehive && beehiveBtn) {
    var beesTimeout;
    beehiveBtn.addEventListener("click", function () {
      beehive.classList.remove("bees-flying");
      void beehive.offsetWidth; // force reflow so animations restart on repeat clicks
      beehive.classList.add("bees-flying");
      clearTimeout(beesTimeout);
      beesTimeout = setTimeout(function () {
        beehive.classList.remove("bees-flying");
      }, 3800);
    });
  }

  // Scroll-driven bee frame animation
  var beeCanvas = document.getElementById("beeCanvas");
  if (beeCanvas) {
    var beeSection = beeCanvas.closest(".bees-anim-section");
    var beeCtx = beeCanvas.getContext("2d");
    var BEE_FRAME_COUNT = 121;
    var beeFrames = new Array(BEE_FRAME_COUNT);
    var beeCurrentFrame = -1;

    function beeFramePath(n) {
      return "/assets/images/honey-bee-frames/honey-bee-frame-" + n + ".webp";
    }

    function resizeBeeCanvas() {
      var container = beeCanvas.parentElement;
      var cw = container.clientWidth;
      var ch = container.clientHeight;
      if (!cw || !ch) return;
      var ratio = 1176 / 1756;
      var h, w;
      if (ch * ratio <= cw) {
        h = ch * 0.88;
        w = h * ratio;
      } else {
        w = cw * 0.88;
        h = w / ratio;
      }
      beeCanvas.width = Math.round(w);
      beeCanvas.height = Math.round(h);
    }

    function drawBeeFrame(idx) {
      var img = beeFrames[idx];
      if (img && img.complete && img.naturalWidth) {
        beeCtx.clearRect(0, 0, beeCanvas.width, beeCanvas.height);
        beeCtx.drawImage(img, 0, 0, beeCanvas.width, beeCanvas.height);
      }
    }

    function updateBeeFrame() {
      var rect = beeSection.getBoundingClientRect();
      var sectionH = beeSection.offsetHeight;
      var viewH = window.innerHeight;
      var progress = -rect.top / (sectionH - viewH);
      progress = Math.max(0, Math.min(1, progress));
      var idx = Math.min(Math.floor(progress * BEE_FRAME_COUNT), BEE_FRAME_COUNT - 1);
      beeCurrentFrame = idx;
      drawBeeFrame(idx);
    }

    function preloadBeeFrames() {
      updateBeeFrame(); // prime beeCurrentFrame before frames load
      for (var i = 0; i < BEE_FRAME_COUNT; i++) {
        (function (index) {
          var img = new Image();
          img.onload = function () {
            if (index === beeCurrentFrame) drawBeeFrame(index);
          };
          img.src = beeFramePath(index + 1);
          beeFrames[index] = img;
        })(i);
      }
    }

    resizeBeeCanvas();

    if ("IntersectionObserver" in window) {
      var beeLoadObserver = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            beeLoadObserver.disconnect();
            preloadBeeFrames();
          }
        },
        { rootMargin: "600px" },
      );
      beeLoadObserver.observe(beeSection);
    } else {
      preloadBeeFrames();
    }

    window.addEventListener("scroll", updateBeeFrame, { passive: true });
    window.addEventListener("resize", function () {
      resizeBeeCanvas();
      drawBeeFrame(Math.max(0, beeCurrentFrame));
    });
  }

  // Contact form status from query params (success / error after POST)
  var statusEl = document.getElementById("form-status");
  if (statusEl) {
    var params = new URLSearchParams(location.search);
    if (params.get("sent") === "1") {
      statusEl.setAttribute("aria-live", "polite");
      statusEl.textContent = statusEl.dataset.success || "";
    } else if (params.get("sent") === "0") {
      statusEl.setAttribute("aria-live", "polite");
      statusEl.textContent = statusEl.dataset.error || "";
    }
  }
})();

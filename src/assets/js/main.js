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

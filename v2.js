(function () {
  var root = document.documentElement;
  var key = "portfolio-theme";
  var saved = localStorage.getItem(key);
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var current = saved || (prefersDark ? "dark" : "light");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(key, theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
      btn.setAttribute("aria-label", "Switch theme");
    }
  }

  setTheme(current);

  function initNav() {
    var navToggle = document.getElementById("nav-toggle");
    var navPanel = document.getElementById("nav-panel");
    var navBackdrop = document.getElementById("nav-backdrop");
    var body = document.body;
    if (!navToggle || !navPanel) return;

    function closeNav() {
      body.classList.remove("nav-open");
      navPanel.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      if (navBackdrop) {
        navBackdrop.classList.remove("is-visible");
        navBackdrop.setAttribute("aria-hidden", "true");
      }
      syncNavAria();
    }

    function openNav() {
      body.classList.add("nav-open");
      navPanel.classList.add("is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
      if (navBackdrop) {
        navBackdrop.classList.add("is-visible");
        navBackdrop.setAttribute("aria-hidden", "false");
      }
      syncNavAria();
    }

    function isDesktopNav() {
      return window.matchMedia("(min-width: 860px)").matches;
    }

    function syncNavAria() {
      if (isDesktopNav()) {
        navPanel.removeAttribute("aria-hidden");
      } else {
        navPanel.setAttribute("aria-hidden", navPanel.classList.contains("is-open") ? "false" : "true");
      }
    }

    navToggle.addEventListener("click", function () {
      if (navPanel.classList.contains("is-open")) closeNav();
      else openNav();
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeNav);
    }

    var navClose = document.getElementById("nav-close");
    if (navClose) {
      navClose.addEventListener("click", closeNav);
    }

    navPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!isDesktopNav()) closeNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (isDesktopNav()) closeNav();
      syncNavAria();
    });

    syncNavAria();
  }

  window.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
      });
    }
    initNav();
    initSnapCarousels();
  });

  function initSnapCarousels() {
    document.querySelectorAll("[data-carousel-snap]").forEach(function (root) {
      var viewport = root.querySelector(".carousel-viewport");
      var prev = root.querySelector("[data-carousel-prev]");
      var next = root.querySelector("[data-carousel-next]");
      if (!viewport) return;

      function step(dir) {
        var w = viewport.clientWidth;
        viewport.scrollBy({ left: dir * w, behavior: "smooth" });
      }

      if (prev) prev.addEventListener("click", function () { step(-1); });
      if (next) next.addEventListener("click", function () { step(1); });
    });
  }
})();

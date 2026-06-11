(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        var target = form.getAttribute("data-search-url") || form.getAttribute("action") || "./search.html";
        window.location.href = target + "?q=" + encodeURIComponent(query);
      });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupSearchPage() {
    var grid = document.getElementById("searchGrid");
    var input = document.querySelector(".search-filter-input");
    if (!grid || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var count = document.querySelector(".search-count");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function filter() {
      var query = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-text"));
        var visible = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = "找到 " + shown + " 部";
      }
    }
    input.addEventListener("input", filter);
    filter();
  }

  function setupPlayers() {
    document.querySelectorAll(".movie-video").forEach(function (video) {
      var source = video.getAttribute("data-source");
      var shell = video.closest(".player-shell");
      var button = shell ? shell.querySelector(".play-overlay") : null;
      var hlsInstance = null;
      function attach() {
        if (!source || video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "1");
      }
      function start() {
        attach();
        if (shell) {
          shell.classList.add("is-playing");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
      });
      video.addEventListener("pause", function () {
        if (shell && video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHeroCarousel();
    setupSearchPage();
    setupPlayers();
  });
})();

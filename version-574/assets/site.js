(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");

    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || params.get("search") || "";

    if (query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function apply() {
      var value = normalize(input.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-keywords") || "") + " " + card.textContent);
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    input.addEventListener("input", apply);
    apply();
  }

  window.initMoviePlayer = function (video, source) {
    if (!video || !source) {
      return;
    }

    var overlay = document.querySelector(".play-overlay");
    var hlsInstance = null;
    var ready = false;

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        ready = true;
        return;
      }

      video.src = source;
      ready = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function start() {
      prepare();
      hideOverlay();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    prepare();

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupHero();
    setupSearch();
  });
})();

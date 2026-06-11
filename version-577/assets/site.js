(function () {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function setupMenu() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = hero.querySelectorAll('.hero-slide');
    var dots = hero.querySelectorAll('.hero-dot');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    each(dots, function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(dotIndex);
        play();
      });
    });
    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', play);
    play();
  }

  function setupSearch() {
    var panel = document.querySelector('[data-search-panel]');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var kind = panel.querySelector('[data-filter-kind]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = document.querySelectorAll('[data-card]');
    var empty = document.querySelector('[data-no-result]');
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
    }
    function matchYear(card, value) {
      if (!value) {
        return true;
      }
      var number = parseInt(card.getAttribute('data-year'), 10) || 0;
      if (value === 'classic') {
        return number > 0 && number < 2010;
      }
      return number >= parseInt(value, 10);
    }
    function apply() {
      var q = normalize(input && input.value);
      var k = normalize(kind && kind.value);
      var y = year ? year.value : '';
      var shown = 0;
      each(cards, function (card) {
        var ok = (!q || cardText(card).indexOf(q) !== -1) && (!k || cardText(card).indexOf(k) !== -1) && matchYear(card, y);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (kind) {
      kind.addEventListener('change', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    each(players, function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.player-cover');
      var src = box.getAttribute('data-play');
      var ready = false;
      var hls = null;
      if (!video || !src) {
        return;
      }
      function loadAndPlay() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (ready) {
          video.play().catch(function () {});
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
          return;
        }
        video.src = src;
        video.play().catch(function () {});
      }
      if (cover) {
        cover.addEventListener('click', loadAndPlay);
      }
      video.addEventListener('click', function () {
        if (!ready) {
          loadAndPlay();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();

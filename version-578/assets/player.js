(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-video-player]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-player-button]');
    var started = false;
    var hls = null;

    function attach() {
      if (!video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function start() {
      if (!started) {
        attach();
        started = true;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();

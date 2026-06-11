(function () {
    var sliderTimers = new WeakMap();

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var index = 0;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                var active = current === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function restart() {
            if (sliderTimers.has(slider)) {
                window.clearInterval(sliderTimers.get(slider));
            }
            sliderTimers.set(slider, window.setInterval(function () {
                show(index + 1);
            }, 6200));
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-form'));
        forms.forEach(function (form) {
            var scopeSelector = form.getAttribute('data-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var input = form.querySelector('input[name="q"]');
            var type = form.querySelector('select[name="type"]');
            var region = form.querySelector('select[name="region"]');
            var clear = form.querySelector('.clear-filter');
            var params = new URLSearchParams(window.location.search);
            var preset = params.get('q');
            if (preset && input) {
                input.value = preset;
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var typeValue = normalize(type ? type.value : '');
                var regionValue = normalize(region ? region.value : '');
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var typeText = normalize(card.getAttribute('data-type'));
                    var regionText = normalize(card.getAttribute('data-region'));
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var typeMatch = !typeValue || typeText.indexOf(typeValue) !== -1;
                    var regionMatch = !regionValue || regionText.indexOf(regionValue) !== -1;
                    card.hidden = !(keywordMatch && typeMatch && regionMatch);
                });
            }

            ['input', 'change'].forEach(function (eventName) {
                form.addEventListener(eventName, apply);
            });
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function bindPlayer(video) {
        var stream = video.getAttribute('data-stream');
        if (!stream || video.getAttribute('data-bound') === '1') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
        video.setAttribute('data-bound', '1');
    }

    function playVideo(video) {
        bindPlayer(video);
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        videos.forEach(function (video) {
            var wrap = video.closest('.player-wrap');
            var targetId = video.getAttribute('id');
            var overlay = targetId ? document.querySelector('[data-player-target="' + targetId + '"]') : null;
            bindPlayer(video);
            if (overlay) {
                overlay.addEventListener('click', function () {
                    playVideo(video);
                });
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo(video);
                }
            });
            video.addEventListener('play', function () {
                if (wrap) {
                    wrap.classList.add('is-playing');
                }
            });
            video.addEventListener('pause', function () {
                if (wrap && video.currentTime === 0) {
                    wrap.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                if (wrap) {
                    wrap.classList.remove('is-playing');
                }
            });
        });
    }

    onReady(function () {
        initNavigation();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
})();

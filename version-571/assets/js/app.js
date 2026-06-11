(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-target')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
        var section = panel.nextElementSibling;
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
        var activeType = 'all';

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var type = card.getAttribute('data-type') || '';
                var matchesType = activeType === 'all' || type.indexOf(activeType) !== -1;
                var matchesQuery = !query || textOf(card).indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(matchesType && matchesQuery));
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-filter-type') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });

        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get('q');
            if (queryValue) {
                input.value = queryValue;
            }
        }

        apply();
    });

    function initPlayer(video) {
        if (!video) {
            return;
        }

        var source = video.querySelector('source');
        var url = source ? source.getAttribute('src') : '';

        if (url && window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else if (url && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        }
    }

    document.querySelectorAll('.movie-player').forEach(initPlayer);

    document.querySelectorAll('[data-player]').forEach(function (button) {
        button.addEventListener('click', function () {
            var id = button.getAttribute('data-player');
            var video = document.getElementById(id);
            if (!video) {
                return;
            }
            var shell = video.closest('.player-shell');
            if (shell) {
                shell.classList.add('is-playing');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (shell) {
                        shell.classList.remove('is-playing');
                    }
                });
            }
        });
    });
})();

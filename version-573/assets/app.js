(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dotWrap = document.querySelector('[data-hero-dots]');
    var dots = dotWrap ? Array.prototype.slice.call(dotWrap.querySelectorAll('button')) : [];
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope] .movie-card'));

    function applyQueryFromUrl() {
        if (!filterInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
        }
    }

    function filterCards() {
        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var type = filterType ? filterType.value : '';

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var cardType = card.getAttribute('data-type') || '';
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedType = !type || cardType.indexOf(type) !== -1 || text.indexOf(type) !== -1;
            card.classList.toggle('is-hidden', !(matchedQuery && matchedType));
        });
    }

    applyQueryFromUrl();

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (filterType) {
        filterType.addEventListener('change', filterCards);
    }

    filterCards();

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var stream = video ? video.getAttribute('data-stream') : '';

        if (!video || !stream) {
            return;
        }

        function begin() {
            video.controls = true;
            shell.classList.add('playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('playing');
                    if (button) {
                        button.style.opacity = '1';
                        button.style.pointerEvents = 'auto';
                    }
                });
            }
        }

        if (video.getAttribute('data-ready') === '1') {
            begin();
            return;
        }

        video.setAttribute('data-ready', '1');

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    shell.classList.remove('playing');
                }
            });
        } else {
            video.src = stream;
            begin();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var button = shell.querySelector('[data-play-button]');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(shell);
            });
        }
        shell.addEventListener('click', function (event) {
            if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
                startPlayer(shell);
            }
        });
    });
})();

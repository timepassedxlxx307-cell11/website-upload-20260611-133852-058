(function() {
    var header = document.querySelector('[data-site-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function() {
            navLinks.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = setInterval(function() {
                showSlide(currentSlide + 1);
            }, 5600);
        }
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-hero-prev]')).forEach(function(button) {
        button.addEventListener('click', function() {
            showSlide(currentSlide - 1);
            startHero();
        });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-hero-next]')).forEach(function(button) {
        button.addEventListener('click', function() {
            showSlide(currentSlide + 1);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var heroSearchForm = document.querySelector('[data-hero-search-form]');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var input = heroSearchForm.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var genreFilter = document.querySelector('[data-genre-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function queryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    if (searchInput && queryValue('q')) {
        searchInput.value = queryValue('q');
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var genre = genreFilter ? genreFilter.value : '';
        cards.forEach(function(card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-category') || ''
            ].join(' ').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || (card.getAttribute('data-year') === year);
            var matchGenre = !genre || text.indexOf(genre.toLowerCase()) !== -1;
            card.classList.toggle('is-filtered-out', !(matchQuery && matchYear && matchGenre));
        });
    }

    [searchInput, yearFilter, genreFilter].forEach(function(control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });
    filterCards();

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function(panel) {
        var video = panel.querySelector('video');
        var overlay = panel.querySelector('[data-play-overlay]');
        var button = panel.querySelector('[data-play-button]');
        var loaded = false;
        var hls = null;

        function loadVideo() {
            if (!video || loaded) {
                return;
            }
            var src = video.getAttribute('data-hls') || '';
            if (!src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            loaded = true;
        }

        function playVideo() {
            loadVideo();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.play().catch(function() {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        if (button) {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                playVideo();
            });
        }
        if (video) {
            video.addEventListener('play', function() {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function() {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    });
})();

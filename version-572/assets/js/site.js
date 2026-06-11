(function () {
    "use strict";

    var currentScript = document.currentScript;
    var assetBase = currentScript ? new URL(".", currentScript.src).href : "./assets/js/";
    var hlsConstructorPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-to]"));
        var previous = slider.querySelector("[data-slide-prev]");
        var next = slider.querySelector("[data-slide-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide-to")) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupCatalogFilters() {
        var tools = document.querySelector("[data-catalog-tools]");
        var grid = document.querySelector("[data-catalog-grid]");
        if (!tools || !grid) {
            return;
        }
        var keywordInput = tools.querySelector("[data-filter-keyword]");
        var categorySelect = tools.querySelector("[data-filter-category]");
        var yearSelect = tools.querySelector("[data-filter-year]");
        var sortSelect = tools.querySelector("[data-sort-select]");
        var visibleCount = document.querySelector("[data-visible-count]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var sort = params.get("sort") || "";

        if (keywordInput && query) {
            keywordInput.value = query;
        }
        if (sortSelect && sort) {
            sortSelect.value = sort;
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var shown = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchCategory = !category || cardCategory === category;
                var matchYear = !year || cardYear === year;
                var visible = matchKeyword && matchCategory && matchYear;

                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (visibleCount) {
                visibleCount.textContent = String(shown);
            }
        }

        function sortCards() {
            var mode = sortSelect ? sortSelect.value : "year-desc";
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === "score-desc") {
                    return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                }
                if (mode === "name-asc") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
                }
                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = sorted;
            applyFilter();
        }

        [keywordInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
        if (sortSelect) {
            sortSelect.addEventListener("change", sortCards);
        }

        sortCards();
        applyFilter();
    }

    function loadHlsConstructor() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!hlsConstructorPromise) {
            hlsConstructorPromise = import(assetBase + "hls-vendor-dru42stk.js").then(function (module) {
                return module.H || module.default;
            });
        }
        return hlsConstructorPromise;
    }

    function attachSource(video, src, status) {
        if (!src) {
            if (status) {
                status.textContent = "播放源暂不可用";
            }
            return Promise.reject(new Error("Missing video source"));
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            if (status) {
                status.textContent = "已启用浏览器原生 HLS 播放";
            }
            return Promise.resolve();
        }

        return loadHlsConstructor().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hlsInstance = hls;
                if (status) {
                    status.textContent = "HLS 播放源已加载";
                }
                return;
            }
            video.src = src;
            if (status) {
                status.textContent = "已尝试直接加载播放源";
            }
        }).catch(function () {
            video.src = src;
            if (status) {
                status.textContent = "已使用直接播放模式";
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video[data-src]");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            if (!video || !button) {
                return;
            }

            function startPlayback() {
                var src = video.getAttribute("data-src");
                player.classList.add("is-loading");
                attachSource(video, src, status).then(function () {
                    player.classList.remove("is-loading");
                    player.classList.add("is-playing");
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            if (status) {
                                status.textContent = "请再次点击播放器开始播放";
                            }
                        });
                    }
                });
            }

            button.addEventListener("click", startPlayback);
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupCatalogFilters();
        setupPlayers();
    });
}());

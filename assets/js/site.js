(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  if (!window.matchMedia("(hover: hover)").matches) root.classList.add("no-hover");

  // ---------- Header ----------
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "Close" : "Menu";
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && nav.classList.contains("is-open")) toggle.click();
  });

  // Highlight the nav link for the section in view.
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var sectionFor = { projects: "work", skills: "work" };
  if ("IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = sectionFor[entry.target.id] || entry.target.id;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle("is-active", k === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach(function (s) { navObs.observe(s); });
  }

  // ---------- Scroll reveals ----------
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings that enter together.
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (n) { return n.classList.contains("reveal"); });
        var i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(i * 60, 300) + "ms";
        el.classList.add("is-in");
        revealObs.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  }

  // ---------- Inline videos ----------
  // Muted, looping, and played only while on screen. Reduced motion: never autoplay.
  document.querySelectorAll("[data-video]").forEach(function (fig) {
    var video = fig.querySelector("video");
    var playBtn = fig.querySelector('[data-action="play"]');
    var soundBtn = fig.querySelector('[data-action="sound"]');
    var userPaused = reduceMotion;
    var inView = false;

    function sync() {
      var playing = !video.paused;
      if (playBtn) {
        playBtn.textContent = playing ? "Pause" : "Play";
        playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
      }
      if (soundBtn) {
        soundBtn.textContent = video.muted ? "Sound off" : "Sound on";
        soundBtn.setAttribute("aria-label", video.muted ? "Unmute" : "Mute");
        soundBtn.setAttribute("aria-pressed", String(!video.muted));
      }
    }
    function tryPlay() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { sync(); });
    }

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    video.addEventListener("volumechange", sync);

    if (playBtn) playBtn.addEventListener("click", function () {
      if (video.paused) { userPaused = false; tryPlay(); }
      else { userPaused = true; video.pause(); }
    });
    if (soundBtn) soundBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      if (!video.muted) {
        // Only one video with sound at a time.
        document.querySelectorAll("[data-video] video").forEach(function (v) { if (v !== video) v.muted = true; });
        if (video.paused) { userPaused = false; tryPlay(); }
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView && !userPaused) tryPlay();
        else if (!inView && !video.paused) video.pause();
      }, { threshold: 0.25 }).observe(video);
    }
    sync();
  });

  // ---------- YouTube facades ----------
  // Loads the real player only on click.
  document.querySelectorAll(".yt[data-yt]").forEach(function (btn) {
    var id = btn.getAttribute("data-yt");
    if (!btn.querySelector("img")) {
      btn.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    }
    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = btn.getAttribute("aria-label") || "YouTube video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  // ---------- Project filters ----------
  var filterBtns = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll(".grid .card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(/\s+/);
        var show = f === "all" || tags.indexOf(f) !== -1;
        card.classList.toggle("is-hidden", !show);
        // Uniform tiles while filtered so the grid doesn't leave gaps.
        card.classList.toggle("card--lg", show && f === "all" && card.hasAttribute("data-lg"));
      });
    });
  });
  cards.forEach(function (card) { if (card.classList.contains("card--lg")) card.setAttribute("data-lg", ""); });

  // ---------- Flow video parallax ----------
  var flowVideo = document.querySelector(".flow__video video");
  if (flowVideo && !reduceMotion && window.matchMedia("(min-width: 861px)").matches) {
    var flow = document.getElementById("flow");
    var ticking = false;
    function parallax() {
      ticking = false;
      var r = flow.getBoundingClientRect();
      var progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      flowVideo.style.transform = "translateY(" + (progress * -40).toFixed(1) + "px)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();

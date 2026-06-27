/* =============================================================================
   APP — orchestration.
   Runs background-safe modules immediately, shows the gate, and on unlock
   reveals the site + boots the content modules, the scroll-reveal observer,
   the audio and the (sparse) floating hearts.
   ========================================================================== */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let heartsTimer = null;

  function boot() {
    const cfg = window.LOVE_CONFIG || {};

    // ---- titles / hero text ----
    document.title = siteTitle(cfg) || "For us";
    setText("hero-title", cfg.partnerA);
    setText("hero-title2", cfg.partnerB);
    setText("footer-sig", siteTitle(cfg));

    // ---- background-safe modules ----
    call("starfield", "init");
    call("countdown", "init");
    call("audio", "init");

    // ---- reveal listener (set up BEFORE auth.init so a valid token unlocks) ----
    window.addEventListener("love:unlocked", revealSite, { once: true });

    // ---- gate ----
    call("auth", "init");
  }

  function revealSite() {
    const site = document.getElementById("site");
    const gate = document.getElementById("gate");
    const nav = document.getElementById("bottom-nav");

    // reveal the site behind the fading gate
    if (site) {
      site.hidden = false;
      site.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => site.classList.add("is-revealed"));
    }
    if (gate && !gate.hidden) {
      gate.classList.add("is-leaving");
      setTimeout(() => { gate.hidden = true; }, 1300);
    }

    if (nav) nav.hidden = false;
    // show the audio control only if a song is configured (audio.show guards it)
    call("audio", "show");

    // stagger the hero entrance
    document.querySelectorAll(".hero .reveal").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", (i * 0.14) + "s");
    });

    // boot content modules (they render into #site)
    call("timeline", "init");
    call("polaroids", "init");
    call("scratch", "init");
    call("letter", "init");
    call("nav", "init");

    // scroll-reveal observer for everything tagged .reveal
    setupReveal();

    // start the song (a user gesture just happened for fresh unlocks)
    call("audio", "maybeStart");

    // gentle, sparse floating hearts
    startHearts();

    // move focus into the experience for keyboard / screen-reader users
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.setAttribute("tabindex", "-1");
      setTimeout(() => hero.focus({ preventScroll: true }), 1400);
    }
  }

  function setupReveal() {
    const observe = () => {
      const targets = document.querySelectorAll("#site .reveal:not(.is-visible)");
      if (!targets.length) return;
      if (reduced) {
        targets.forEach((t) => t.classList.add("is-visible"));
        return;
      }
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          obs.unobserve(en.target);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => en.target.classList.add("is-visible"));
          });
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
      targets.forEach((t) => io.observe(t));
    };
    requestAnimationFrame(() => requestAnimationFrame(observe));
  }

  function startHearts() {
    if (reduced) return;
    const layer = document.getElementById("hearts");
    if (!layer) return;
    const spawn = () => {
      const s = document.createElement("span");
      s.className = "heart";
      s.textContent = "❤";
      s.style.left = Math.random() * 100 + "%";
      s.style.fontSize = (9 + Math.random() * 11) + "px";
      s.style.setProperty("--rot", (Math.random() * 60 - 30) + "deg");
      const dur = 9 + Math.random() * 6;
      s.style.animationDuration = dur + "s";
      layer.appendChild(s);
      setTimeout(() => s.remove(), dur * 1000 + 600);
    };
    // a first one soon, then a slow trickle — never overwhelming
    setTimeout(spawn, 2500);
    heartsTimer = setInterval(spawn, 6500);
  }

  // ---- helpers ----
  function call(ns, fn) {
    const m = window.Love && window.Love[ns];
    if (m && typeof m[fn] === "function") m[fn]();
  }
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }
  function siteTitle(cfg) {
    const custom = cfg.siteTitle;
    if (custom && !String(custom).includes("undefined")) return custom;
    return [cfg.partnerA, cfg.partnerB].filter(Boolean).join(" & ");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

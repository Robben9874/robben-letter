/* =============================================================================
   COUNTDOWN — live, real-time countdown to the wedding date.
   Updates every second. Graceful when the day arrives.
   ========================================================================== */
(function () {
  "use strict";

  const cfg = window.LOVE_CONFIG || {};
  const target = cfg.weddingDate ? new Date(cfg.weddingDate).getTime() : NaN;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = {};
  let interval = null;
  let startTimeout = null;
  let started = false;

  function init() {
    els.days = document.querySelector('[data-unit="days"]');
    els.hours = document.querySelector('[data-unit="hours"]');
    els.minutes = document.querySelector('[data-unit="minutes"]');
    els.seconds = document.querySelector('[data-unit="seconds"]');
    els.place = document.getElementById("countdown-place");
    els.root = document.getElementById("countdown");
    if (!els.days) return;

    if (cfg.weddingPlace && els.place) els.place.textContent = cfg.weddingPlace;

    if (isNaN(target)) {
      setText(els.days, "—", true);
      setText(els.hours, "—", true);
      setText(els.minutes, "—", true);
      setText(els.seconds, "—", true);
      return;
    }

    window.addEventListener("love:unlocked", start, { once: true });
  }

  function start() {
    if (started) return;
    started = true;
    tick({ silent: true });
    const delay = reduced ? 0 : 1600;
    startTimeout = setTimeout(() => {
      interval = setInterval(tick, 1000);
    }, delay);
  }

  function tick(opts) {
    const silent = !!(opts && opts.silent);
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      set(0, 0, 0, 0, true);
      if (els.root) els.root.classList.add("is-final");
      if (els.place) els.place.textContent = "Today, we say forever.";
      if (startTimeout) clearTimeout(startTimeout);
      if (interval) clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / 86400000); diff %= 86400000;
    const hours = Math.floor(diff / 3600000); diff %= 3600000;
    const minutes = Math.floor(diff / 60000); diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    set(days, hours, minutes, seconds, silent);

    if (els.root && diff < 86400000 && !els.root.classList.contains("is-final")) {
      els.root.classList.add("is-final");
    }
  }

  function set(d, h, m, s, silent) {
    setText(els.days, pad(d), silent);
    setText(els.hours, pad(h), silent);
    setText(els.minutes, pad(m), silent);
    setText(els.seconds, pad(s), silent);
  }

  function setText(el, next, silent) {
    if (!el || el.textContent === next) return;
    el.textContent = next;
    if (reduced || silent) return;
    el.classList.remove("is-ticking");
    void el.offsetWidth;
    el.classList.add("is-ticking");
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  window.Love = window.Love || {};
  window.Love.countdown = { init };
})();

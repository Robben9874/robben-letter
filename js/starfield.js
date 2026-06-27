/* =============================================================================
   STARFIELD — warm-white / faint-gold twinkling stars + occasional shooting star
   Responsive canvas, DPR-aware, reduced-motion aware.
   ========================================================================== */
(function () {
  "use strict";

  const cfg = (window.LOVE_CONFIG && window.LOVE_CONFIG.stars) || {};
  const DENSITY = cfg.density || 1;
  const SHOOT_CHANCE = cfg.shootingStarChance ?? 0.002;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let canvas, ctx, stars = [], shooters = [], w = 0, h = 0, dpr = 1, raf = null, lastT = 0;

  function init() {
    canvas = document.getElementById("starfield");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    buildStars();
    window.addEventListener("resize", debounce(resize, 200));
    window.addEventListener("orientationchange", () => setTimeout(resize, 300));
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", debounce(resize, 100));
      window.visualViewport.addEventListener("scroll", debounce(resize, 100));
    }

    if (reduced) {
      drawStatic();
    } else {
      lastT = performance.now();
      raf = requestAnimationFrame(loop);
    }
    // Pause when tab hidden to save battery.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      } else if (!reduced && !raf) {
        lastT = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // visualViewport is more accurate on mobile (address bar, keyboard, etc.)
    const vp = window.visualViewport;
    w = vp ? Math.round(vp.width) : window.innerWidth;
    h = vp ? Math.round(vp.height) : window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduced) drawStatic();
  }

  function buildStars() {
    const area = w * h;
    // ~ one star per 9000 px², scaled by density, capped for performance.
    const count = Math.min(360, Math.round((area / 9000) * DENSITY));
    stars = new Array(count).fill(0).map(() => makeStar());
  }

  function makeStar() {
    const r = Math.pow(Math.random(), 2.2) * 1.8 + 0.3; // mostly small, few large
    const gold = Math.random() < 0.28;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r,
      base: 0.25 + Math.random() * 0.55,
      amp: 0.15 + Math.random() * 0.4,
      speed: 0.0006 + Math.random() * 0.0022,
      phase: Math.random() * Math.PI * 2,
      color: gold ? "241, 222, 168" : "255, 244, 220", // faint gold / warm white
    };
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.color}, ${s.base})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) {
    const dt = t - lastT;
    lastT = t;
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.phase += s.speed * dt;
      const a = clamp(s.base + Math.sin(s.phase) * s.amp, 0.05, 1);
      if (s.r > 1.2) {
        // soft glow for the larger stars
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        g.addColorStop(0, `rgba(${s.color}, ${a})`);
        g.addColorStop(0.4, `rgba(${s.color}, ${a * 0.4})`);
        g.addColorStop(1, `rgba(${s.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.color}, ${a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // shooting stars
    if (Math.random() < SHOOT_CHANCE && shooters.length < 2) spawnShooter();
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.life -= dt;
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      drawShooter(sh);
      if (sh.life <= 0 || sh.x > w + 80 || sh.y > h + 80) shooters.splice(i, 1);
    }

    raf = requestAnimationFrame(loop);
  }

  function spawnShooter() {
    const startX = Math.random() * w * 0.7;
    const startY = Math.random() * h * 0.4;
    const angle = Math.PI / 5 + Math.random() * 0.25; // diagonal down-right
    const speed = 0.5 + Math.random() * 0.4;
    shooters.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 700 + Math.random() * 400,
      maxLife: 1100,
      len: 90 + Math.random() * 80,
    });
  }

  function drawShooter(sh) {
    const alpha = clamp(sh.life / 600, 0, 1);
    const tailX = sh.x - sh.vx * sh.len;
    const tailY = sh.y - sh.vy * sh.len;
    const g = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
    g.addColorStop(0, `rgba(255, 244, 220, ${alpha})`);
    g.addColorStop(0.3, `rgba(241, 222, 168, ${alpha * 0.5})`);
    g.addColorStop(1, "rgba(241, 222, 168, 0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    // bright head
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 248, 230, ${alpha})`;
    ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function debounce(fn, ms) {
    let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
  }

  window.Love = window.Love || {};
  window.Love.starfield = { init };
})();

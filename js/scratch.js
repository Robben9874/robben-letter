/* =============================================================================
   SCRATCH CARDS — scratch off a coating to reveal a hidden note, joke or photo.
   Canvas + Pointer Events (mouse & touch). Auto-reveals past a threshold.
   Keyboard accessible: focus a card and press Enter / Space to reveal fully.
   ========================================================================== */
(function () {
  "use strict";

  const REVEAL_THRESHOLD = 0.5; // 50% scratched → auto fade
  const cards = [];

  function init() {
    const grid = document.getElementById("scratch-grid");
    if (!grid) return;
    const items = (window.LOVE_CONFIG && window.LOVE_CONFIG.scratch) || [];
    if (!items.length) {
      grid.innerHTML = '<p style="opacity:.5;font-style:italic;grid-column:1/-1;text-align:center;padding:3rem">Your little secrets will hide here.</p>';
      return;
    }

    items.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = "scratch reveal";
      card.style.setProperty("--reveal-delay", (i * 0.08) + "s");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Scratch to reveal a secret. Press Enter to reveal.");

      // 1) the hidden content underneath
      card.appendChild(buildReveal(item));

      // 2) the coating canvas on top
      const canvas = document.createElement("canvas");
      canvas.className = "scratch__canvas";
      canvas.setAttribute("aria-hidden", "true");
      card.appendChild(canvas);

      grid.appendChild(card);

      const instance = { card, canvas, ctx: null, revealed: false, lastSample: 0 };
      fitCanvas(instance);
      drawCoating(instance, item.label || "a secret");
      bindScratch(instance);
      bindKeyboard(instance);

      cards.push(instance);
    });

    let rId;
    window.addEventListener("resize", () => {
      clearTimeout(rId);
      rId = setTimeout(() => {
        cards.forEach((c) => { if (!c.revealed) { fitCanvas(c); drawCoating(c, c.label || "a secret"); } });
      }, 200);
    });
  }

  function buildReveal(item) {
    const wrap = document.createElement("div");
    wrap.className = "scratch__reveal" + (item.type === "photo" ? " scratch__reveal--photo" : "");

    if (item.type === "photo") {
      if (item.image) {
        const img = document.createElement("img");
        img.className = "scratch__photo";
        img.src = item.image;
        img.alt = item.caption || "";
        img.loading = "lazy";
        wrap.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "scratch__placeholder tint-" + (item.tint || "gold");
        ph.textContent = item.caption || "a hidden moment";
        wrap.appendChild(ph);
      }
      if (item.caption) {
        const cap = document.createElement("span");
        cap.className = "scratch__photo-cap";
        cap.textContent = item.caption;
        wrap.appendChild(cap);
      }
    } else {
      const note = document.createElement("div");
      note.className = "scratch__note";
      if (item.heading) {
        const h = document.createElement("p");
        h.className = "scratch__heading";
        h.textContent = item.heading;
        note.appendChild(h);
      }
      if (item.body) {
        const b = document.createElement("p");
        b.className = "scratch__body";
        b.textContent = item.body;
        note.appendChild(b);
      }
      wrap.appendChild(note);
    }
    return wrap;
  }

  function fitCanvas(inst) {
    const rect = inst.card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    inst.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    inst.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    inst.ctx = inst.canvas.getContext("2d");
    inst.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    inst._cssW = rect.width;
    inst._cssH = rect.height;
    inst._dpr = dpr;
  }

  function drawCoating(inst, label) {
    inst.label = label;
    const ctx = inst.ctx, w = inst._cssW, h = inst._cssH;
    // dusty rose-gold coating
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#d8a39b");
    g.addColorStop(0.5, "#e0b489");
    g.addColorStop(1, "#c9927d");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // soft speckle texture
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // center hint
    ctx.fillStyle = "rgba(58,42,32,0.62)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "22px 'Caveat', cursive";
    ctx.fillText("scratch to reveal", w / 2, h / 2 - 6);
    ctx.font = "13px 'Hanken Grotesk', sans-serif";
    ctx.fillStyle = "rgba(58,42,32,0.45)";
    ctx.fillText("drag with mouse or finger", w / 2, h / 2 + 18);

    // corner label
    if (label) {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = "600 10px 'Hanken Grotesk', sans-serif";
      ctx.fillStyle = "rgba(58,42,32,0.55)";
      const txt = label.toUpperCase();
      ctx.save();
      ctx.translate(14, 14);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }
  }

  function bindScratch(inst) {
    let drawing = false, last = null;

    const pos = (e) => {
      const r = inst.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const scratchAt = (p) => {
      const ctx = inst.ctx;
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 34;
      ctx.beginPath();
      if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); }
      else { ctx.arc(p.x, p.y, 17, 0, Math.PI * 2); }
      ctx.stroke();
      // also punch a soft circle for fuller coverage
      ctx.beginPath();
      ctx.arc(p.x, p.y, 17, 0, Math.PI * 2);
      ctx.fill();
      last = p;
    };

    inst.canvas.addEventListener("pointerdown", (e) => {
      if (inst.revealed) return;
      drawing = true; last = null;
      try { inst.canvas.setPointerCapture(e.pointerId); } catch (_) {}
      scratchAt(pos(e));
      e.preventDefault();
    });
    inst.canvas.addEventListener("pointermove", (e) => {
      if (!drawing || inst.revealed) return;
      scratchAt(pos(e));
      maybeCheckProgress(inst);
    });
    const stop = (e) => {
      drawing = false; last = null;
      try { inst.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      maybeCheckProgress(inst, true);
    };
    inst.canvas.addEventListener("pointerup", stop);
    inst.canvas.addEventListener("pointercancel", stop);
    inst.canvas.addEventListener("pointerleave", () => { drawing = false; last = null; });
  }

  function bindKeyboard(inst) {
    inst.card.addEventListener("keydown", (e) => {
      if (inst.revealed) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        reveal(inst);
      }
    });
  }

  function maybeCheckProgress(inst, force) {
    const now = performance.now();
    if (!force && now - inst.lastSample < 160) return;
    inst.lastSample = now;
    const ctx = inst.ctx;
    const w = inst.canvas.width, h = inst.canvas.height;
    // sample on a small grid for speed
    const step = 6;
    let cleared = 0, total = 0;
    try {
      const img = ctx.getImageData(0, 0, w, h).data;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          total++;
          if (img[(y * w + x) * 4 + 3] < 32) cleared++;
        }
      }
    } catch (_) { return; }
    if (total && cleared / total >= REVEAL_THRESHOLD) reveal(inst);
  }

  function reveal(inst) {
    if (inst.revealed) return;
    inst.revealed = true;
    inst.canvas.classList.add("is-gone");
    inst.card.setAttribute("aria-label", "Secret revealed.");
    inst.card.removeAttribute("tabindex");
    inst.card.removeAttribute("role");
  }

  window.Love = window.Love || {};
  window.Love.scratch = { init };
})();

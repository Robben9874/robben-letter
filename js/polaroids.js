/* =============================================================================
   POLAROIDS — scattered, draggable memories with handwritten captions.
   Positions are percentage-based (resize-safe) and persisted to localStorage.
   Hover gently floats, enlarges and straightens (CSS). Drag uses Pointer Events.
   ========================================================================== */
(function () {
  "use strict";

  const STORE_KEY = "love:polaroids:v1";
  let field, zCounter = 10;

  function init() {
    field = document.getElementById("polaroid-field");
    if (!field) return;
    const items = (window.LOVE_CONFIG && window.LOVE_CONFIG.polaroids) || [];
    if (!items.length) {
      field.innerHTML = '<p style="opacity:.5;font-style:italic;text-align:center;padding:3rem">Your moments will scatter here.</p>';
      return;
    }

    const saved = loadStore();
    const cols = items.length <= 4 ? 2 : 3;
    const rows = Math.ceil(items.length / cols);
    const isNarrow = () => window.innerWidth <= 760;

    items.forEach((p, i) => {
      const el = document.createElement("div");
      el.className = "polaroid reveal tint-" + (p.tint || "rose");
      el.style.setProperty("--reveal-delay", (i * 0.06) + "s");

      const rotate = typeof p.rotate === "number" ? p.rotate : seeded(i) * 22 - 11;
      el.style.setProperty("--rot", rotate + "deg");
      el.dataset.index = String(i);

      const media = document.createElement("div");
      media.className = "polaroid__media";
      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.caption || "";
        img.loading = "lazy";
        img.draggable = false;
        media.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "polaroid__placeholder";
        ph.textContent = p.caption || "us";
        media.appendChild(ph);
      }
      el.appendChild(media);

      const cap = document.createElement("div");
      cap.className = "polaroid__caption";
      cap.textContent = p.caption || "";
      el.appendChild(cap);

      let pos = saved[i];
      if (!pos) pos = defaultPos(i, cols, rows, isNarrow());
      el.style.left = pos.l + "%";
      el.style.top = pos.t + "%";

      enableDrag(el, i, saved);
      field.appendChild(el);
    });

    // After layout, clamp every card so none spills past the right/bottom edge.
    requestAnimationFrame(() => {
      field.querySelectorAll(".polaroid").forEach((el) => {
        const i = parseInt(el.dataset.index, 10);
        applyPosition(el, parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0, saved, i);
      });
      saveStore(saved);
    });

    let resizeId;
    window.addEventListener("resize", () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => {
        field.querySelectorAll(".polaroid").forEach((el) => {
          const i = parseInt(el.dataset.index, 10);
          applyPosition(el, parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0, saved, i);
        });
        saveStore(saved);
      }, 150);
    });
  }

  function defaultPos(i, cols, rows, narrow) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const spread = narrow ? 48 : 72;
    const l = cols > 1 ? 4 + (col / (cols - 1)) * spread : 30;
    const t = rows > 1 ? 4 + (row / (rows - 1)) * 54 : 28;
    const maxL = narrow ? 50 : 68;
    return {
      l: clamp(l + (seeded(i * 3) - 0.5) * 6, 2, maxL),
      t: clamp(t + (seeded(i * 7 + 1) - 0.5) * 8, 2, narrow ? 52 : 56),
    };
  }

  function maxLeftPct(el) {
    const fw = field.getBoundingClientRect().width;
    const ew = el.getBoundingClientRect().width;
    if (!fw || !ew) return 50;
    return Math.max(0, 100 - (ew / fw) * 100 - 1);
  }

  function maxTopPct(el) {
    const fh = field.getBoundingClientRect().height;
    const eh = el.getBoundingClientRect().height;
    if (!fh || !eh) return 55;
    return Math.max(0, 100 - (eh / fh) * 100 - 1);
  }

  function applyPosition(el, l, t, store, index) {
    l = clamp(l, 0, maxLeftPct(el));
    t = clamp(t, 0, maxTopPct(el));
    el.style.left = l + "%";
    el.style.top = t + "%";
    if (store && index != null) store[index] = { l, t };
    return { l, t };
  }

  function enableDrag(el, index, store) {
    let startX = 0, startY = 0, startL = 0, startT = 0, fw = 0, fh = 0, dragging = false;

    el.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      dragging = true;
      const rect = field.getBoundingClientRect();
      fw = rect.width; fh = rect.height;
      startX = e.clientX; startY = e.clientY;
      startL = parseFloat(el.style.left) || 0;
      startT = parseFloat(el.style.top) || 0;
      el.classList.add("is-dragging");
      el.style.setProperty("--z", String(++zCounter));
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = (e.clientX - startX) / fw * 100;
      const dy = (e.clientY - startY) / fh * 100;
      applyPosition(el, startL + dx, startT + dy);
    });

    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      applyPosition(el, parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0, store, index);
      saveStore(store);
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  function saveStore(store) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch (_) {}
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function seeded(n) {
    let h = (n + 1) * 2654435761 >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 1597334677) >>> 0;
    h ^= h >>> 15;
    return (h % 10000) / 10000;
  }

  window.Love = window.Love || {};
  window.Love.polaroids = { init };
})();

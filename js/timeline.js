/* =============================================================================
   TIMELINE — renders the relationship events from config.
   Items carry a `.reveal` class + stagger delay; app.js observes them.
   ========================================================================== */
(function () {
  "use strict";

  function init() {
    const list = document.getElementById("timeline-list");
    if (!list) return;
    const events = (window.LOVE_CONFIG && window.LOVE_CONFIG.timeline) || [];

    if (!events.length) {
      list.innerHTML = emptyNote("Your timeline will appear here.");
      return;
    }

    const frag = document.createDocumentFragment();
    events.forEach((ev, i) => {
      const li = document.createElement("li");
      li.className = "tl-item reveal";
      li.style.setProperty("--reveal-delay", (i * 0.08) + "s");

      const card = document.createElement("div");
      card.className = "tl-card";

      if (ev.icon) {
        const icon = document.createElement("span");
        icon.className = "tl-item__icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = ev.icon;
        card.appendChild(icon);
      }

      const date = document.createElement("p");
      date.className = "tl-item__date";
      date.textContent = ev.date || "";

      const title = document.createElement("h3");
      title.className = "tl-item__title";
      title.textContent = ev.title || "";

      card.appendChild(date);
      card.appendChild(title);

      if (ev.text) {
        const text = document.createElement("p");
        text.className = "tl-item__text";
        text.textContent = ev.text;
        card.appendChild(text);
      }

      li.appendChild(card);
      frag.appendChild(li);
    });

    list.appendChild(frag);
  }

  function emptyNote(msg) {
    const li = document.createElement("li");
    li.className = "tl-item reveal";
    const card = document.createElement("div");
    card.className = "tl-card";
    const p = document.createElement("p");
    p.className = "tl-item__text";
    p.style.fontStyle = "italic";
    p.textContent = msg;
    card.appendChild(p);
    li.appendChild(card);
    return li;
  }

  window.Love = window.Love || {};
  window.Love.timeline = { init };
})();

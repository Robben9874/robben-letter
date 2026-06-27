/* =============================================================================
   LOVE LETTER — renders the Arabic letter (RTL) and unfolds it on scroll.
   Only this section flips to RTL + Tajawal; the rest of the site stays LTR/English.
   ========================================================================== */
(function () {
  "use strict";

  function init() {
    const letter = document.getElementById("letter-card");
    const wrap = document.getElementById("letter-wrap");
    if (!letter || !wrap) return;
    const c = (window.LOVE_CONFIG && window.LOVE_CONFIG.letter) || {};
    if (!c.paragraphs || !c.paragraphs.length) {
      const p = document.createElement("p");
      p.className = "letter__p";
      p.style.fontStyle = "italic";
      p.textContent = "Your letter will be written here.";
      letter.appendChild(p);
      open(letter);
      return;
    }

    if (c.salutation) {
      const s = document.createElement("p");
      s.className = "letter__salutation";
      s.textContent = c.salutation;
      letter.appendChild(s);
    }

    c.paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.className = "letter__p";
      // support simple line breaks within a paragraph
      p.textContent = text;
      letter.appendChild(p);
    });

    if (c.signoff) {
      const so = document.createElement("p");
      so.className = "letter__signoff";
      so.textContent = c.signoff;
      letter.appendChild(so);
    }

    // wax seal
    const seal = document.createElement("span");
    seal.className = "letter__seal";
    seal.setAttribute("aria-hidden", "true");
    seal.textContent = "❤";
    letter.appendChild(seal);

    // unfold when scrolled into view (IntersectionObserver, no scroll listeners)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { open(letter); return; }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { open(letter); obs.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(wrap);
  }

  function open(letter) { letter.classList.add("is-open"); }

  window.Love = window.Love || {};
  window.Love.letter = { init };
})();

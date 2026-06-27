/* =============================================================================
   BOTTOM NAV — fixed, blurred. Active link follows the section in view via
   IntersectionObserver (no scroll listeners). Clicks smooth-scroll.
   ========================================================================== */
(function () {
  "use strict";

  function init() {
    const nav = document.getElementById("bottom-nav");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll(".bottom-nav__link"));
    const sections = links
      .map((l) => document.getElementById(l.dataset.target))
      .filter(Boolean);

    // active-section observer: a section is active when it crosses the
    // vertical middle of the viewport.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    sections.forEach((s) => io.observe(s));

    // gentle smooth-scroll that accounts for the fixed nav
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.dataset.target;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
        setActive(id);
      });
    });

    function setActive(id) {
      links.forEach((l) => l.classList.toggle("is-active", l.dataset.target === id));
    }
  }

  window.Love = window.Love || {};
  window.Love.nav = { init };
})();

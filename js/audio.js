/* =============================================================================
   AUDIO — background song with a discreet play/pause + mute control.
   Autoplay is blocked until the user interacts, so we start on unlock.
   ========================================================================== */
(function () {
  "use strict";

  const cfg = (window.LOVE_CONFIG && window.LOVE_CONFIG.song) || {};
  const src = cfg.src || "";
  const shouldAutoplay = cfg.autoplay !== false;

  let audio, btn, muteBtn, control, started = false;
  const hasSong = !!src;

  function init() {
    control = document.getElementById("audio-control");
    btn = document.getElementById("audio-btn");
    muteBtn = document.getElementById("audio-mute");
    if (!control) return;

    // No song configured → keep the control hidden, nothing to do.
    if (!hasSong) { control.hidden = true; return; }

    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.55;

    btn.addEventListener("click", toggle);
    muteBtn.addEventListener("click", toggleMute);

    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));
  }

  // Called by app.js after the gate opens (a valid user gesture).
  function maybeStart() {
    if (!audio || started) return;
    started = true;
    if (shouldAutoplay) {
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        // If the browser still blocks, try once more on the next interaction.
        p.catch(() => {
          const retry = () => { audio.play().catch(() => {}); cleanup(); };
          const cleanup = () => {
            window.removeEventListener("pointerdown", retry);
            window.removeEventListener("keydown", retry);
          };
          window.addEventListener("pointerdown", retry, { once: false });
          window.addEventListener("keydown", retry, { once: false });
        });
      }
    }
  }

  function toggle() {
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function toggleMute() {
    if (!audio) return;
    audio.muted = !audio.muted;
    if (muteBtn) {
      muteBtn.setAttribute("aria-pressed", String(audio.muted));
      muteBtn.setAttribute("aria-label", audio.muted ? "Unmute" : "Mute");
    }
  }

  function setPlaying(on) {
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("is-playing", on);
    btn.setAttribute("aria-label", on ? "Pause our song" : "Play our song");
    const bars = btn.querySelector(".audio-btn__bars");
    if (bars) bars.style.display = on ? "inline-flex" : "none";
  }

  // Reveal the control — but only when a song is actually configured.
  function show() {
    if (control && hasSong) control.hidden = false;
  }

  window.Love = window.Love || {};
  window.Love.audio = { init, show, maybeStart, toggle, toggleMute };
})();

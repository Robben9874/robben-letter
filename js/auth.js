/* =============================================================================
   AUTH — password gate.
   The real password lives only in the Vercel env var SITE_PASSWORD and is
   checked by /api/verify. The client never sees it. A session token keeps the
   gate open for the current tab session.
   ========================================================================== */
(function () {
  "use strict";

  const TOKEN_KEY = "love:token";
  let form, input, errorEl, submitBtn;

  function init() {
    const cfg = window.LOVE_CONFIG || {};
    form = document.getElementById("gate-form");
    input = document.getElementById("gate-password");
    errorEl = document.getElementById("gate-error");
    submitBtn = form && form.querySelector(".gate__submit");

    // populate hint + subtext
    const hint = document.getElementById("gate-hint");
    const sub = document.getElementById("gate-subtext");
    if (hint) hint.textContent = cfg.passwordHint || "Enter the password 💕";
    if (sub) sub.textContent = cfg.passwordSubtext || "";
    if (input) input.placeholder = cfg.passwordPlaceholder || "password";

    // already unlocked this session? skip the gate entirely (no flash on return)
    if (hasValidToken()) {
      const g = document.getElementById("gate");
      if (g) g.hidden = true;
      unlock();
      return;
    }

    if (form) {
      form.addEventListener("submit", onSubmit);
      // focus after the entrance animation settles
      setTimeout(() => input && input.focus(), 900);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!input) return;
    setError(null);
    const password = input.value;
    if (!password) { input.focus(); return; }

    if (submitBtn) submitBtn.disabled = true;
    input.setAttribute("aria-busy", "true");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.ok) {
          storeToken(data.token);
          unlock();
          return;
        }
      }

      if (res.status === 401) {
        fail("Not quite, try again love.");
        return;
      }

      if (res.status === 500) {
        fail("The gatekeeper isn't set up yet. Add SITE_PASSWORD on Vercel (see README).");
        return;
      }

      fail("Something went wrong opening the gate. Try again.");
    } catch (err) {
      // Network error / file:// preview: allow a local preview-only bypass.
      if (location.protocol === "file:") {
        console.warn("[love] verify endpoint unreachable in local file preview — entering preview mode.");
        unlock();
        return;
      }
      fail("Couldn't reach the gate. Check your connection and try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      input.removeAttribute("aria-busy");
    }
  }

  function fail(msg) {
    setError(msg);
    input.value = "";
    input.focus();
    // retrigger shake animation
    if (errorEl) {
      errorEl.style.animation = "none";
      void errorEl.offsetWidth;
      errorEl.style.animation = "";
    }
  }

  function setError(msg) {
    if (!errorEl) return;
    if (!msg) { errorEl.hidden = true; errorEl.textContent = ""; return; }
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function unlock() {
    window.dispatchEvent(new CustomEvent("love:unlocked"));
  }

  // ---- token helpers (session-scoped, client-side expiry check) -------------
  function storeToken(token) {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (_) {}
  }
  function hasValidToken() {
    let token;
    try { token = sessionStorage.getItem(TOKEN_KEY); } catch (_) { return false; }
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[0]));
      return payload && typeof payload.exp === "number" && payload.exp > Date.now();
    } catch (_) { return false; }
  }

  window.Love = window.Love || {};
  window.Love.auth = { init };
})();

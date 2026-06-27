/* =============================================================================
   PASSWORD VERIFICATION (Vercel Serverless Function)
   -----------------------------------------------------------------------------
   The real password is NEVER shipped to the browser. It lives only in a Vercel
   environment variable named SITE_PASSWORD. This endpoint compares the
   submitted password to it and returns a short-lived signed token on success.

   Setup (one time):
     Vercel dashboard → Project → Settings → Environment Variables
       Name:  SITE_PASSWORD
       Value: <the secret you both know>
       Then redeploy.

   Local dev: create a `.env` file in the project root with
     SITE_PASSWORD=your-secret
   and run `vercel dev`.
   ========================================================================== */

// A tiny constant-time-ish string compare to avoid naive timing leaks.
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Lightweight token: base64 of payload + an HMAC-ish signature using a second
// secret (derived from SITE_PASSWORD + a salt). This is NOT bank-grade crypto;
// it's enough to confirm "the gate was opened" within a browsing session.
function makeToken(secret, minutes = 60 * 12) {
  const exp = Date.now() + minutes * 60 * 1000;
  const payload = JSON.stringify({ exp });
  const b64 = Buffer.from(payload).toString("base64");
  // djb2-style hash for a compact signature
  let h = 5381;
  const sigSrc = b64 + "|" + secret;
  for (let i = 0; i < sigSrc.length; i++) {
    h = ((h << 5) + h + sigSrc.charCodeAt(i)) >>> 0;
  }
  return `${b64}.${h.toString(36)}`;
}

module.exports = (req, res) => {
  // CORS / method guards (same-origin in practice, but kept permissive for dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const secret = process.env.SITE_PASSWORD;
  if (!secret) {
    res.status(500).json({
      ok: false,
      error: "SITE_PASSWORD is not configured on the server.",
    });
    return;
  }

  // Vercel's default body parser may hand us req.body already parsed (object
  // or string). Fall back to reading the raw stream for non-Vercel/Node usage.
  const handleParsed = (parsed) => {
    const submitted = typeof parsed.password === "string" ? parsed.password : "";
    if (safeEqual(submitted, secret)) {
      res.status(200).json({ ok: true, token: makeToken(secret) });
    } else {
      // Deliberately vague + a tiny delay to soften brute-force attempts.
      setTimeout(() => {
        res.status(401).json({ ok: false, error: "Not quite, try again love." });
      }, 600);
    }
  };

  if (req.body && typeof req.body === "object") {
    handleParsed(req.body);
    return;
  }
  if (typeof req.body === "string") {
    try { handleParsed(JSON.parse(req.body)); }
    catch { res.status(400).json({ ok: false, error: "Bad request" }); }
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    try { handleParsed(body ? JSON.parse(body) : {}); }
    catch { res.status(400).json({ ok: false, error: "Bad request" }); }
  });
};

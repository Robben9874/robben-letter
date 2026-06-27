# For Us — a private love site

A handcrafted, password-protected little universe for two: a twinkling night-sky
backdrop, your story as a timeline, a live countdown to the wedding, scattered
draggable polaroids, scratch-off secrets, and an Arabic love letter that unfolds
by candlelight.

Built with **plain HTML, CSS and JavaScript** — no frameworks, no build step.
The only server-side piece is a tiny Vercel function that checks the password
against an environment variable, so the secret never ships to the browser.

---

## Quick start

### 1. Run it locally

The password check needs the serverless function, so use Vercel's dev server:

```bash
npm i -g vercel      # once
cp .env.example .env # then edit .env and set SITE_PASSWORD=your-secret
vercel dev
```

Open the printed URL and enter the password you set.

> Opening `index.html` directly with `file://` will still let you preview the
> site (the gate falls back to a local preview mode when it can't reach the
> verify endpoint) — handy for tweaking styling, but the real password check
> only runs through `vercel dev` or a deployment.

### 2. Deploy to Vercel

```bash
vercel        # first-time link
vercel --prod
```

Then add the password as an environment variable:

**Vercel dashboard → your project → Settings → Environment Variables**

| Name           | Value             |
| -------------- | ----------------- |
| `SITE_PASSWORD`| the secret you both know |

Redeploy once after adding it. That's the only secret to set.

---

## Make it yours

Everything personalizable lives in **`js/config.js`** at the top of the file.
Missing values fall back to tasteful placeholders, so the site always looks
intentional even before it's filled in.

| Section        | What to edit                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `partnerA` / `partnerB` / `siteTitle` | Your names and the tab title.                                                          |
| `passwordHint` / `passwordPlaceholder` / `passwordSubtext` | The romantic prompt on the lock screen. The real password is the env var, not here.   |
| `weddingDate`  | `"YYYY-MM-DDTHH:MM:SS"` — drives the live countdown.                                                           |
| `weddingPlace` | A small caption under the countdown.                                                                          |
| `song.src`     | Path to an audio file (e.g. `"assets/our-song.mp3"`) **or** any URL. Empty `""` hides the music control.      |
| `song.autoplay`| `true` to start on unlock (browsers may still require a first interaction).                                    |
| `stars`        | `density` (more/fewer stars) and `shootingStarChance`.                                                        |
| `timeline`     | Your events in order: `{ date, title, text, icon }`.                                                            |
| `polaroids`    | `{ caption, image, tint, rotate }`. Leave `image: ""` for a soft on-theme placeholder.                          |
| `scratch`      | Hidden surprises: `type: "note" \| "joke" \| "photo"` with their content.                                       |
| `letter`       | The Arabic letter (`salutation`, `paragraphs[]`, `signoff`). Rendered right-to-left in the Amiri font.        |

### Adding real photos

Drop images into an `assets/` folder (or anywhere Vercel serves statically) and
point to them:

```js
polaroids: [
  { caption: "the first photo of us", image: "assets/first.jpg", tint: "rose", rotate: -7 },
  ...
],
scratch: [
  { type: "photo", label: "a hidden moment", caption: "the look you give me", image: "assets/secret.jpg" },
  ...
],
```

`assets/` is served as-is by Vercel. Git-ignore large files if you don't want
them in the repo.

### Adding the song

```js
song: { src: "assets/our-song.mp3", title: "Our Song", autoplay: true }
```

The discreet play/pause + mute control sits in the corner; music is muted by
default-friendly volume (0.55) and loops.

---

## File structure

```
.
├── index.html            # structure + section shells
├── css/
│   └── styles.css        # the whole night-garden design system
├── js/
│   ├── config.js         # ← EDIT THIS: all your content
│   ├── starfield.js      # canvas twinkling stars + shooting stars
│   ├── countdown.js      # live wedding countdown
│   ├── audio.js          # background song + controls
│   ├── timeline.js       # renders your events
│   ├── polaroids.js      # scattered, draggable photos
│   ├── scratch.js        # scratch-off cards (mouse, touch, keyboard)
│   ├── letter.js         # Arabic RTL letter that unfolds on scroll
│   ├── nav.js            # fixed blurred bottom navigation
│   ├── auth.js           # password gate (talks to /api/verify)
│   └── app.js            # orchestrator: boots everything, handles reveal
├── api/
│   └── verify.js         # Vercel function: checks SITE_PASSWORD, returns a token
├── vercel.json
├── .env.example
└── README.md
```

---

## How it works

- **Gate.** On load, a password screen covers everything. Submitting POSTs to
  `/api/verify`, which compares against `process.env.SITE_PASSWORD` and returns
  a short-lived token. The token is kept in `sessionStorage` so the gate stays
  open for the tab session. A correct password fades the gate away with a soft,
  dreamy entrance.
- **Stars.** A single fixed `<canvas>` draws warm-white / faint-gold stars that
  twinkle via `requestAnimationFrame`, with the occasional shooting star. It's
  DPR-aware, pauses when the tab is hidden, and respects
  `prefers-reduced-motion`.
- **Countdown.** Ticks every second to `weddingDate`, with a gentle glow in the
  final 24 hours and a "today we say forever" message on the day.
- **Timeline / Moments / Secrets / Letter.** Rendered from `config.js`. Each
  item uses `IntersectionObserver` (never scroll listeners) to reveal on entry.
- **Polaroids.** Scattered at slight angles, hover to straighten & float, drag
  to move. Positions are percentage-based (resize-safe) and remembered in
  `localStorage`, so they stay where you left them.
- **Scratch cards.** A canvas coating is erased with pointer events (mouse and
  touch). Past 50% scratched they fade open automatically. Keyboard users can
  focus a card and press **Enter** / **Space** to reveal it.
- **Letter.** Only this section flips to `dir="rtl"` with the Amiri font; the
  rest of the site stays English / LTR. It unfolds (rotateX + fade) when it
  scrolls into view.
- **Nav.** Fixed, blurred pill at the bottom. The active link follows the
  section crossing the middle of the viewport via `IntersectionObserver`.

## Accessibility & performance

- Semantic landmarks, labelled controls, keyboard-reachable scratch cards,
  focus moved into the experience after the gate opens.
- `prefers-reduced-motion` disables twinkling, hearts, the hero cue, and
  scroll-reveal motion (content shows immediately).
- `noindex, nofollow` so it stays off search engines.
- No frameworks, no dependencies — just static files plus one function.

## Tweaking the look

All design tokens (colors, fonts, spacing, glow) are CSS custom properties at
the top of `css/styles.css` under `:root`. Change the night-sky tones or the
rose-gold/gold accents there without hunting through the file.

Fonts are loaded from Google Fonts in `index.html`:
**Playfair Display** & **Instrument Serif** (serif headings),
**Hanken Grotesk** (body), **Caveat** (handwritten captions),
**Amiri** (Arabic letter). Swap any of them by editing the `<link>` and the
`--font-*` variables.

/* =============================================================================
   LOVE SITE — CONFIGURATION
   -----------------------------------------------------------------------------
   This is the ONLY file you need to edit to personalize the site.
   Every configurable piece of content lives here: names, password hint,
   wedding date, song, timeline, photos, scratch cards and the love letter.

   Missing values gracefully fall back to tasteful placeholders, so the site
   always looks intentional even before you fill it in.
   ========================================================================== */

const LOVE_CONFIG = {
  /* ---------------------------------------------------------------------------
     THE COUPLE
     Used in the hero title, footer and browser tab.
   --------------------------------------------------------------------------- */
  partnerA: "Ahmed",      // ← replace
  partnerB: "?",      // ← replace
  // Optional tab/footer override — leave blank to use "partnerA & partnerB".
  siteTitle: "",

  /* ---------------------------------------------------------------------------
     PASSWORD GATE
     The actual password is NEVER stored here — it lives in a Vercel
     environment variable named SITE_PASSWORD (see README). This is only the
     romantic hint shown on the lock screen.

     Hint idea: the date you first met. e.g. "Enter the date we first met 💕"
     and set SITE_PASSWORD to that date in DDMMYYYY or any format you both know.
  --------------------------------------------------------------------------- */
  passwordHint: "Enter the date we first met 💕",
  passwordPlaceholder: "dd/mm/yyyy",
  // Optional: an extra line of tenderness under the hint.
  passwordSubtext: "A little secret, just for us.",

  /* ---------------------------------------------------------------------------
     WEDDING DATE — drives the live countdown.
     Format: "YYYY-MM-DDTHH:MM:SS" (local time). January 2027 placeholder below.
   --------------------------------------------------------------------------- */
  weddingDate: "2027-01-01T22:00:00.000Z",
  weddingPlace: "under the winter stars", // ← optional caption under the countdown

  /* ---------------------------------------------------------------------------
     BACKGROUND SONG
     Path can be a local file in /assets or any absolute URL. Easily swappable.
     Set to "" to disable music entirely.
   --------------------------------------------------------------------------- */
  song: {
    src: "", // e.g. "assets/our-song.mp3" or "https://..."
    title: "Our Song",
    artist: "",
    autoplay: false, // browsers block autoplay until the user interacts; we start on first click after unlock
  },

  /* ---------------------------------------------------------------------------
     STAR FIELD
     Density tuning. Higher = more stars. Auto-scales with screen area.
   --------------------------------------------------------------------------- */
  stars: {
    density: 1,          // multiplier
    shootingStarChance: 0.002, // per-frame probability
  },

  /* ---------------------------------------------------------------------------
     TIMELINE — your story, in order.
     Each event: { date, title, text, icon }
     icon is an emoji or short symbol. Leave text "" for a clean look.
   --------------------------------------------------------------------------- */
  timeline: [
    {
      date: "Spring 2023",
      title: "Our First Date",
      text: "A quiet table, two nervous smiles, and the feeling that everything was about to begin.",
      icon: "☕",
    },
    {
      date: "Summer 2023",
      title: 'First "I love you"',
      text: "Said softly, late at night, when we both finally admitted what we already knew.",
      icon: "💌",
    },
    {
      date: "Autumn 2025",
      title: "The Engagement",
      text: "On one knee, under string lights, with a question we had been carrying for months.",
      icon: "💍",
    },
    {
      date: "January 2027",
      title: "The Wedding",
      text: "When two lives become one story. The day the countdown has been counting toward.",
      icon: "💍",
    },
  ],

  /* ---------------------------------------------------------------------------
     POLAROID GALLERY — "Moments"
     Scattered, draggable polaroids. Each: { caption, image, tint, rotate }
     - image: leave "" to use a soft on-theme gradient placeholder.
     - tint: one of "rose" | "gold" | "blush" | "cream" | "sky" (placeholder color)
     - rotate: degrees; leave null for a gentle random tilt
   --------------------------------------------------------------------------- */
  polaroids: [
    { caption: "the first photo of us", image: "", tint: "rose", rotate: -7 },
    { caption: "that rainy afternoon", image: "", tint: "sky", rotate: 5 },
    { caption: "you, mid-laugh", image: "", tint: "gold", rotate: -4 },
    { caption: "our little kitchen", image: "", tint: "cream", rotate: 8 },
    { caption: "the day you said yes", image: "", tint: "blush", rotate: -10 },
    { caption: "somewhere by the sea", image: "", tint: "sky", rotate: 6 },
  ],

  /* ---------------------------------------------------------------------------
     SCRATCH CARDS — "Secrets"
     Hidden surprises revealed by scratching. Each: { type, ...payload, label }
     type: "photo" | "note" | "joke"
       - photo: { image, caption }  (image "" → placeholder)
       - note:  { heading, body }
       - joke:  { heading, body }   (inside jokes)
     label: small hint printed on the card's corner.
   --------------------------------------------------------------------------- */
  scratch: [
    {
      type: "note",
      label: "a whisper",
      heading: "The real first impression",
      body: "I knew it the moment you laughed at my terrible joke. I was already gone.",
    },
    {
      type: "joke",
      label: "inside joke",
      heading: "The great dumpling incident",
      body: "We still maintain it was an even split. History will judge us kindly.",
    },
    {
      type: "photo",
      label: "a hidden moment",
      caption: "the look you give me",
      image: "",
      tint: "gold",
    },
  ],

  /* ---------------------------------------------------------------------------
     LOVE LETTER — written in Arabic, rendered right-to-left.
     The rest of the site stays English / LTR. Only this section flips to RTL.
     Use \n\n for paragraph breaks.
   --------------------------------------------------------------------------- */
  letter: {
    salutation: "حبيبي،",            // ← "My love,"
    // Replace the lines below with your own letter.
    paragraphs: [
      "منذ أول لقاء، صار العالم أهدأ. كأن كل ضجيج الحياة كان ينتظر أن تأتي لتبدّده.",
      "أحببتك في التفاصيل الصغيرة: في ضحكتك حين لا تتوقعها، في طريقة حديثك عن الأشياء التي تحبها، في يدك حين تبحث عن يدي دون أن تنتبه.",
      "العدّ التنازلي للأيام لا يخيفني؛ هو فقط يذكّرني أن كل يوم يقرّبنا من لحظة نقول فيها: بقية العمر.",
      "اكتب لك هذه الكلمات كما أكتب وعدًا — أن أحبك كما تستحق، بصبرٍ وفرحٍ وضحكٍ في منتصف الليل.",
    ],
    signoff: "إلى الأبد،\nأنا",        // ← "Forever, me"
  },
};

// Expose globally for the other scripts.
window.LOVE_CONFIG = LOVE_CONFIG;

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
  partnerB: "Rana",      // ← replace
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
  passwordHint: "Enter the date we are get Engagement 💕",
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
    src: "./assets/song.mp3", // e.g. "assets/our-song.mp3" or "https://..."
    title: "Our Song",
    artist: "",
    autoplay: true, // browsers block autoplay until the user interacts; we start on first click after unlock
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
      date: "15/12/2020",
      title: "First Time We Meet",
      text: "اول ما شوفتك اتشديت ليكي معرفش حصلي ايه بس ساعتها ادركت اني مش عايز غيرك",
      icon: "♥️",
    },
    {
      date: "16/4/2021",
      title: 'First Time You Siad "I love you"',
      text: "كنا بنتكلم و ساعتها قولتلي انك بداتي تحبيني .",
      icon: "💌",
    },
    {
      date: "6/2/2026",
      title: "The Engagement",
      text: "هنا ادركت اني وصلت لحاجه بقالي سنين بحلم بيها .",
      icon: "💍",
    },
    {
      date: "??/1/2027",
      title: "The Wedding",
      text: "مستني اليوم ده يجي و تكوني ملكي و مش عايز اي حاجه تانيه من الدنيا . بحبك",
      icon: "👩‍❤️‍💋‍👨",
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
    { caption: "The first photo of us", image: "./assets/image.png", tint: "rose", rotate: -7 },
    { caption: "First Photo After We Started Dating.", image: "./assets/image2.jpg", tint: "sky", rotate: 5 },
    { caption: "I Look To My Moon", image: "./assets/image3.jpg", tint: "gold", rotate: -4 },
    { caption: "in the end it's She and i", image: "./assets/image4.jpg", tint: "cream", rotate: 8 },
    { caption: "Love you Forever", image: "./assets/image6.jpg", tint: "blush", rotate: -10 },
    { caption: "my greatest victories", image: "./assets/image5.png", tint: "sky", rotate: 6 },
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
      heading: "i will choose you forever",
      body: "عندي استعداد اعادي الكل عشان اوصلك و هختارك دايما ",
    },
    {
      type: "joke",
      label: "inside joke",
      heading: "You Are My Everything ",
      body: "انت مش حبيبتي بس انت كل حاجه بنسبالي اهلي و بنتي و حبيبتي و صحبتي ",
    },
    {
      type: "photo",
      label: "a hidden moment",
      caption: "the look you give me",
      image: "./assets/image7.jpg",
      tint: "gold",
    },
  ],

  /* ---------------------------------------------------------------------------
     LOVE LETTER — written in Arabic, rendered right-to-left.
     The rest of the site stays English / LTR. Only this section flips to RTL.
     Use \n\n for paragraph breaks.
   --------------------------------------------------------------------------- */
  letter: {
    salutation: "بنتي و حبيبتي",            // ← "My love,"
    // Replace the lines below with your own letter.
    paragraphs: [
      "عايز اقولك انك احسن حاجه حصلت في حياتي و بجد انا اكتر انسان محظوظ في الدنيا عشان بقيتي من نصيبي.",
      "بحبك من 6 سنين ونص و هفضل احبك طول عمري بنفس الطريقه و الشغف و مش هزهق ولا حبي هيقل ليكي",
      "واسف علي كل موقف دايقتك او زعلتك في اللي عايزك تبقي متاكده منو اني بحبك و مليش غيرك",
      "هتفضلي الاولوليه بنسبالي و هعمل كل حاجه اقدر عليها عشان اخليكي مبسوطه دايما يا عيوني",
    ],
    signoff: "بحبك\nحبيبك",        // ← "Forever, me"
  },
};

// Expose globally for the other scripts.
window.LOVE_CONFIG = LOVE_CONFIG;

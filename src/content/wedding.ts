/**
 * Everything guests read on the site lives in this file.
 *
 * Before sharing the link:
 *  1. Replace every name marked with a role (e.g. "Ninong's name") in `entourage`.
 *  2. Check the times in `schedule` and `startsAt` / `endsAt`.
 *  3. Check each `mapsQuery` in `venues` points the directions at the right building.
 *  4. Put your own prenup photos in /public/prenup and list them in `photos`.
 */

export type ScheduleItem = {
  time: string;
  /** Same moment as `time`, as an ISO string in Philippine time (UTC+8). */
  iso: string;
  title: string;
  detail: string;
  /** Which of the two places this happens at */
  place: "ceremony" | "reception";
};

export type Venue = {
  /** "The Ceremony" or "The Reception" */
  label: string;
  name: string;
  town: string;
  time: string;
  detail: string;
  /** What "Get directions" and "Open in Google Maps" point to: a place name, or exact coordinates like "7.12345,123.12345". */
  mapsQuery: string;
};

export type Pair = { left: string; right: string };

export type RolePair = { role: string; meaning: string } & Pair;

export type RoleGroup = { role: string; meaning: string; names: string[] };

/** One outfit in the dress code, with a photo of models wearing it. Photos live in /public/attire. */
export type Look = {
  role: string;
  description: string;
  /** Sample photos of this look, shown in the attire carousels */
  looks: GuestLook[];
};

/** A guest look in the attire carousels. Photos live in /public/attire. */
export type GuestLook = {
  caption: string;
  /** Shown above the caption, e.g. "Bridesmaids" */
  role?: string;
  photo: { src: string; width: number; height: number; alt: string; focus?: string };
};

/**
 * One photo. `shape` sets how much room it takes in the gallery:
 * "tall" for portrait photos, "wide" for landscape ones.
 */
export type Photo = { src: string; alt: string; shape?: "tall" | "wide" };

export const wedding = {
  couple: {
    groom: "Francis",
    bride: "Argelyn",
  },

  // The home page monogram. `join`: "&" (F & A) or "and" (F and A).
  // `line`: the fine gold line drawn across behind the join.
  // To compare without changing these, open the site with ?monogram=and or ?monogram=amp, and ?line=on or ?line=off.
  monogram: { join: "&" as "&" | "and", line: false },

  // Ceremony start and the end of the reception, in Philippine time (UTC+8).
  startsAt: "2027-01-30T13:00:00+08:00",
  endsAt: "2027-01-30T20:30:00+08:00",

  date: {
    weekday: "Saturday",
    month: "January",
    day: "30",
    year: "2027",
    long: "Saturday, January 30, 2027",
    short: "January 30, 2027",
    time: "1:00 in the afternoon",
    timeWords: "One o'clock in the afternoon",
  },

  // Wording on the invitation pages, in the order guests see them.
  invitation: {
    cordially: "You are cordially invited",
    beOurGuest: "Be our guest.",
    together: "Together with their families",
    joyfully: "Joyfully invite you to the celebration of their marriage",
  },

  // Placeholder photos from Unsplash, chosen so no faces are the focus. Replace them with your prenup photos:
  // put the files in /public/prenup and change the paths below (any size works; they're cropped to fit).
  photos: {
    // The photo on the "Together with their families" page
    invitation: { src: "/prenup/cover.jpg", alt: "The couple looking out from a balcony" },
    // The photo beside the thank-you note at the end
    closing: { src: "/prenup/closing.jpg", alt: "Her hand resting on his shoulder" },
    prenup: [
      { src: "/prenup/01.jpg", alt: "Watching the sunset together from a rooftop", shape: "tall" },
      { src: "/prenup/03.jpg", alt: "Two hands with wedding rings and flowers", shape: "wide" },
      { src: "/prenup/02.jpg", alt: "Walking hand in hand down a forest path", shape: "tall" },
      { src: "/prenup/04.jpg", alt: "Sitting together by the lake at golden hour", shape: "wide" },
      { src: "/prenup/05.jpg", alt: "Holding hands on the lawn", shape: "wide" },
      { src: "/prenup/06.jpg", alt: "Walking across the hills", shape: "wide" },
      { src: "/prenup/07.jpg", alt: "Hand in hand, her veil trailing behind", shape: "wide" },
      { src: "/prenup/08.jpg", alt: "Holding hands, close up", shape: "wide" },
    ] satisfies Photo[],
    // The auto-playing slideshow. Put these photos in /public/moments.
    moments: [
      { src: "/moments/m01.jpg", alt: "In the meadow, her veil catching the breeze" },
      { src: "/moments/m06.jpg", alt: "Close together in an open field" },
      { src: "/moments/m03.jpg", alt: "Holding hands on the mountain top" },
      { src: "/moments/m04.jpg", alt: "Laughing together with the bouquet" },
      { src: "/moments/m02.jpg", alt: "A quiet embrace by the water" },
      { src: "/moments/m05.jpg", alt: "Among the vineyard rows" },
      { src: "/moments/m07.jpg", alt: "The ring, slipped on" },
      { src: "/moments/m08.jpg", alt: "Wrapped in each other's arms" },
    ] satisfies Photo[],
  },

  // The note at the very end of the page.
  thankYou:
    "Thank you for being part of our journey. Your love and support mean the world to us. We can't wait to celebrate this new beginning with you.",

  // The wedding is at the church, then everyone goes on to the hotel for the reception.
  // For directions, the safest `mapsQuery` is the building's exact coordinates, e.g. "7.12345,123.12345"
  // (in Google Maps, right-click the building and click the numbers to copy them).
  venues: {
    ceremony: {
      label: "The Ceremony",
      name: "Malangas Catholic Church",
      town: "Malangas, Zamboanga Sibugay",
      time: "1:00 PM",
      detail: "Our wedding Mass begins at one o'clock. Please be seated by 12:30 so you're settled before the entourage walks in.",
      // The diocese lists the church in Malangas as Santo Niño Parish, but Google Maps doesn't find it by name,
      // so this points at the town until you paste in the church's coordinates.
      mapsQuery: "Malangas, Zamboanga Sibugay, Philippines",
    },
    reception: {
      label: "The Reception",
      name: "Malangas Budget Hotel",
      town: "Malangas, Zamboanga Sibugay",
      time: "3:30 PM",
      detail: "Right after the photos at the church, join us at the hotel for dinner, toasts and dancing.",
      // Google Maps has no listing named "Malangas Budget Hotel" (searching for it lands on a different hotel),
      // so this points at the town until you paste in the hotel's coordinates.
      mapsQuery: "Malangas, Zamboanga Sibugay, Philippines",
    },
  } satisfies Record<"ceremony" | "reception", Venue>,

  taglines: {
    closing: "Two hearts, one beautiful journey.",
    attire: "Formal but comfortable. Elegant in every shade.",
  },

  hashtag: "#FrancisAndArgelyn2027",

  rsvp: {
    deadline: "January 9, 2027",
    // Seats a guest can reply for when their link doesn't include ?seats=
    defaultSeats: 2,
  },

  schedule: [
    {
      time: "12:30 PM",
      iso: "2027-01-30T12:30:00+08:00",
      title: "Guests arrive",
      detail: "Find a seat in the church and settle in before the entourage walks in.",
      place: "ceremony",
    },
    {
      time: "1:00 PM",
      iso: "2027-01-30T13:00:00+08:00",
      title: "Wedding ceremony",
      detail: "Our wedding Mass, where Francis and Argelyn exchange their vows in front of the people they love most.",
      place: "ceremony",
    },
    {
      time: "2:30 PM",
      iso: "2027-01-30T14:30:00+08:00",
      title: "Photos at the church",
      detail: "Photos with family, sponsors and the entourage at the altar. Then we all head to the hotel.",
      place: "ceremony",
    },
    {
      time: "3:30 PM",
      iso: "2027-01-30T15:30:00+08:00",
      title: "Reception",
      detail: "Drinks and light bites as everyone arrives, then the newlyweds make their entrance.",
      place: "reception",
    },
    {
      time: "5:00 PM",
      iso: "2027-01-30T17:00:00+08:00",
      title: "Dinner and program",
      detail: "Dinner at the buffet, toasts from the people who know us best, and our first dance.",
      place: "reception",
    },
    {
      time: "8:00 PM",
      iso: "2027-01-30T20:00:00+08:00",
      title: "Last dance",
      detail: "One more song together before we say goodnight.",
      place: "reception",
    },
  ] satisfies ScheduleItem[],

  entourage: {
    parents: {
      groom: ["Groom's father", "Groom's mother"],
      bride: ["Bride's father", "Bride's mother"],
    },
    principalSponsors: [
      { left: "Ninong's name", right: "Ninang's name" },
      { left: "Ninong's name", right: "Ninang's name" },
      { left: "Ninong's name", right: "Ninang's name" },
      { left: "Ninong's name", right: "Ninang's name" },
      { left: "Ninong's name", right: "Ninang's name" },
      { left: "Ninong's name", right: "Ninang's name" },
    ] satisfies Pair[],
    bestMan: "Best man's name",
    maidOfHonor: "Maid of honor's name",
    secondarySponsors: [
      { role: "Candle", meaning: "To light our path", left: "Sponsor's name", right: "Sponsor's name" },
      { role: "Veil", meaning: "To clothe us as one", left: "Sponsor's name", right: "Sponsor's name" },
      { role: "Cord", meaning: "To bind us together", left: "Sponsor's name", right: "Sponsor's name" },
    ] satisfies RolePair[],
    groomsmen: ["Groomsman's name", "Groomsman's name", "Groomsman's name", "Groomsman's name"],
    bridesmaids: ["Bridesmaid's name", "Bridesmaid's name", "Bridesmaid's name", "Bridesmaid's name"],
    littleOnes: {
      left: [
        { role: "Ring bearer", meaning: "To carry our pledge", names: ["Ring bearer's name"] },
        { role: "Coin bearer", meaning: "To carry our treasure", names: ["Coin bearer's name"] },
      ],
      right: [
        { role: "Bible bearer", meaning: "To carry our guide", names: ["Bible bearer's name"] },
        {
          role: "Flower girls",
          meaning: "To scatter petals on our way",
          names: ["Flower girl's name", "Flower girl's name"],
        },
      ],
    } satisfies { left: RoleGroup[]; right: RoleGroup[] },
  },

  // The dress code, with photos of models in each look (in /public/attire).
  attire: {
    // The two colors guests are asked to wear. White is for the bride only.
    // Shown like satin swatches, with light catching one side, so the blue reads as blue and not black.
    palette: [
      {
        name: "Midnight blue",
        swatch: "radial-gradient(circle at 32% 28%, #5a72c4 0%, #2a438f 34%, #1a2c66 68%, #111f4c 100%)",
      },
      {
        name: "Champagne",
        swatch: "radial-gradient(circle at 32% 28%, #fbf0e1 0%, #e6cfb1 38%, #d2b48f 72%, #b8966f 100%)",
      },
    ],
    // Sample photos for each role, shown in a carousel that alternates between the two roles.
    // Photos from Unsplash, free to use: Asdrubal luna, Alexander Mass, Gabriel Ogulu, Luigi Estuye (LUCREATIVE),
    // Leila de Haan, Hardini Lestari, Andres Molina, Marius Muresan, Mihaela Claudia Puscas, Alfonso Scarpa,
    // sammy swae and Dmitry Rodionov.
    entourage: [
      {
        role: "Bridesmaids",
        description: "Elegant floor-length gowns in midnight blue, with simple, classic designs.",
        looks: [
          {
            caption: "Navy gown and bouquet",
            photo: {
              src: "/attire/bridesmaid-navy-bouquet.jpg",
              width: 1200,
              height: 1800,
              alt: "A bridesmaid in a floor-length navy gown holding a white bouquet",
            },
          },
          {
            caption: "Navy sequined gown",
            photo: {
              src: "/attire/bridesmaid-navy-sequin.jpg",
              width: 1200,
              height: 1500,
              alt: "A woman in a floor-length navy sequined gown, seen from behind",
            },
          },
          {
            caption: "Navy tulle gown",
            photo: {
              src: "/attire/bridesmaid-navy-tulle.jpg",
              width: 1200,
              height: 1795,
              alt: "A woman in a full navy tulle gown walking through a meadow",
            },
          },
        ],
      },
      {
        role: "Groomsmen",
        description: "Light gray suits with navy blue ties and white boutonnières.",
        looks: [
          {
            caption: "Light gray suit and tie",
            photo: {
              src: "/attire/groomsman-gray-tie.jpg",
              width: 1200,
              height: 1800,
              alt: "A man in a light gray suit straightening his tie in a garden",
            },
          },
          {
            caption: "Light gray suit",
            photo: {
              src: "/attire/groomsman-gray-suit.jpg",
              width: 1200,
              height: 1800,
              alt: "A man in a light gray suit walking past a black door",
            },
          },
          {
            caption: "Navy tie and pocket square",
            photo: {
              src: "/attire/groomsman-gray-detail.jpg",
              width: 960,
              height: 1600,
              alt: "Close-up of a light gray suit with a navy striped tie and a navy pocket square",
            },
          },
        ],
      },
    ] satisfies Look[],
    sponsors: [
      {
        role: "Maid of honor & secondary sponsors (ladies)",
        description: "Champagne or nude formal gowns: elegant, simple and coordinated.",
        looks: [
          {
            caption: "Champagne gowns",
            photo: {
              src: "/attire/sponsor-champagne-gowns.jpg",
              width: 1200,
              height: 2133,
              alt: "Women in champagne gowns gathered around the bride and her bouquet",
            },
          },
          {
            caption: "Champagne gown",
            photo: {
              src: "/attire/sponsor-champagne-gown.jpg",
              width: 1200,
              height: 2011,
              alt: "A woman in a fitted champagne gown with gold embroidery",
            },
          },
          {
            caption: "Nude strapless gown",
            photo: {
              src: "/attire/sponsor-tan-gown.jpg",
              width: 1200,
              height: 1800,
              alt: "A woman in a nude strapless gown standing by a fireplace",
            },
          },
        ],
      },
      {
        role: "Best man & secondary sponsors (gents)",
        description: "Navy blue suits or tuxedos with champagne accents, and a bow tie or necktie.",
        looks: [
          {
            caption: "Navy suit and bow tie",
            photo: {
              src: "/attire/sponsor-navy-bow-tie.jpg",
              width: 1200,
              height: 1800,
              alt: "A man in a navy suit and bow tie buttoning his jacket",
            },
          },
          {
            caption: "Navy tuxedo and boutonnière",
            photo: {
              src: "/attire/sponsor-navy-tux-room.jpg",
              width: 1054,
              height: 1756,
              alt: "A man in a navy double-breasted tuxedo with a bow tie and a white boutonnière",
            },
          },
          {
            caption: "Navy tuxedo and bow tie",
            photo: {
              src: "/attire/sponsor-navy-tux-wall.jpg",
              width: 801,
              height: 1335,
              alt: "A man in a navy tuxedo and bow tie leaning against a wooden wall",
            },
          },
        ],
      },
    ] satisfies Look[],
    guests: {
      men: [
        "Midnight blue or dark suit, or slacks and a blazer",
        "Light-colored dress shirt",
        "Midnight blue or champagne tie",
        "Dress shoes",
      ],
      women: ["Long or midi dress in midnight blue or champagne", "Simple accessories", "Dress shoes or heels"],
      // Guest looks in each color, shown as two auto-sliding carousels. Every photo is cropped to the same
      // tall frame; `focus` moves the crop when someone stands off-centre (default "50% 50%").
      // Photos from Unsplash, free to use: lhon karwan, Golf Modz, iKshana Productions, KASONGO BULOBO,
      // Debabrata Ghosh, Samson Balogun, Alexis Maxell, gabbiistudios, Mihaela Claudia Puscas,
      // ALIREZA Pandkhahi, Teodora Popa and MOHAMMAD AL JANNAT RAKIN.
      midnightBlue: [
        {
          caption: "Strapless navy gown",
          photo: {
            src: "/attire/guest-navy-strapless-gown.jpg",
            width: 1200,
            height: 1800,
            alt: "A woman in a strapless midnight blue gown in a garden",
          },
        },
        {
          caption: "Classic navy suit",
          photo: {
            src: "/attire/guest-navy-suit.jpg",
            width: 1200,
            height: 1800,
            alt: "A man in a navy blue suit and white shirt against a plain backdrop",
          },
        },
        {
          caption: "Embroidered navy gown",
          photo: {
            src: "/attire/guest-navy-embroidered-gown.jpg",
            width: 1200,
            height: 1799,
            alt: "A woman in a flowing midnight blue gown with silver embroidery",
          },
        },
        {
          caption: "Navy three-piece suit",
          photo: {
            src: "/attire/guest-navy-three-piece.jpg",
            width: 1200,
            height: 1800,
            alt: "A man in a navy three-piece suit and tie",
          },
        },
        {
          caption: "Navy V-neck gown",
          photo: {
            src: "/attire/guest-navy-v-neck-gown.jpg",
            width: 1200,
            height: 1710,
            alt: "A woman in a floor-length navy gown with a V neckline",
          },
        },
        {
          caption: "Navy double-breasted suit",
          photo: {
            src: "/attire/guest-navy-double-breasted.jpg",
            width: 1200,
            height: 1947,
            alt: "A man in a navy double-breasted suit against a grey backdrop",
          },
        },
      ] satisfies GuestLook[],
      champagne: [
        {
          caption: "Champagne maxi dress",
          photo: {
            src: "/attire/guest-champagne-maxi.jpg",
            width: 1200,
            height: 1800,
            alt: "A woman in a flowing champagne maxi dress",
            focus: "30% 50%",
          },
        },
        {
          caption: "Beige three-piece suit and bow tie",
          photo: {
            src: "/attire/guest-beige-three-piece.jpg",
            width: 1200,
            height: 1500,
            alt: "A man in a beige three-piece suit with a bow tie",
            focus: "44% 50%",
          },
        },
        {
          caption: "Champagne beaded gown",
          photo: {
            src: "/attire/guest-champagne-gown.jpg",
            width: 1200,
            height: 2134,
            alt: "A woman in a floor-length champagne beaded gown",
          },
        },
        {
          caption: "Beige double-breasted suit",
          photo: {
            src: "/attire/guest-beige-double-breasted.jpg",
            width: 1200,
            height: 2132,
            alt: "A man in a beige double-breasted suit",
          },
        },
        {
          caption: "Champagne fitted gown",
          photo: {
            src: "/attire/guest-champagne-field-gown.jpg",
            width: 1200,
            height: 1800,
            alt: "A woman in a fitted champagne gown standing in a field",
          },
        },
        {
          caption: "Beige suits",
          photo: {
            src: "/attire/guest-beige-suits-pair.jpg",
            width: 1200,
            height: 1800,
            alt: "Two men in beige suits in front of a marble staircase",
          },
        },
      ] satisfies GuestLook[],
    },
  },

  // Answers can use {hashtag}, {church}, {venue} (the reception) and {deadline}; they're filled in automatically.
  faqs: [
    {
      q: "What time should I arrive?",
      a: "Please be seated at {church} by 12:30 PM. The ceremony begins at 1:00 PM.",
    },
    {
      q: "Where is the reception?",
      a: "At {venue}, a short drive from the church. We'll all head there after the photos at the church, and the reception starts at 3:30 PM.",
    },
    {
      q: "Can I bring someone with me?",
      a: "We've saved a set number of seats for each invitation, and you'll see yours when you reply. If you'd like to bring someone else, please message us first.",
    },
    {
      q: "Can I take photos during the ceremony?",
      a: "We'd love you to be fully present for the vows, so please keep phones away during the Mass. At the reception, take as many as you like and tag them {hashtag}.",
    },
    {
      q: "Is there somewhere to stay nearby?",
      a: "The reception is at a hotel. If you're travelling from out of town, contact {venue} directly about rooms for the night.",
    },
    {
      q: "What if I can't make it?",
      a: "Please still send your reply by {deadline} so we can finalize the seating. We'll miss you.",
    },
  ],

  // Background music. It starts on its own where the browser allows, and otherwise the moment the guest
  // taps the seal. To use your own song, put an mp3 in /public/audio and change these, or set to null for none.
  // Canon in D: United States Air Force Band (Strolling Strings), public domain.
  music: { src: "/audio/canon-in-d.mp3", title: "Canon in D" } as null | { src: string; title: string },
};

export type Wedding = typeof wedding;

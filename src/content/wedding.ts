/**
 * Everything guests read on the site lives in this file.
 *
 * Before sharing the link:
 *  1. Replace every name marked with a role (e.g. "Ninong's name") in `entourage`.
 *  2. Check the times in `schedule` and `startsAt` / `endsAt`.
 *  3. Check `venue.mapsQuery` points the map at the right place.
 *  4. Put your own prenup photos in /public/prenup and list them in `photos`.
 */

export type ScheduleItem = {
  time: string;
  /** Same moment as `time`, as an ISO string in Philippine time (UTC+8). */
  iso: string;
  title: string;
  detail: string;
};

export type Pair = { left: string; right: string };

export type RolePair = { role: string; meaning: string } & Pair;

export type RoleGroup = { role: string; meaning: string; names: string[] };

export type Look = { role: string; description: string; colors: string[] };

export type GuestLook = { role: string; items: string[]; colors: string[] };

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

  // Ceremony start and the end of the reception, in Philippine time (UTC+8).
  startsAt: "2027-01-30T15:00:00+08:00",
  endsAt: "2027-01-30T21:30:00+08:00",

  date: {
    weekday: "Saturday",
    month: "January",
    day: "30",
    year: "2027",
    long: "Saturday, January 30, 2027",
    short: "January 30, 2027",
    time: "3:00 in the afternoon",
    timeWords: "Three o'clock in the afternoon",
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

  venue: {
    name: "Malangas Budget Hotel",
    town: "Malangas, Zamboanga Sibugay",
    detail: "The ceremony and the reception are both at the hotel, so once you arrive you're set for the whole day.",
    // What the map and "Get directions" point to. Google Maps has no listing named "Malangas Budget Hotel"
    // (searching for it lands on a different hotel), so this points at the town for now.
    // Replace it with the hotel's exact coordinates, e.g. "7.12345,123.12345" (in Google Maps,
    // right-click the building and click the numbers to copy them).
    mapsQuery: "Malangas, Zamboanga Sibugay, Philippines",
  },

  taglines: {
    closing: "Two hearts, one beautiful journey.",
    attire: "Formal but comfortable. Elegant in every shade of blue.",
  },

  hashtag: "#FrancisAndArgelyn2027",

  rsvp: {
    deadline: "January 9, 2027",
    // Seats a guest can reply for when their link doesn't include ?seats=
    defaultSeats: 2,
  },

  schedule: [
    {
      time: "2:30 PM",
      iso: "2027-01-30T14:30:00+08:00",
      title: "Guests arrive",
      detail: "Find your seat and settle in before the processional begins.",
    },
    {
      time: "3:00 PM",
      iso: "2027-01-30T15:00:00+08:00",
      title: "Wedding ceremony",
      detail: "Francis and Argelyn exchange their vows in front of the people they love most.",
    },
    {
      time: "4:30 PM",
      iso: "2027-01-30T16:30:00+08:00",
      title: "Photos and cocktails",
      detail: "Light bites and drinks while we take photos with family and the entourage.",
    },
    {
      time: "6:00 PM",
      iso: "2027-01-30T18:00:00+08:00",
      title: "Dinner and reception",
      detail: "Dinner at the buffet, toasts from the people who know us best, and our first dance.",
    },
    {
      time: "9:00 PM",
      iso: "2027-01-30T21:00:00+08:00",
      title: "Last dance",
      detail: "One more song together before we say goodnight.",
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

  attire: {
    // The colors of the day, shown as paint swatches.
    palette: [
      { name: "Midnight blue", hex: "#1B2A66" },
      { name: "Royal blue", hex: "#3F55B5" },
      { name: "Dusty blue", hex: "#8E9DCF" },
      { name: "Blush", hex: "#E7B7B4" },
    ],
    entourage: [
      {
        role: "Bridesmaids",
        description: "Floor-length gowns in midnight blue, simple and classic.",
        colors: ["#1B2A66"],
      },
      {
        role: "Groomsmen",
        description: "Light gray suits with navy blue ties and white boutonnières.",
        colors: ["#B9BDC4", "#1B2A66", "#F5F2EA"],
      },
    ] satisfies Look[],
    sponsors: [
      {
        role: "Ladies",
        description: "Formal gowns in dusty blue or blush, elegant, simple and coordinated.",
        colors: ["#8E9DCF", "#E7B7B4"],
      },
      {
        role: "Gentlemen",
        description: "Navy blue suits or a Barong Tagalog, with a navy or white necktie.",
        colors: ["#1B2A66", "#F5F2EA"],
      },
    ] satisfies Look[],
    guests: [
      {
        role: "Men",
        items: ["Suit with a tie, or a Barong Tagalog", "Dark or neutral colors", "Dress shoes"],
        colors: ["#1B2A66", "#3F55B5", "#F5F2EA"],
      },
      {
        role: "Women",
        items: [
          "Long or midi dress in midnight blue, royal blue, dusty blue or blush",
          "Simple accessories",
          "Dress shoes or heels",
        ],
        colors: ["#1B2A66", "#3F55B5", "#8E9DCF", "#E7B7B4"],
      },
    ] satisfies GuestLook[],
  },

  gifts:
    "Having you there is the gift we're most looking forward to. If you'd like to give something more, a monetary gift toward our first home together would mean a great deal. There will be a gift box at the reception.",

  // Answers can use {hashtag}, {venue} and {deadline}; they're filled in automatically.
  faqs: [
    {
      q: "What time should I arrive?",
      a: "Please be seated by 2:30 PM. The ceremony begins at 3:00 PM.",
    },
    {
      q: "Can I bring someone with me?",
      a: "We've saved a set number of seats for each invitation, and you'll see yours when you reply. If you'd like to bring someone else, please message us first.",
    },
    {
      q: "Can I take photos during the ceremony?",
      a: "We'd love you to be fully present for the vows, so please keep phones away during the ceremony. At the reception, take as many as you like and tag them {hashtag}.",
    },
    {
      q: "Is there somewhere to stay nearby?",
      a: "The venue is a hotel. If you're travelling from out of town, contact {venue} directly about rooms for the night.",
    },
    {
      q: "What if I can't make it?",
      a: "Please still send your reply by {deadline} so we can finalize the seating. We'll miss you.",
    },
  ],

  // Optional background music. Put an mp3 in /public/audio and set e.g.
  // { src: "/audio/our-song.mp3", title: "Our song" }. It starts when the envelope is opened.
  music: null as null | { src: string; title: string },
};

export type Wedding = typeof wedding;

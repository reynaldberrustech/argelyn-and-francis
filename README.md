# Francis & Argelyn — wedding invitation

A one-page wedding invitation for **Saturday, January 30, 2027**: the ceremony at **Malangas Catholic Church** at 1:00 PM, then the reception at **Malangas Budget Hotel**, Malangas, Zamboanga Sibugay. Midnight blue with champagne-gold calligraphy (Ephesis) and Cormorant Garamond, on fine navy linen: an embroidered lace envelope sealed in gold wax, gold line-drawn flowers that bloom as you scroll, and names that write themselves in by hand.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4 and Motion. Ready to deploy on Vercel.

## What's on the page

1. **Envelope**: navy lace with gold piping. Guests tap the gold wax seal, the four flaps fold open, petals drift down and an invitation card rises out: your names written in by hand, the date, time and venue (and the guest's name, from a personal link). **View the invitation** on the card opens the rest of the site.
2. **Monogram**: F, "and" and A written in by hand in gold, with flowers blooming from two corners.
3. **You are cordially invited**: be our guest, with a garland of flowers.
4. **Together with their families**: a photo framed with flowers, then the couple's names written in by hand.
5. **Save the Date**: the date, time, church and reception, a live countdown whose numbers roll as they change, and calendar buttons (Google, Apple and Outlook).
6. **Our Moments**: an auto-playing photo slideshow. It moves on every 5 seconds, pauses on hover or when scrolled away, and can be swiped or paused.
7. **Our Day**: the schedule, from arriving at the church to the last dance, with the place for each part.
8. **The Venues**: the church and the hotel, each with "Get directions" and "Open in Google Maps" buttons, and a tap-to-explore plan of the reception hall.
9. **Our Prenup**: a photo gallery. Tap a photo to see it full screen; swipe or use the arrow keys to move between them.
10. **Attire**: a lookbook with auto-sliding carousels of sample photos for every look (bridesmaids and groomsmen, sponsors, and guests in midnight blue and in champagne), what each role wears, and the two suggested colors.
11. **Entourage**: parents, sponsors, best man and maid of honor, groomsmen, bridesmaids and the little ones.
12. **Details**: answers to common questions.
13. **Kindly Reply**: a reply card that saves answers to a Google Sheet. Guests who are coming can also say who's coming with them and note any food allergies or diet needs.
14. **Thank you**: a note, a photo and the couple's sign-off, with the hashtag. Below it, a small **Couple login** link opens your private guest list (see [Your guest list](#your-guest-list-for-the-two-of-you)).

For guests who turn on "reduce motion" on their phone, the slideshow doesn't auto-play, petals don't fall, and everything appears without animation.

Every animation only moves and fades things (no blurs, no animated sizes), so the phone's graphics chip does the work and scrolling stays smooth. Photos drift gently as you scroll in Chrome, Edge and on Android; Safari and Firefox show them still. If you add an animation, keep to `opacity`, `transform`, `translate` and `scale` so the page stays smooth.

## Your prenup photos

The photos on the site now are placeholders from [Unsplash](https://unsplash.com/license), free to use. To use your own:

1. Put your photos in `public/prenup/` (JPG is best; any size works, they're cropped to fit).
2. In `src/content/wedding.ts`, under `photos`, change each `src` to your file name, for example `"/prenup/beach.jpg"`, and write a short `alt` describing the photo (screen readers read it aloud).
3. Mark portrait photos `shape: "tall"` and landscape photos `shape: "wide"`. You can add or remove as many as you like.
4. `photos.invitation` is the photo on the "Together with their families" page and `photos.closing` is the one beside the thank-you note.
5. The slideshow uses `photos.moments`. Put those photos in `public/moments/` and list them the same way; the `alt` text is shown as the caption under each photo.

Photos around 1600 pixels on the long side are plenty; Next.js resizes them for each screen.

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Change names, times and text

Everything guests read is in **`src/content/wedding.ts`**. Before you share the link:

- [ ] Replace the placeholder names in `entourage` (for example "Ninong's name" and "Groomsman's name"). Add or remove lines to match your entourage.
- [ ] Check the times in `schedule`, plus `startsAt` and `endsAt` (Philippine time, `+08:00`).
- [ ] Set `mapsQuery` for both places in `venues` to their exact coordinates. Google Maps finds neither the church (listed by the diocese as Santo Niño Parish) nor "Malangas Budget Hotel" by name, so both sets of directions point at the town of Malangas for now. In Google Maps, right-click the building, click the coordinates to copy them, and paste them in as `"7.xxxxx,123.xxxxx"`.
- [ ] Check `rsvp.deadline`, `hashtag` and `faqs`.

The reception hall plan in the Venues section follows the moodboard layout: stage, aisle, family tables, guest tables, buffet, photo booth and entrance. Edit `src/components/HallPlan.tsx` if the real room is different.

## Personal invitation links

Add `?to=` and `?seats=` to the link you send each guest:

```
https://your-site.vercel.app/?to=Tita%20Maria&seats=2
```

- The envelope shows "For Tita Maria".
- The RSVP card fills in the name and says "We've reserved 2 seats for you."
- The guest can reply for up to that many people.

Without `?seats=`, guests can reply for up to `rsvp.defaultSeats` (2). Each reply also records the name and seat count from the link, so you can spot changes.

## Save RSVPs to a Google Sheet

Replies are sent to a small Google Apps Script that adds a row to a sheet. The same script lets your guest list read the replies and save the tables and notes you add.

1. Create a Google Sheet, then open **Extensions → Apps Script**.
2. Replace the code with the following, choose your own secret, and save:

   ```js
   const SECRET = "choose-a-long-random-phrase";
   const SHEET_NAME = "RSVPs";

   // Column titles in the sheet, and what each one holds. You can reorder columns or add your own.
   const COLUMNS = [
     ["ID", "id"],
     ["Submitted", "submittedAt"],
     ["Name", "name"],
     ["Attending", "attending"],
     ["Guests", "guests"],
     ["Coming with", "companions"],
     ["Food needs", "dietary"],
     ["Phone or email", "contact"],
     ["Message", "message"],
     ["Invite name", "inviteName"],
     ["Seats offered", "seatsOffered"],
     ["Table", "table"],
     ["Notes", "notes"],
   ];

   function doPost(e) {
     let data;
     try {
       data = JSON.parse(e.postData.contents);
     } catch (err) {
       return reply({ ok: false, error: "bad request" });
     }
     if (!SECRET || data.secret !== SECRET) return reply({ ok: false, error: "bad secret" });

     const lock = LockService.getScriptLock();
     lock.waitLock(20000);
     try {
       const sheet = openSheet();
       if (data.action === "list") return reply({ ok: true, rows: listRows(sheet) });
       if (data.action === "update") return reply(updateRow(sheet, data.id, data.changes || {}));
       return reply(addRow(sheet, data));
     } finally {
       lock.releaseLock();
     }
   }

   // Finds the sheet and adds any missing column titles.
   function openSheet() {
     const book = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
     const header = headerRow(sheet);
     const missing = COLUMNS.map((c) => c[0]).filter((title) => header.indexOf(title) === -1);
     if (missing.length) {
       sheet.getRange(1, header.length + 1, 1, missing.length).setValues([missing]);
       sheet.setFrozenRows(1);
     }
     return sheet;
   }

   function headerRow(sheet) {
     if (!sheet.getLastRow() || !sheet.getLastColumn()) return [];
     return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
   }

   function columnIndex(sheet) {
     const header = headerRow(sheet);
     const index = { width: header.length };
     COLUMNS.forEach(([title, field]) => (index[field] = header.indexOf(title)));
     return index;
   }

   function addRow(sheet, data) {
     const index = columnIndex(sheet);
     const values = Object.assign({}, data, { id: Utilities.getUuid(), table: "", notes: "" });
     const row = new Array(index.width).fill("");
     COLUMNS.forEach(([, field]) => {
       if (index[field] >= 0 && values[field] !== undefined) row[index[field]] = safe(values[field]);
     });
     // Plain text, so phone numbers keep their leading 0 and nothing turns into a date.
     sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setNumberFormat("@").setValues([row]);
     return { ok: true, id: values.id };
   }

   function listRows(sheet) {
     const last = sheet.getLastRow();
     if (last < 2) return [];
     const index = columnIndex(sheet);
     const values = sheet.getRange(2, 1, last - 1, index.width).getValues();
     const rows = [];
     values.forEach((row, i) => {
       if (!row[index.name]) return;
       if (!row[index.id]) {
         // Rows typed in by hand get an ID so their table and notes can be saved.
         row[index.id] = Utilities.getUuid();
         sheet.getRange(i + 2, index.id + 1).setValue(row[index.id]);
       }
       const item = {};
       COLUMNS.forEach(([, field]) => {
         const v = index[field] >= 0 ? row[index[field]] : "";
         item[field] = v instanceof Date ? v.toISOString() : v;
       });
       rows.push(item);
     });
     return rows;
   }

   function updateRow(sheet, id, changes) {
     const last = sheet.getLastRow();
     if (!id || last < 2) return { ok: false, error: "not found" };
     const index = columnIndex(sheet);
     const ids = sheet.getRange(2, index.id + 1, last - 1, 1).getValues().map((r) => String(r[0]));
     const at = ids.indexOf(String(id));
     if (at === -1) return { ok: false, error: "not found" };
     ["table", "notes"].forEach((field) => {
       if (typeof changes[field] === "string") {
         sheet.getRange(at + 2, index[field] + 1).setNumberFormat("@").setValue(safe(changes[field].slice(0, 500)));
       }
     });
     return { ok: true };
   }

   // A leading apostrophe stops text like "=..." being treated as a formula.
   function safe(v) {
     return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
   }

   function reply(body) {
     return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy → New deployment**, choose **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy** and copy the web app URL. The secret keeps everyone else out: without it, the script refuses to add, list or change anything.
4. Add the environment variables (in `.env.local` for local testing, and in Vercel for the live site):

   ```
   RSVP_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   RSVP_WEBHOOK_SECRET=choose-a-long-random-phrase
   COUPLE_PASSWORD=a-few-words-only-you-two-know
   RSVP_SHEET_URL=https://docs.google.com/spreadsheets/d/XXXX/edit
   ```

   `RSVP_SHEET_URL` is optional; it adds an "Open the Google Sheet" button to your guest list.

**Already set up the sheet with an older version of this script?** Paste in the new code, then click **Deploy → Manage deployments**, edit your deployment, choose **Version: New version** and click **Deploy**. The URL stays the same, and the new columns (ID, Coming with, Food needs, Table, Notes) are added to your sheet on their own.

Until `RSVP_WEBHOOK_URL` is set, the live site tells guests that online replies aren't switched on yet. During `npm run dev` without it, replies are saved to `.data/rsvps.json` on your computer so you can try the reply card and the guest list. Delete that file to start over.

## Your guest list (for the two of you)

At the very bottom of the invitation, under the hashtag, there's a small **Couple login** link. It opens a sign-in box; enter `COUPLE_PASSWORD` and you're taken to your guest list at `/guests`. Guests never see the list, and search engines are told not to index it.

On the guest list you can:

- See the headcount at a glance: guests coming, replies, who can't come, how many guests still need a table, tables used, and replies with food needs.
- Search by name, table, note, message or phone number, and filter to **Coming**, **Not coming**, **Need a table** or **Food needs**.
- Sort by guest, reply, number of guests, table or reply date.
- Type a table number straight into the **Table** column and press Enter. It's saved to the sheet.
- Select a name to see everything that guest sent, and add private notes.
- **Download CSV** (opens in Excel or Google Sheets) or **Print** the list you're looking at, for the caterer, the coordinator or the door.

Each guest's row shows who's coming with them, their food needs, their phone or email (tap to call or write), their message, the name and seats from their personal link, and when they replied. Replies that arrived since your last visit are marked **New**. If someone replies twice, only their latest reply is counted; it's marked **Changed reply**, and you can still see the earlier one.

Sign-in lasts 30 days on each phone or computer, and **Sign out** ends it on that device. To sign out everywhere at once, change `COUPLE_PASSWORD` in Vercel and redeploy. Use at least 8 characters; a few words strung together is easy to remember and hard to guess. After 8 wrong tries, sign-in pauses for 15 minutes.

For local testing, set `COUPLE_PASSWORD` in `.env.local` (it's never committed). Use a different password for the live site.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository. The default settings work as they are.
3. Under **Settings → Environment Variables**, add `RSVP_WEBHOOK_URL`, `RSVP_WEBHOOK_SECRET` and `COUPLE_PASSWORD` (and `RSVP_SHEET_URL` if you like), then redeploy.
4. Optional: if you use a custom domain, also set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` so link previews use it.

## Background music

The site plays a piano cover of *You to Me Are Everything* by The Real Thing (`public/audio/you-to-me-are-everything.mp3`, compressed to 128 kbps so it loads quickly on phones). It fades in gently, loops, and pauses while the guest is in another tab. A small button in the corner lets them pause it, and it stays paused.

Phones and most browsers don't allow a page to play sound until the visitor taps something, so on most devices the music starts the moment the guest taps the wax seal. Where the browser allows it, it starts as soon as the page opens.

To use your own song, put an mp3 in `public/audio/` and change `music` in `src/content/wedding.ts`:

```ts
music: { src: "/audio/our-song.mp3", title: "Our song" },
```

Keep it under about 5 MB (128 kbps is plenty) so it starts quickly on mobile data. Set `music: null` for no music.

## Attire photos

Every look in the lookbook is shown in an auto-sliding carousel of sample photos, all in the same tall arched frame:

- **Entourage**: bridesmaids in midnight blue gowns and groomsmen in light gray suits, taking turns.
- **Principal sponsors**: ladies in champagne or nude gowns and gents in navy suits or tuxedos with a bow tie, taking turns.
- **Guests**: one carousel of looks in midnight blue and one in champagne.

The photos in `public/attire/` are free photos from [Unsplash](https://unsplash.com/license) by Asdrubal luna, Alexander Mass, Gabriel Ogulu, Luigi Estuye (LUCREATIVE), Leila de Haan, Hardini Lestari, Andres Molina, Marius Muresan, Mihaela Claudia Puscas, Alfonso Scarpa, sammy swae, Dmitry Rodionov, lhon karwan, Golf Modz, iKshana Productions, KASONGO BULOBO, Debabrata Ghosh, Samson Balogun, Alexis Maxell, gabbiistudios, ALIREZA Pandkhahi, Teodora Popa and MOHAMMAD AL JANNAT RAKIN.

To change or add a look, put the photo in `public/attire/` and add it in `src/content/wedding.ts`:

- Entourage and sponsors: under that role's `looks` in `attire.entourage` or `attire.sponsors` (each role also has the `description` shown above its carousel).
- Guests: under `attire.guests.midnightBlue` or `attire.guests.champagne`.

Give each photo its `width`, `height`, `alt` and a short `caption`. Full-length portrait photos about 1200 pixels wide work best. If the person stands off-centre, add `focus` (for example `"30% 50%"`) to move the crop. Photos of your actual entourage in their outfits would be even better once you have them.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content/wedding.ts` | All names, dates, text and colors guests see |
| `src/components/` | One file per section |
| `src/app/globals.css` | Colors, type and layout |
| `src/app/api/rsvp/route.ts` | Receives RSVPs and saves them to the sheet |
| `src/lib/replies.ts` | Reads and writes replies (the Google Sheet, or `.data/rsvps.json` in development) |
| `src/lib/couple-session.ts` | The couple's password check and sign-in cookie |
| `src/app/guests/` | The guest list page and its sign-in, sign-out and save actions |
| `src/components/couple/` | The Couple login popup, the guest list, and one guest's details |
| `src/app/calendar.ics/route.ts` | Calendar file for Apple and Outlook |
| `src/app/opengraph-image.tsx` | The preview image shown when the link is shared |
| `src/lib/lettering.ts` | Turns the initials, names, "and" and "Save the Date" into calligraphy outlines (Ephesis) |
| `src/components/ScriptWord.tsx` | Draws a calligraphy word stroke by stroke |
| `src/lib/florals.ts` | Draws the gold line flowers in code |
| `src/components/Carousel.tsx` | The auto-playing photo slideshow |
| `public/moments/` | The slideshow photos |
| `public/attire/` | The lookbook photos of each look |
| `public/audio/` | The background music |
| `src/components/Attire.tsx` | The dress code lookbook |
| `src/components/LookCarousel.tsx` | The auto-sliding carousel of looks in the lookbook |
| `src/components/Venue.tsx` | The church and reception cards, with directions |
| `public/prenup/` | The prenup photos |
| `public/textures/lace.webp` | The embroidered lace on the envelope |
| `src/assets/fonts/` | Font files for the lettering and the preview image |

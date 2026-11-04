import { wedding } from "@/content/wedding";

export const weddingStart = new Date(wedding.startsAt);
export const weddingEnd = new Date(wedding.endsAt);

const eventTitle = `${wedding.couple.groom} & ${wedding.couple.bride}'s Wedding`;
const eventLocation = `${wedding.venue.name}, ${wedding.venue.town}`;
const eventDetails = `Ceremony at ${wedding.schedule[1]?.time ?? "3:00 PM"}, with dinner and dancing to follow.`;

/** 2027-01-30T07:00:00.000Z -> 20270130T070000Z */
function toCalendarStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${toCalendarStamp(weddingStart)}/${toCalendarStamp(weddingEnd)}`,
    details: eventDetails,
    location: eventLocation,
    ctz: "Asia/Manila",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function icsFile() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Francis and Argelyn//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:francis-argelyn-2027-01-30@wedding-invitation",
    // Fixed stamp keeps the file identical between builds.
    "DTSTAMP:20261104T000000Z",
    `DTSTART:${toCalendarStamp(weddingStart)}`,
    `DTEND:${toCalendarStamp(weddingEnd)}`,
    `SUMMARY:${escapeIcs(eventTitle)}`,
    `LOCATION:${escapeIcs(eventLocation)}`,
    `DESCRIPTION:${escapeIcs(eventDetails)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(`Tomorrow: ${eventTitle}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function mapsSearchUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venue.mapsQuery)}`;
}

export function mapsDirectionsUrl() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(wedding.venue.mapsQuery)}`;
}

export function mapsEmbedUrl() {
  return `https://maps.google.com/maps?q=${encodeURIComponent(wedding.venue.mapsQuery)}&z=15&output=embed`;
}

/** Fills {hashtag}, {venue} and {deadline} in FAQ answers. */
export function fillTokens(text: string) {
  return text
    .replaceAll("{hashtag}", wedding.hashtag)
    .replaceAll("{venue}", wedding.venue.name)
    .replaceAll("{deadline}", wedding.rsvp.deadline);
}

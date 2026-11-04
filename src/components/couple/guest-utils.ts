import type { Reply } from "@/lib/replies-shared";

/** A reply as shown in the guest list, with any earlier replies from the same person. */
export type Row = Reply & {
  /** False when the same person replied again later; the later reply is the one that counts. */
  isLatest: boolean;
  /** Earlier replies from this person (only on the latest one) */
  earlier: Reply[];
  /** When this person replied again (only on earlier replies) */
  replacedOn: string | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Philippine time has no daylight saving, so a fixed +8 hours is exact. Same result on server and phone. */
function inManila(iso: string) {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : new Date(time + 8 * 60 * 60 * 1000);
}

export function formatDay(iso: string) {
  const d = inManila(iso);
  return d ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}` : "";
}

export function formatTime(iso: string) {
  const d = inManila(iso);
  if (!d) return "";
  const h = d.getUTCHours();
  return `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** "Maria  Santos-Cruz" and "maria santos cruz" are the same guest. */
export function sameName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** A tappable link for a phone number or email, or null if it's neither. */
export function contactHref(contact: string) {
  const value = contact.trim();
  if (/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(value)) return `mailto:${value}`;
  const dialable = value.replace(/[^\d+]/g, "");
  return dialable.replace(/\D/g, "").length >= 7 ? `tel:${dialable}` : null;
}

/** Newest first. When someone replied more than once, only their latest reply counts. */
export function buildRows(replies: Reply[]): Row[] {
  const newestFirst = [...replies].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const byGuest = new Map<string, Reply[]>();
  for (const reply of newestFirst) {
    const key = sameName(reply.name) || reply.id;
    const group = byGuest.get(key);
    if (group) group.push(reply);
    else byGuest.set(key, [reply]);
  }
  return newestFirst.map((reply) => {
    const group = byGuest.get(sameName(reply.name) || reply.id) ?? [reply];
    const isLatest = group[0].id === reply.id;
    return {
      ...reply,
      isLatest,
      earlier: isLatest ? group.slice(1) : [],
      replacedOn: isLatest ? null : group[0].submittedAt,
    };
  });
}

export const CSV_COLUMNS: [string, (r: Row) => string | number][] = [
  ["Name", (r) => r.name],
  ["Reply", (r) => (r.attending === "yes" ? "Coming" : "Not coming")],
  ["Guests", (r) => r.guests],
  ["Seats offered", (r) => r.seatsOffered],
  ["Coming with", (r) => r.companions],
  ["Food needs", (r) => r.dietary],
  ["Table", (r) => r.table],
  ["Phone or email", (r) => r.contact],
  ["Message", (r) => r.message],
  ["Invited as", (r) => r.inviteName],
  ["Replied on", (r) => (r.submittedAt ? `${formatDay(r.submittedAt)} ${formatTime(r.submittedAt)}` : "")],
  ["Notes", (r) => r.notes],
  ["Earlier reply", (r) => (r.isLatest ? "" : "Yes")],
];

/** A spreadsheet-safe CSV (opens cleanly in Excel and Google Sheets). */
export function toCsv(rows: Row[]) {
  const cell = (value: string | number) => {
    let text = String(value ?? "");
    // Stop spreadsheet apps from running text that starts like a formula.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    CSV_COLUMNS.map(([title]) => cell(title)).join(","),
    ...rows.map((row) => CSV_COLUMNS.map(([, get]) => cell(get(row))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}

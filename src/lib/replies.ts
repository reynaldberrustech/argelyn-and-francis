import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { isCoupleSignedIn } from "./couple-session";
import { DETAIL_LIMITS, type GuestDetails, type NewReply, type Reply, type ReplySource } from "./replies-shared";

/**
 * Where RSVP replies live.
 *
 * - Live site: a Google Sheet, through the Apps Script web app at RSVP_WEBHOOK_URL (see README).
 * - `npm run dev` without RSVP_WEBHOOK_URL: a file on this computer, `.data/rsvps.json`,
 *   so the reply card and the guest list can be tried out locally.
 */

type Store =
  | { kind: "sheet"; url: string; secret: string }
  | { kind: "local"; file: string }
  | { kind: "none" };

function store(): Store {
  const url = process.env.RSVP_WEBHOOK_URL?.trim();
  if (url) return { kind: "sheet", url, secret: process.env.RSVP_WEBHOOK_SECRET ?? "" };
  if (process.env.NODE_ENV !== "production") {
    return { kind: "local", file: path.join(process.cwd(), ".data", "rsvps.json") };
  }
  return { kind: "none" };
}

export function replySource(): ReplySource {
  return store().kind;
}

export class RepliesNotConnected extends Error {
  constructor() {
    super("RSVP_WEBHOOK_URL is not set, so replies have nowhere to go.");
  }
}

/* ───────── Google Sheet (Apps Script) ───────── */

async function callSheet(
  s: Extract<Store, { kind: "sheet" }>,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(s.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, secret: s.secret }),
    signal: AbortSignal.timeout(15_000),
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`The Apps Script answered ${res.status}`);

  // Apps Script always answers 200, so check what it said.
  const answer: unknown = await res.json().catch(() => null);
  if (!answer || typeof answer !== "object") {
    throw new Error("The Apps Script didn't answer with JSON. Check it's deployed as a web app with access for Anyone.");
  }
  const a = answer as Record<string, unknown>;
  if (a.ok !== true) throw new Error(`The Apps Script refused: ${String(a.error ?? "no reason given")}`);
  return a;
}

/* ───────── Local file (development only) ───────── */

async function readLocal(file: string): Promise<Reply[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    return Array.isArray(parsed) ? parsed.map(toReply).filter((r): r is Reply => r !== null) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocal(file: string, replies: Reply[]) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, `${JSON.stringify(replies, null, 2)}\n`, "utf8");
  await rename(temp, file);
}

/* ───────── Cleaning what comes back ───────── */

const text = (value: unknown, max: number) => (value == null ? "" : String(value)).trim().slice(0, max);

function count(value: unknown, max: number) {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
}

/** Turns a row from the sheet (where anyone can edit cells by hand) into a tidy Reply, or null if it has no name. */
function toReply(raw: unknown): Reply | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = text(r.id, 64);
  const name = text(r.name, 120);
  if (!id || !name) return null;

  const answer = text(r.attending, 10).toLowerCase();
  const attending = answer === "yes" || answer === "true" ? "yes" : "no";
  const sent = new Date(text(r.submittedAt, 40));

  return {
    id,
    submittedAt: Number.isNaN(sent.getTime()) ? "" : sent.toISOString(),
    name,
    attending,
    guests: attending === "yes" ? Math.max(count(r.guests, 99), 1) : 0,
    companions: text(r.companions, 300),
    dietary: text(r.dietary, 300),
    contact: text(r.contact, 120),
    message: text(r.message, 1000),
    inviteName: text(r.inviteName, 60),
    seatsOffered: Math.max(count(r.seatsOffered, 99), 1),
    table: text(r.table, DETAIL_LIMITS.table),
    notes: text(r.notes, DETAIL_LIMITS.notes),
  };
}

/* ───────── What the rest of the site uses ───────── */

/** Saves a guest's reply. Throws RepliesNotConnected on a live site with no sheet set up. */
export async function addReply(reply: NewReply): Promise<{ id: string }> {
  const s = store();
  const record = { ...reply, submittedAt: new Date().toISOString() };

  if (s.kind === "sheet") {
    const answer = await callSheet(s, { action: "add", ...record });
    return { id: text(answer.id, 64) };
  }
  if (s.kind === "local") {
    const replies = await readLocal(s.file);
    const saved: Reply = { ...record, id: randomUUID(), table: "", notes: "" };
    await writeLocal(s.file, [...replies, saved]);
    console.info(`[rsvp] Saved a test reply from ${saved.name} to .data/rsvps.json`);
    return { id: saved.id };
  }
  throw new RepliesNotConnected();
}

export type GuestList =
  | { signedIn: false }
  | { signedIn: true; source: ReplySource; replies: Reply[]; error: string | null; loadedAt: string };

/**
 * Every reply, for the couple only. Checks the session itself, so it never
 * hands guest details to a request that isn't signed in.
 */
export async function getGuestList(): Promise<GuestList> {
  if (!(await isCoupleSignedIn())) return { signedIn: false };

  const s = store();
  const loadedAt = new Date().toISOString();
  if (s.kind === "none") return { signedIn: true, source: "none", replies: [], error: null, loadedAt };

  try {
    const rows =
      s.kind === "sheet"
        ? ((await callSheet(s, { action: "list" })).rows ?? null)
        : await readLocal(s.file);
    if (!Array.isArray(rows)) {
      throw new Error("The Apps Script didn't send a list of replies. Update it to the latest code in the README.");
    }
    const replies = rows.map(toReply).filter((r): r is Reply => r !== null);
    return { signedIn: true, source: s.kind, replies, error: null, loadedAt };
  } catch (error) {
    console.error("[guests] Could not load replies", error);
    return {
      signedIn: true,
      source: s.kind,
      replies: [],
      error: error instanceof Error ? error.message : "Unknown error",
      loadedAt,
    };
  }
}

/** Saves the table and notes the couple set for one reply. The caller must check the session first. */
export async function updateGuestDetails(id: string, changes: Partial<GuestDetails>) {
  const s = store();
  if (s.kind === "sheet") {
    await callSheet(s, { action: "update", id, changes });
    return;
  }
  if (s.kind === "local") {
    const replies = await readLocal(s.file);
    const at = replies.findIndex((r) => r.id === id);
    if (at === -1) throw new Error("That reply isn't in the list any more.");
    replies[at] = { ...replies[at], ...changes };
    await writeLocal(s.file, replies);
    return;
  }
  throw new RepliesNotConnected();
}

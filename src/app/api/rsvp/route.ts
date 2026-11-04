import { RepliesNotConnected, addReply } from "@/lib/replies";
import type { NewReply } from "@/lib/replies-shared";

/**
 * Receives RSVP replies and saves them to the Google Sheet
 * (or, during `npm run dev` without a sheet, to .data/rsvps.json; see README).
 */

type Parsed = { ok: true; reply: NewReply; isBot: boolean } | { ok: false; error: string };

const MAX_SEATS = 10;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parse(body: unknown): Parsed {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "We couldn't read your reply. Please try again." };
  }
  const b = body as Record<string, unknown>;

  const name = text(b.name, 80);
  if (name.length < 2) return { ok: false, error: "Please write your name so we know who's replying." };

  if (b.attending !== "yes" && b.attending !== "no") {
    return { ok: false, error: "Please let us know if you can come." };
  }

  const seatsOffered = Math.min(Math.max(Number(b.seatsOffered) || 1, 1), MAX_SEATS);
  let guests = 0;
  if (b.attending === "yes") {
    guests = Math.trunc(Number(b.guests));
    if (!Number.isFinite(guests) || guests < 1) guests = 1;
    if (guests > seatsOffered) {
      return { ok: false, error: `Your invitation has ${seatsOffered} seats. Please choose ${seatsOffered} or fewer.` };
    }
  }

  const coming = b.attending === "yes";
  return {
    ok: true,
    isBot: text(b.website, 200).length > 0,
    reply: {
      name,
      attending: b.attending,
      guests,
      companions: coming && guests > 1 ? text(b.companions, 200) : "",
      dietary: coming ? text(b.dietary, 200) : "",
      contact: text(b.contact, 120),
      message: text(b.message, 1000),
      inviteName: text(b.inviteName, 60),
      seatsOffered,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "We couldn't read your reply. Please try again." });
  }

  const parsed = parse(body);
  if (!parsed.ok) return json(400, { ok: false, error: parsed.error });

  // Pretend success so bots don't learn the trap exists.
  if (parsed.isBot) return json(200, { ok: true });

  try {
    await addReply(parsed.reply);
  } catch (error) {
    if (error instanceof RepliesNotConnected) {
      console.error("[rsvp] RSVP_WEBHOOK_URL is not set; a reply was rejected.");
      return json(503, {
        ok: false,
        error: "Online replies aren't switched on yet. Please message Francis or Argelyn directly.",
      });
    }
    console.error("[rsvp] Could not save reply for", parsed.reply.name, error);
    return json(502, {
      ok: false,
      error: "We couldn't save your reply just now. Please try again in a minute.",
    });
  }

  return json(200, { ok: true });
}

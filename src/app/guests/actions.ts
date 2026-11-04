"use server";

import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  HINT_COOKIE,
  MIN_PASSWORD_LENGTH,
  SESSION_COOKIE,
  createSessionToken,
  isCoupleSignedIn,
  passwordMatches,
  signInSetup,
} from "@/lib/couple-session";
import { updateGuestDetails } from "@/lib/replies";
import { DETAIL_LIMITS, type GuestDetails } from "@/lib/replies-shared";

export type SignInState = { error: string | null };

// Slows down password guessing. Kept per server instance, which is enough for one shared password.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRIES = 8;
const attempts = new Map<string, { failures: number; resetAt: number }>();

function clientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function forgetOldAttempts(now: number) {
  if (attempts.size < 500) return;
  for (const [ip, entry] of attempts) if (entry.resetAt < now) attempts.delete(ip);
}

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const setup = signInSetup();
  if (setup === "missing") {
    return { error: "Sign-in isn't set up yet. Add COUPLE_PASSWORD to the site's environment variables (see README)." };
  }
  if (setup === "too-short") {
    return { error: `COUPLE_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters. Choose a longer one (see README).` };
  }

  const ip = clientIp(await headers());
  const now = Date.now();
  forgetOldAttempts(now);
  let entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    entry = { failures: 0, resetAt: now + WINDOW_MS };
    attempts.set(ip, entry);
  }
  if (entry.failures >= MAX_TRIES) {
    const minutes = Math.max(1, Math.ceil((entry.resetAt - now) / 60_000));
    return { error: `Too many tries. Wait ${minutes} ${minutes === 1 ? "minute" : "minutes"}, then try again.` };
  }

  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!passwordMatches(password)) {
    entry.failures += 1;
    console.warn(`[couple] Wrong password from ${ip} (${entry.failures} of ${MAX_TRIES})`);
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { error: "That password isn't right. Check it and try again." };
  }

  attempts.delete(ip);
  const session = createSessionToken();
  const secure = process.env.NODE_ENV === "production";
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session.value, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: session.maxAge });
  jar.set(HINT_COOKIE, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: session.maxAge });
  console.info(`[couple] Signed in from ${ip}`);
  redirect("/guests");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(HINT_COOKIE);
  refresh();
}

export type SaveResult = { ok: true } | { ok: false; error: string };

/** Saves the table and private notes for one reply. */
export async function saveGuestDetails(id: unknown, changes: unknown): Promise<SaveResult> {
  if (!(await isCoupleSignedIn())) {
    return { ok: false, error: "You've been signed out. Sign in again to save changes." };
  }
  if (typeof id !== "string" || !id || id.length > 64 || !changes || typeof changes !== "object") {
    return { ok: false, error: "That change couldn't be read. Reload the page and try again." };
  }

  const clean: Partial<GuestDetails> = {};
  for (const field of Object.keys(DETAIL_LIMITS) as (keyof GuestDetails)[]) {
    const value = (changes as Record<string, unknown>)[field];
    if (typeof value === "string") clean[field] = value.trim().slice(0, DETAIL_LIMITS[field]);
  }
  if (!Object.keys(clean).length) return { ok: true };

  try {
    await updateGuestDetails(id, clean);
    return { ok: true };
  } catch (error) {
    console.error("[guests] Could not save details for", id, error);
    return { ok: false, error: "That change wasn't saved. Check your connection and try again." };
  }
}

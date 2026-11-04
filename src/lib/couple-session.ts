import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * The couple's sign-in: one shared password (COUPLE_PASSWORD) and a signed session cookie.
 *
 * The cookie holds an expiry time and an HMAC of it, keyed on the password, so changing
 * COUPLE_PASSWORD signs out every device at once. Sessions last 30 days.
 */

export const SESSION_COOKIE = "fa_couple";
/** Readable by the page so the footer can say "Guest list" instead of "Couple login". Grants nothing. */
export const HINT_COOKIE = "fa_couple_hint";

export const SESSION_DAYS = 30;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 8;

export type SignInSetup = "ready" | "missing" | "too-short";

function configuredPassword(): string | null {
  const password = process.env.COUPLE_PASSWORD?.trim();
  return password && password.length >= MIN_PASSWORD_LENGTH ? password : null;
}

export function signInSetup(): SignInSetup {
  const password = process.env.COUPLE_PASSWORD?.trim();
  if (!password) return "missing";
  return password.length < MIN_PASSWORD_LENGTH ? "too-short" : "ready";
}

const sha256 = (text: string) => createHash("sha256").update(text).digest();

function signature(password: string, payload: string) {
  return createHmac("sha256", sha256(`couple-session:${password}`)).update(payload).digest("base64url");
}

/** Constant-time check of a typed password against COUPLE_PASSWORD. */
export function passwordMatches(input: string): boolean {
  const password = configuredPassword();
  if (!password) return false;
  return timingSafeEqual(sha256(input.trim()), sha256(password));
}

export function createSessionToken(): { value: string; maxAge: number } {
  const password = configuredPassword();
  if (!password) throw new Error("COUPLE_PASSWORD is not set");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expires}`;
  return { value: `${payload}.${signature(password, payload)}`, maxAge: SESSION_SECONDS };
}

function verifySessionToken(token: string | undefined): boolean {
  const password = configuredPassword();
  if (!password || !token) return false;

  const [version, expiresText, given, ...rest] = token.split(".");
  if (version !== "v1" || !expiresText || !given || rest.length) return false;

  const expires = Number(expiresText);
  const now = Date.now() / 1000;
  if (!Number.isInteger(expires) || expires < now || expires > now + SESSION_SECONDS + 60) return false;

  const expected = Buffer.from(signature(password, `v1.${expiresText}`));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** True when this request carries a valid couple session. Reads cookies, so call it inside <Suspense>. */
export async function isCoupleSignedIn(): Promise<boolean> {
  const store = await cookies();
  // The expiry check reads the clock, so it must run per request, never in a prerender or prefetch.
  await connection();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { wedding } from "@/content/wedding";
import { FloralCorner } from "./Florals";
import { useInvite } from "./InviteProvider";
import { FlowerSprig } from "./Ornaments";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string; attending: boolean }
  | { kind: "error"; message: string };

type FieldErrors = { name?: string; attending?: string };

export function Rsvp() {
  const { guest } = useInvite();
  const seats = guest.seats ?? wedding.rsvp.defaultSeats;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [guestChoice, setGuestChoice] = useState<number | null>(null);
  const guestCount = Math.min(guestChoice ?? seats, seats);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const yesRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const nextErrors: FieldErrors = {};
    if (name.length < 2) nextErrors.name = "Please write your name so we know who's replying.";
    if (!attending) nextErrors.attending = "Please let us know if you can come.";
    setErrors(nextErrors);
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.attending) return yesRef.current?.focus();

    const payload = {
      name,
      attending,
      guests: attending === "yes" ? guestCount : 0,
      companions: attending === "yes" && guestCount > 1 ? String(form.get("companions") ?? "").trim() : "",
      dietary: attending === "yes" ? String(form.get("dietary") ?? "").trim() : "",
      contact: String(form.get("contact") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
      website: String(form.get("website") ?? ""),
      inviteName: guest.name ?? "",
      seatsOffered: seats,
    };

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "We couldn't send your reply. Please try again." });
        return;
      }
      setStatus({ kind: "sent", name, attending: attending === "yes" });
    } catch {
      setStatus({
        kind: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  return (
    <section id="rsvp" className="section section--rsvp" aria-labelledby="rsvp-title">
      <SectionHeading
        id="rsvp-title"
        title="Kindly reply"
        intro={`Please let us know by ${wedding.rsvp.deadline} so we can save your seat.`}
      />

      <Reveal className="place-card">
        <div className="reply-card">
          <FloralCorner corner="tl" variant={1} className="reply-card__floral reply-card__floral--tl" />
          <FloralCorner corner="br" variant={2} className="reply-card__floral reply-card__floral--br" />
          <AnimatePresence mode="wait" initial={false}>
            {status.kind === "sent" ? (
              <motion.div
                key="sent"
                className="reply-card__thanks"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                role="status"
              >
                <FlowerSprig className="reply-card__mark" />
                <h3>Thank you, {status.name}.</h3>
                <p>
                  {status.attending
                    ? `Your reply is saved. We can't wait to celebrate with you on ${wedding.date.short}.`
                    : "Your reply is saved. We'll miss you, and we're grateful you let us know."}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="reply-form"
                onSubmit={handleSubmit}
                noValidate
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <p className="reply-form__seats">
                  {seats === 1 ? "We've reserved a seat for you." : `We've reserved ${seats} seats for you.`}
                </p>

                <div className="field">
                  <label htmlFor="rsvp-name">Your name</label>
                  <input
                    ref={nameRef}
                    id="rsvp-name"
                    name="name"
                    autoComplete="name"
                    defaultValue={guest.name ?? ""}
                    key={guest.name ?? "no-guest"}
                    maxLength={80}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "rsvp-name-error" : undefined}
                  />
                  {errors.name ? (
                    <p id="rsvp-name-error" className="field__error">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <fieldset className="choice" aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}>
                  <legend>Will you be there?</legend>
                  <div className="choice__options">
                    <label className="choice__option">
                      <input
                        ref={yesRef}
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={attending === "yes"}
                        onChange={() => setAttending("yes")}
                      />
                      <span>Joyfully accepts</span>
                    </label>
                    <label className="choice__option">
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={attending === "no"}
                        onChange={() => setAttending("no")}
                      />
                      <span>Regretfully declines</span>
                    </label>
                  </div>
                  {errors.attending ? (
                    <p id="rsvp-attending-error" className="field__error">
                      {errors.attending}
                    </p>
                  ) : null}
                </fieldset>

                <AnimatePresence initial={false}>
                  {attending === "yes" && seats > 1 ? (
                    <motion.div
                      className="field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="rsvp-guests">How many of you are coming?</label>
                      <select
                        id="rsvp-guests"
                        name="guests"
                        value={guestCount}
                        onChange={(event) => setGuestChoice(Number(event.target.value))}
                      >
                        {Array.from({ length: seats }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n === 1 ? "Just me" : `${n} guests, including me`}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {attending === "yes" && guestCount > 1 ? (
                    <motion.div
                      key="companions"
                      className="field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="rsvp-companions">
                        Who&rsquo;s coming with you? <span className="field__optional">(optional)</span>
                      </label>
                      <input id="rsvp-companions" name="companions" maxLength={200} autoComplete="off" />
                      <p className="field__hint">Their names help us with seating and place cards.</p>
                    </motion.div>
                  ) : null}
                  {attending === "yes" ? (
                    <motion.div
                      key="dietary"
                      className="field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label htmlFor="rsvp-dietary">
                        Food allergies or diet needs <span className="field__optional">(optional)</span>
                      </label>
                      <input id="rsvp-dietary" name="dietary" maxLength={200} autoComplete="off" />
                      <p className="field__hint">For example: no pork, vegetarian, or a nut allergy.</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="field">
                  <label htmlFor="rsvp-contact">
                    Phone or email <span className="field__optional">(optional)</span>
                  </label>
                  <input id="rsvp-contact" name="contact" autoComplete="email" maxLength={120} />
                  <p className="field__hint">Only so we can reach you if plans change.</p>
                </div>

                <div className="field">
                  <label htmlFor="rsvp-message">
                    A note for the couple <span className="field__optional">(optional)</span>
                  </label>
                  <textarea id="rsvp-message" name="message" rows={3} maxLength={1000} />
                </div>

                {/* Hidden from people; bots tend to fill it in. */}
                <div className="reply-form__trap" aria-hidden="true">
                  <label htmlFor="rsvp-website">Website</label>
                  <input id="rsvp-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                {status.kind === "error" ? (
                  <p className="reply-form__error" role="alert">
                    {status.message}
                  </p>
                ) : null}

                <button type="submit" className="btn btn--ink" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? "Sending your reply…" : "Send my reply"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

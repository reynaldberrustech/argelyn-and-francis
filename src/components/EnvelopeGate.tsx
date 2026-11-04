"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useRef, useState } from "react";
import { wedding } from "@/content/wedding";
import type { Lettering } from "@/lib/lettering-types";
import { FloralCorner } from "./Florals";
import { useInvite } from "./InviteProvider";
import { Flourish, WaxSeal } from "./Ornaments";
import { ScriptWord } from "./ScriptWord";

// The card rises out of the envelope while the last flaps are still folding back.
const CARD_AT = 0.95;
// The names start writing once the card has settled.
const GROOM_AT = 1.55;
const AMP_AT = GROOM_AT + 0.85;
const BRIDE_AT = GROOM_AT + 1.15;
// Then the details and the button, so guests can go on while the bride's name finishes.
const DETAILS_AT = 2.3;
const FOCUS_BUTTON_MS = 3300;

const ease = [0.22, 1, 0.36, 1] as const;

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 70, scale: 0.94, rotateX: 10 },
  shown: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 1.3, delay: CARD_AT, ease } },
  leaving: { opacity: 0, y: -24, scale: 1.03, filter: "blur(6px)", transition: { duration: 0.7, ease } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: i, ease },
  }),
};

/** Gold piping along the two diagonal edges of a flap. Lines run from the corners to the centre. */
function Piping({ edges }: { edges: "top" | "bottom" }) {
  const y = edges === "top" ? 0 : 100;
  return (
    <svg className="flap__piping" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {[0, 100].map((x) => (
        <g key={x}>
          <line x1={x} y1={y} x2="50" y2="50" className="flap__cord" vectorEffect="non-scaling-stroke" />
          <line x1={x} y1={y} x2="50" y2="50" className="flap__cord-shine" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The opening screen: a lace envelope, sealed in gold wax.
 * Tapping the seal folds the flaps back and an invitation card rises out with the couple's details.
 * The button on the card opens the rest of the invitation.
 */
export function EnvelopeGate({ lettering }: { lettering: Lettering }) {
  const { opened, open, guest } = useInvite();
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  // Clicking the seal also counts as clicking the envelope; this keeps it to one open.
  const startedRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { groom, bride } = wedding.couple;
  const { date, venues, invitation } = wedding;

  function handleOpen() {
    if (startedRef.current) return;
    startedRef.current = true;
    setOpening(true);
    window.dispatchEvent(new Event("invitation:open"));
    // Keyboard and screen reader users land on the way forward once the card is up.
    window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), reduceMotion ? 300 : FOCUS_BUTTON_MS);
  }

  return (
    <AnimatePresence>
      {!opened ? (
        <motion.div
          key="envelope"
          className={`gate${opening ? " is-opening" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          onClick={handleOpen}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
        >
          <h2 id="gate-title" className="sr-only">
            Wedding invitation from {groom} and {bride}
          </h2>

          {/* The inside of the envelope, seen once the flaps fold back. */}
          <div className="gate__liner" aria-hidden="true" />

          <div className="flap flap--left">
            <span className="flap__paper" />
          </div>
          <div className="flap flap--right">
            <span className="flap__paper" />
          </div>
          <div className="flap flap--bottom">
            <span className="flap__paper" />
            <Piping edges="bottom" />
          </div>
          <div className="flap flap--top">
            <span className="flap__paper" />
            <Piping edges="top" />
          </div>

          <div className="gate__center">
            {guest.name ? <p className="gate__guest">For {guest.name}</p> : null}
            <button type="button" className="seal" onClick={handleOpen} disabled={opening} aria-label="Open invitation">
              <WaxSeal className="seal__wax" />
              <span className="seal__initials" aria-hidden="true">
                {groom.charAt(0)}
                <span className="seal__amp">&amp;</span>
                {bride.charAt(0)}
              </span>
            </button>
            <p className="gate__hint">Tap the seal to open</p>
          </div>

          {opening ? (
            <div className="gate__stage">
              <motion.article
                className="gate-card"
                aria-labelledby="gate-card-names"
                variants={cardVariants}
                initial="hidden"
                animate="shown"
                exit="leaving"
              >
                {/* Tucked behind the card, so they peek out from its corners. */}
                <FloralCorner corner="tl" variant={0} className="gate-card__floral gate-card__floral--tl" />
                <FloralCorner corner="br" variant={2} className="gate-card__floral gate-card__floral--br" />

                <div className="gate-card__paper">
                  <div className="gate-card__inner">
                    {guest.name ? (
                      <motion.p className="gate-card__guest" variants={lineVariants} custom={CARD_AT + 0.5} initial="hidden" animate="shown">
                        For {guest.name}
                      </motion.p>
                    ) : null}
                    <motion.p className="caps gate-card__together" variants={lineVariants} custom={CARD_AT + 0.6} initial="hidden" animate="shown">
                      {invitation.together}
                    </motion.p>

                    <h3 id="gate-card-names" className="gate-card__names">
                      <span className="sr-only">
                        {groom} and {bride}
                      </span>
                      <ScriptWord word={lettering.groom} play delay={GROOM_AT} className="gate-card__word gate-card__word--name" />
                      <ScriptWord word={lettering.amp} play delay={AMP_AT} className="gate-card__word gate-card__word--amp" />
                      <ScriptWord word={lettering.bride} play delay={BRIDE_AT} className="gate-card__word gate-card__word--name" />
                    </h3>

                    <motion.p className="gate-card__invite" variants={lineVariants} custom={DETAILS_AT} initial="hidden" animate="shown">
                      {invitation.joyfully}
                    </motion.p>

                    <motion.div variants={lineVariants} custom={DETAILS_AT + 0.15} initial="hidden" animate="shown">
                      <Flourish className="gate-card__flourish" />
                    </motion.div>

                    <motion.div
                      className="gate-card__details"
                      variants={lineVariants}
                      custom={DETAILS_AT + 0.3}
                      initial="hidden"
                      animate="shown"
                    >
                      <p className="caps gate-card__date">{date.long}</p>
                      <p className="gate-card__time">{date.timeWords}</p>
                      <p className="gate-card__venue">
                        <span>{venues.ceremony.name}</span>
                        <span>{venues.ceremony.town}</span>
                      </p>
                      <p className="gate-card__after">Reception to follow at {venues.reception.name}</p>
                    </motion.div>

                    <motion.div variants={lineVariants} custom={DETAILS_AT + 0.6} initial="hidden" animate="shown">
                      <button ref={buttonRef} type="button" className="btn btn--ink gate-card__button" onClick={open}>
                        View the invitation
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

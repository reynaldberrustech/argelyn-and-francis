"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { wedding } from "@/content/wedding";
import { useInvite } from "./InviteProvider";
import { WaxSeal } from "./Ornaments";

// The site starts revealing while the flaps are still folding back.
const REVEAL_AFTER_MS = 900;

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

/** The opening screen: a lace envelope, sealed in gold wax. Tapping the seal opens it. */
export function EnvelopeGate() {
  const { opened, open, guest } = useInvite();
  const [opening, setOpening] = useState(false);
  const reduceMotion = useReducedMotion();
  // Clicking the seal also counts as clicking the envelope; this keeps it to one open.
  const startedRef = useRef(false);
  const { groom, bride } = wedding.couple;

  function handleOpen() {
    if (startedRef.current) return;
    startedRef.current = true;
    setOpening(true);
    window.dispatchEvent(new Event("invitation:open"));
    window.setTimeout(open, reduceMotion ? 150 : REVEAL_AFTER_MS);
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
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <h2 id="gate-title" className="sr-only">
            Wedding invitation from {groom} and {bride}
          </h2>

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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

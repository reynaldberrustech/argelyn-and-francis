"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { ScriptWord as Word } from "@/lib/lettering-types";

const STEP = 0.12; // gap between letters starting
const DRAW = 0.9; // time to trace one letter
const PEN = [0.45, 0, 0.25, 1] as const;

type Props = {
  word: Word;
  /** true/false to control it, "in-view" to write when scrolled to */
  play?: boolean | "in-view";
  delay?: number;
  className?: string;
};

/** A script word that writes itself, letter by letter, like a pen on paper. */
export function ScriptWord({ word, play = "in-view", delay = 0, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion() === true;
  const active = play === "in-view" ? inView : play;

  return (
    <svg
      ref={ref}
      className={`script-word ${className ?? ""}`}
      viewBox={`${word.x} ${word.y} ${word.width} ${word.height}`}
      style={{ "--ratio": (word.width / word.height).toFixed(4) } as React.CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      {word.glyphs.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={{ pathLength: 0, fillOpacity: 0 }}
          animate={active ? { pathLength: 1, fillOpacity: 1 } : { pathLength: 0, fillOpacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  pathLength: { duration: DRAW, delay: delay + i * STEP, ease: PEN },
                  fillOpacity: { duration: 0.8, delay: delay + i * STEP + DRAW * 0.6, ease: "easeOut" },
                }
          }
        />
      ))}
    </svg>
  );
}

/** Seconds until a word finishes writing. */
export function writingTime(word: Word, delay = 0) {
  return delay + (word.glyphs.length - 1) * STEP + DRAW + 0.5;
}

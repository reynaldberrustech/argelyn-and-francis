"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useId, useRef } from "react";

const DRAW = [0.45, 0, 0.25, 1] as const;

/** Champagne-gold gradient for SVG strokes and fills. */
function GoldStops() {
  return (
    <>
      <stop offset="0%" stopColor="#F8DCB4" />
      <stop offset="50%" stopColor="#E3AF79" />
      <stop offset="100%" stopColor="#C38C57" />
    </>
  );
}

/**
 * A thin vertical gold rule with a dot and a small diamond on it,
 * like the lines above and below the monogram in the inspiration.
 */
export function GoldRule({ className, flip = false }: { className?: string; flip?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`gold-rule ${className ?? ""}`}
      viewBox="0 0 12 160"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="112">
          <stop offset="0%" stopColor="#E3AF79" stopOpacity="0" />
          <stop offset="35%" stopColor="#E3AF79" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E3AF79" />
        </linearGradient>
      </defs>
      <line
        x1="6"
        y1="0"
        x2="6"
        y2="112"
        stroke={`url(#${id}-fade)`}
        strokeWidth="1.1"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="6" cy="80" r="2.2" fill="#E3AF79" />
      <path
        d="M6 114 L10 122 L6 130 L2 122 Z"
        fill="none"
        stroke="#E3AF79"
        strokeWidth="1.1"
        vectorEffect="non-scaling-stroke"
      />
      <line x1="6" y1="130" x2="6" y2="150" stroke="#E3AF79" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      <circle cx="6" cy="155" r="2.4" fill="#E3AF79" />
    </svg>
  );
}

/** A horizontal gold line that is thickest in the middle and tapers to nothing at both ends. */
export function TaperedLine({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`tapered-line ${className ?? ""}`}
      viewBox="0 0 400 6"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E3AF79" stopOpacity="0" />
          <stop offset="50%" stopColor="#F2C995" />
          <stop offset="100%" stopColor="#E3AF79" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 3 Q200 1.2 400 3 Q200 4.8 0 3 Z" fill={`url(#${id}-g)`} />
    </svg>
  );
}

/** Tapered line with a small diamond in the centre, used under section titles. */
export function Flourish({ className }: { className?: string }) {
  return (
    <span className={`flourish ${className ?? ""}`} aria-hidden="true">
      <TaperedLine className="flourish__line" />
      <svg className="flourish__diamond" viewBox="0 0 12 12">
        <path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="none" stroke="#E3AF79" strokeWidth="1" />
        <circle cx="6" cy="6" r="1.5" fill="#E3AF79" />
      </svg>
      <TaperedLine className="flourish__line" />
    </span>
  );
}

// A single-line drawing of a flower stem with two leaves, like the one on the Save the Date card.
const SPRIG = [
  "M30 88 C30 72 31 56 30 38",
  "M30 72 C21 69 15 62 12 51 C20 54 27 60 30 67",
  "M30 61 C39 58 45 51 47 42 C40 45 34 50 30 56",
  "M30 38 C22 36 17 27 19 14 C23 20 27 23 30 25 C33 23 37 20 41 14 C43 27 38 36 30 38 Z",
  "M30 25 C28 19 28.5 11 30 6 C31.5 11 32 19 30 25",
  "M30 47 C34 44 37 40 38 34",
  "M38 34 C36 32 36 29 38 27 C40 29 40 32 38 34 Z",
];

/** The flower line drawing. Draws itself when it scrolls into view. */
export function FlowerSprig({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion() === true;
  const id = useId().replace(/:/g, "");
  return (
    <svg ref={ref} className={`sprig ${className ?? ""}`} viewBox="0 0 60 92" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <GoldStops />
        </linearGradient>
      </defs>
      {SPRIG.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={`url(#${id}-g)`}
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.4, delay: 0.2 + i * 0.18, ease: DRAW }}
        />
      ))}
    </svg>
  );
}

type Point = [number, number];

// An irregular, brushy blob: points around an ellipse, pushed in and out a little.
function blobPath(seed: number) {
  const points: Point[] = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const wobble = 1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.cos(a * 5 + seed * 2.3);
    points.push([50 + Math.cos(a) * 44 * wobble, 30 + Math.sin(a) * 20 * wobble]);
  }
  let d = "";
  for (let i = 0; i < count; i++) {
    const p0 = points[(i - 1 + count) % count];
    const p1 = points[i];
    const p2 = points[(i + 1) % count];
    const p3 = points[(i + 2) % count];
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) d += `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `;
    d += `C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return `${d}Z`;
}

/** A watercolor daub of paint, used for the color swatches. */
export function Daub({ color, seed = 1, className }: { color: string; seed?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`daub ${className ?? ""}`} viewBox="0 0 100 60" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${id}-edge`} x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
        </filter>
        <radialGradient id={`${id}-wash`} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-edge)`}>
        <path d={blobPath(seed)} fill={color} />
        <path d={blobPath(seed)} fill={`url(#${id}-wash)`} />
      </g>
    </svg>
  );
}

/** A gold wax seal with an irregular, poured edge. The initials sit on top as text. */
export function WaxSeal({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const points: string[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r = 56 + 2.4 * Math.sin(a * 5 + 1) + 1.6 * Math.sin(a * 9 + 2) + 1.2 * Math.cos(a * 13);
    points.push(`${(60 + Math.cos(a) * r).toFixed(1)} ${(60 + Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    <svg className={`wax ${className ?? ""}`} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-wax`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FCE6C2" />
          <stop offset="35%" stopColor="#E6B47C" />
          <stop offset="75%" stopColor="#B98149" />
          <stop offset="100%" stopColor="#8C5C2E" />
        </radialGradient>
        <radialGradient id={`${id}-well`} cx="0.6" cy="0.65" r="0.7">
          <stop offset="0%" stopColor="#E9B981" />
          <stop offset="100%" stopColor="#C8925A" />
        </radialGradient>
      </defs>
      <polygon points={points.join(" ")} fill={`url(#${id}-wax)`} />
      {/* Pressed centre where the stamp went in */}
      <circle cx="60" cy="60" r="40" fill={`url(#${id}-well)`} />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#8C5C2E" strokeOpacity="0.55" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="41.6" fill="none" stroke="#FFF1D8" strokeOpacity="0.55" strokeWidth="1" />
      <circle
        cx="60"
        cy="60"
        r="34"
        fill="none"
        stroke="#8C5C2E"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        strokeDasharray="1.5 2.5"
      />
    </svg>
  );
}

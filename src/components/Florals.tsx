"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { garland, spray, type Floral } from "@/lib/florals";

// Drawn once per page load; seeds keep them identical on the server and in the browser.
const CORNERS = [
  spray({ origin: [8, 8], angle: Math.PI / 4, spread: 1.25, reach: 300, seed: 3 }),
  spray({ origin: [8, 8], angle: Math.PI / 4, spread: 1.3, reach: 300, seed: 8 }),
  spray({ origin: [8, 8], angle: Math.PI / 4, spread: 1.2, reach: 300, seed: 14 }),
];
const GARLAND = garland({ center: [300, 60], reach: 250, seed: 4 });

function Art({ art }: { art: Floral }) {
  return (
    <>
      {art.fills.map((d, i) => (
        <path key={`f${i}`} d={d} className="floral__fill" />
      ))}
      {art.lines.map((d, i) => (
        <path key={`l${i}`} d={d} className="floral__line" vectorEffect="non-scaling-stroke" />
      ))}
      {art.dots.map((c, i) => (
        <circle key={`d${i}`} {...c} className="floral__dot" />
      ))}
    </>
  );
}

type Corner = "tl" | "tr" | "bl" | "br";

/** A spray of gold line-drawn flowers tucked into a corner. It blooms out from the corner when scrolled to. */
export function FloralCorner({
  corner = "tl",
  variant = 0,
  className,
}: {
  corner?: Corner;
  variant?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  return (
    <span
      ref={ref}
      className={`floral-corner floral-corner--${corner} ${className ?? ""}`}
      data-shown={inView ? "" : undefined}
      aria-hidden="true"
    >
      <svg className="floral-corner__art" viewBox="0 0 340 340" focusable="false">
        <Art art={CORNERS[variant % CORNERS.length]} />
      </svg>
    </span>
  );
}

/** A level garland of flowers, used as a divider. It opens out from the centre when scrolled to. */
export function FloralGarland({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  return (
    <span
      ref={ref}
      className={`floral-garland ${className ?? ""}`}
      data-shown={inView ? "" : undefined}
      aria-hidden="true"
    >
      <svg className="floral-garland__art" viewBox="0 0 600 120" focusable="false">
        <Art art={GARLAND} />
      </svg>
    </span>
  );
}

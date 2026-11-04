"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "h2" | "p" | "li";
  /** "rise": drifts up into view. "curtain": a photo opens from the bottom edge upward. */
  variant?: "rise" | "curtain";
};

/**
 * Brings content into view once, the first time it scrolls onto the screen.
 * The animation itself is a CSS transition on opacity and transform (see `.reveal` in globals.css),
 * so the browser runs it on the graphics card instead of redrawing the page every frame.
 */
export function Reveal({ children, className, delay = 0, as = "div", variant = "rise" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal reveal--${variant} ${className ?? ""}`}
      data-shown={shown ? "" : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

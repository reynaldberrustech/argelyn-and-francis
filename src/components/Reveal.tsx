"use client";

import { motion, type Target } from "motion/react";

const TAGS = { div: motion.div, h2: motion.h2, p: motion.p, li: motion.li };

const EASE = [0.22, 1, 0.36, 1] as const;

// "rise": text drifts up into focus. "curtain": a photo opens from the bottom edge upward.
const STYLES: Record<"rise" | "curtain", { from: Target; to: Target; duration: number }> = {
  rise: {
    from: { opacity: 0, y: 22, filter: "blur(8px)" },
    to: { opacity: 1, y: 0, filter: "blur(0px)" },
    duration: 1.1,
  },
  curtain: {
    from: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
    to: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
    duration: 1.3,
  },
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof typeof TAGS;
  variant?: keyof typeof STYLES;
};

/** Brings content into view once, the first time it scrolls onto the screen. */
export function Reveal({ children, className, delay = 0, as = "div", variant = "rise" }: RevealProps) {
  const Tag = TAGS[as];
  const style = STYLES[variant];
  return (
    <Tag
      className={className}
      initial={style.from}
      whileInView={style.to}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: style.duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/** The aisle running through the schedule; it fills with gold as you read down the day. */
export function ProgramSpine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="program-wrap">
      <span className="program-wrap__aisle" aria-hidden="true">
        <motion.span className="program-wrap__fill" style={{ scaleY }} />
      </span>
      {children}
    </div>
  );
}

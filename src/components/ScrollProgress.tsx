"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useInvite } from "./InviteProvider";

/** A hairline of gold across the top of the screen that grows as you read down the page. */
export function ScrollProgress() {
  const { opened } = useInvite();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  if (!opened) return null;
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

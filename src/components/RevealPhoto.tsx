"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Drift the photo slightly as the page scrolls */
  parallax?: boolean;
  children?: React.ReactNode;
};

/** A photo that opens from the centre and settles into place, then drifts gently as you scroll. */
export function RevealPhoto({ src, alt, sizes, className, parallax = true, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduceMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.div
      ref={ref}
      className={`reveal-photo ${className ?? ""}`}
      initial={{ clipPath: "inset(14% 10% 14% 10%)", opacity: 0 }}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 } : undefined}
      transition={{ duration: reduceMotion ? 0.3 : 1.5, ease: EASE }}
    >
      <motion.div className="reveal-photo__inner" style={parallax && !reduceMotion ? { y } : undefined}>
        <motion.div
          className="reveal-photo__zoom"
          initial={{ scale: 1.16 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <Image src={src} alt={alt} fill sizes={sizes} />
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  );
}

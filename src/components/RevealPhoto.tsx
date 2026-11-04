"use client";

import { useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Drift the photo slightly as the page scrolls */
  parallax?: boolean;
  children?: React.ReactNode;
};

/**
 * A photo that opens from the centre and settles into place, then drifts gently as you scroll.
 * All of it is CSS (see `.reveal-photo` in globals.css): the opening is a transition, and the drift
 * is tied to the scroll position by the browser itself, so no script runs while scrolling.
 */
export function RevealPhoto({ src, alt, sizes, className, parallax = true, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  return (
    <div
      ref={ref}
      className={`reveal-photo${parallax ? " reveal-photo--drift" : ""} ${className ?? ""}`}
      data-shown={shown ? "" : undefined}
    >
      <div className="reveal-photo__inner">
        <div className="reveal-photo__zoom">
          <Image src={src} alt={alt} fill sizes={sizes} />
        </div>
      </div>
      {children}
    </div>
  );
}

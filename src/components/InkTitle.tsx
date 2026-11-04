"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

type Props = {
  children: React.ReactNode;
  as?: "h2" | "h3" | "p";
  id?: string;
  className?: string;
};

/** Calligraphy text that appears left to right, as if the ink is being laid down, when it scrolls into view. */
export function InkTitle({ children, as: Tag = "h2", id, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <Tag ref={ref} id={id} className={`ink ${className ?? ""}`} data-shown={inView ? "" : undefined}>
      {children}
    </Tag>
  );
}

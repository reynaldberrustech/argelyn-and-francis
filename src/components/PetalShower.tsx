"use client";

import { useEffect, useState } from "react";

const COLORS = ["#e6b47f", "#f8dcb4", "#e7b7b4", "#f8f6f1", "#aab6ec"];
const COUNT = 34;
const LIFETIME_MS = 11_000;

type Petal = {
  id: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
};

/** A gentle shower of petals that falls once, right after the envelope is opened. */
export function PetalShower() {
  const [petals, setPetals] = useState<Petal[] | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setPetals(
        Array.from({ length: COUNT }, (_, id) => ({
          id,
          left: Math.random() * 100,
          size: 9 + Math.random() * 14,
          color: COLORS[id % COLORS.length],
          duration: 5.5 + Math.random() * 4,
          delay: 0.5 + Math.random() * 2.8,
          drift: (Math.random() - 0.5) * 160,
          spin: (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 420),
        })),
      );
      timer = window.setTimeout(() => setPetals(null), LIFETIME_MS);
    };
    window.addEventListener("invitation:open", start);
    return () => {
      window.removeEventListener("invitation:open", start);
      window.clearTimeout(timer);
    };
  }, []);

  if (!petals) return null;

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              "--size": `${p.size}px`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 28">
            <path d="M10 1 C17 7 19 17 10 27 C1 17 3 7 10 1 Z" fill={p.color} />
            <path d="M10 5 Q11 14 10 23" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none" />
          </svg>
        </span>
      ))}
    </div>
  );
}

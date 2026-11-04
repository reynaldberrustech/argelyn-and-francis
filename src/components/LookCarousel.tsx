"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { GuestLook } from "@/content/wedding";

const EVERY_MS = 3500;
// After a guest swipes, clicks or types, wait this long before moving on by itself.
const QUIET_AFTER_TOUCH_MS = 6000;

/** Scrolls the strip by one look, wrapping round at either end. */
function step(track: HTMLElement, direction: 1 | -1, smooth: boolean) {
  const slide = track.firstElementChild as HTMLElement | null;
  if (!slide) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const distance = slide.getBoundingClientRect().width + gap;
  const end = track.scrollWidth - track.clientWidth;
  const behavior = smooth ? "smooth" : "auto";
  if (direction === 1 && track.scrollLeft >= end - 4) track.scrollTo({ left: 0, behavior });
  else if (direction === -1 && track.scrollLeft <= 4) track.scrollTo({ left: end, behavior });
  else track.scrollBy({ left: direction * distance, behavior });
}

/**
 * A row of guest looks that slides along by itself, one look at a time.
 * It's a native scrolling strip, so swiping feels natural and the browser does the moving.
 * It waits while a guest hovers, focuses or touches it, and stops when scrolled out of view.
 */
export function LookCarousel({
  label,
  looks,
  showLabel = true,
  half = false,
}: {
  label: string;
  looks: GuestLook[];
  /** Show the label as a heading between gold rules (otherwise it is read out only) */
  showLabel?: boolean;
  /** Half the lookbook wide on large screens, showing two looks at a time */
  half?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const inView = useInView(rootRef, { margin: "0px 0px -15% 0px" });
  // Once a guest is getting close, load every look, so photos sliding in are already there.
  const nearby = useInView(rootRef, { once: true, margin: "800px 0px" });
  const reduceMotion = useReducedMotion() === true;
  const [paused, setPaused] = useState(false);
  const holding = useRef({ hover: false, focus: false, touchedAt: 0 });
  const id = useId();

  const autoplay = !reduceMotion && !paused;

  useEffect(() => {
    if (!autoplay || !inView) return;
    const timer = window.setInterval(() => {
      const hold = holding.current;
      if (hold.hover || hold.focus || Date.now() - hold.touchedAt < QUIET_AFTER_TOUCH_MS) return;
      if (trackRef.current) step(trackRef.current, 1, true);
    }, EVERY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, inView]);

  const touched = () => {
    holding.current.touchedAt = Date.now();
  };

  return (
    <div
      ref={rootRef}
      className={`look-carousel${half ? " look-carousel--half" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={`${id}-label`}
      onMouseEnter={() => (holding.current.hover = true)}
      onMouseLeave={() => (holding.current.hover = false)}
      onFocus={() => (holding.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) holding.current.focus = false;
      }}
    >
      <p id={`${id}-label`} className={showLabel ? "lookbook__shade" : "sr-only"}>
        {label}
      </p>

      <ul
        ref={trackRef}
        className="look-carousel__track"
        onPointerDown={touched}
        onWheel={touched}
        onTouchStart={touched}
      >
        {looks.map((look, i) => (
          <li
            key={look.photo.src}
            className="look-carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${looks.length}: ${look.role ? `${look.role}, ` : ""}${look.caption}`}
          >
            <figure>
              <div className="look-carousel__photo">
                <Image
                  src={look.photo.src}
                  width={look.photo.width}
                  height={look.photo.height}
                  alt={look.photo.alt}
                  sizes="(max-width: 600px) 46vw, (max-width: 900px) 31vw, 260px"
                  loading={nearby ? "eager" : "lazy"}
                  style={look.photo.focus ? { objectPosition: look.photo.focus } : undefined}
                />
              </div>
              <figcaption className="look-carousel__caption">
                {look.role ? <span className="look__role">{look.role}</span> : null}
                <span className="look__desc">{look.caption}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="look-carousel__controls">
        <button
          type="button"
          className="look-carousel__button"
          onClick={() => {
            touched();
            if (trackRef.current) step(trackRef.current, -1, !reduceMotion);
          }}
          aria-label={`Previous look, ${label.toLowerCase()}`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" />
          </svg>
        </button>
        {reduceMotion ? null : (
          <button
            type="button"
            className="look-carousel__button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? `Play the ${label.toLowerCase()} looks` : `Pause the ${label.toLowerCase()} looks`}
          >
            {paused ? (
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M7 5l8 5-8 5z" className="is-filled" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M7.5 5v10M12.5 5v10" />
              </svg>
            )}
          </button>
        )}
        <button
          type="button"
          className="look-carousel__button"
          onClick={() => {
            touched();
            if (trackRef.current) step(trackRef.current, 1, !reduceMotion);
          }}
          aria-label={`Next look, ${label.toLowerCase()}`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7.5 4.5L13 10l-5.5 5.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

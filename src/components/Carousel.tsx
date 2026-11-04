"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, type PanInfo } from "motion/react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { wedding } from "@/content/wedding";
import { SectionHeading } from "./SectionHeading";

const photos = wedding.photos.moments;
const COUNT = photos.length;
const INTERVAL_S = 5;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Where slide `i` sits relative to the current one, wrapping so the slideshow loops forever. */
function offsetOf(i: number, current: number) {
  let d = (i - current) % COUNT;
  if (d > COUNT / 2) d -= COUNT;
  if (d < -COUNT / 2) d += COUNT;
  return d;
}

/** An auto-playing slideshow of photos: the current one in front, its neighbours peeking either side. */
export function Carousel() {
  const [current, setCurrent] = useState(0);
  // Bumped whenever a slide changes, so the progress line restarts.
  const [cycle, setCycle] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggedRef = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const reduceMotion = useReducedMotion() === true;

  const autoplay = !reduceMotion && !userPaused;
  const running = autoplay && inView && !hovered && !focused && !dragging;

  const go = useCallback((step: number) => {
    setCurrent((c) => (c + step + COUNT) % COUNT);
    setCycle((n) => n + 1);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setCycle((n) => n + 1);
  }, []);

  function onDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    if (info.offset.x < -50 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
    // Let the click that ends a drag be ignored.
    window.setTimeout(() => (draggedRef.current = false), 0);
  }

  return (
    <section
      ref={ref}
      id="moments"
      className="section moments"
      aria-labelledby="moments-title"
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <SectionHeading id="moments-title" title="Our Moments" intro="A few more of our favorite photos." />

      <div
        className="carousel"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <motion.div
          className="carousel__track"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          dragSnapToOrigin
          onDragStart={() => {
            draggedRef.current = true;
            setDragging(true);
          }}
          onDragEnd={onDragEnd}
          aria-live={running ? "off" : "polite"}
        >
          {photos.map((photo, i) => {
            const offset = offsetOf(i, current);
            const distance = Math.abs(offset);
            const visible = distance <= 1;
            const isCurrent = offset === 0;
            return (
              <motion.div
                key={photo.src}
                className={`carousel__slide${isCurrent ? " is-current" : ""}${isCurrent && running ? " is-running" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${COUNT}`}
                aria-hidden={!isCurrent}
                initial={false}
                animate={{
                  x: `${offset * 82}%`,
                  scale: isCurrent ? 1 : 0.8,
                  opacity: isCurrent ? 1 : visible ? 0.42 : 0,
                }}
                transition={{ duration: distance > 1 ? 0 : 0.9, ease: EASE }}
                style={{ zIndex: 10 - distance, pointerEvents: visible ? "auto" : "none" }}
                onClick={() => {
                  if (draggedRef.current || isCurrent) return;
                  go(offset);
                }}
              >
                <span className="carousel__frame">
                  <Image
                    src={photo.src}
                    alt={isCurrent ? photo.alt : ""}
                    fill
                    sizes="(max-width: 760px) 82vw, 760px"
                    draggable={false}
                    loading={distance <= 1 ? "eager" : "lazy"}
                  />
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <button
          type="button"
          className="carousel__arrow carousel__arrow--prev"
          onClick={() => go(-1)}
          aria-label="Previous photo"
        >
          <span aria-hidden="true" />
        </button>
        <button
          type="button"
          className="carousel__arrow carousel__arrow--next"
          onClick={() => go(1)}
          aria-label="Next photo"
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <div className="carousel__bar">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={current}
            className="carousel__caption"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {photos[current].alt}
          </motion.p>
        </AnimatePresence>

        <div className="carousel__controls">
          <span className="caps carousel__count">
            {String(current + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
          </span>

          <span className="carousel__progress" aria-hidden="true">
            {autoplay ? (
              <span
                key={cycle}
                className="carousel__progress-fill"
                style={{ animationDuration: `${INTERVAL_S}s`, animationPlayState: running ? "running" : "paused" }}
                onAnimationEnd={() => go(1)}
              />
            ) : null}
          </span>

          {reduceMotion ? null : (
            <button
              type="button"
              className="carousel__pause"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            >
              <span className={userPaused ? "icon-play" : "icon-pause"} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="carousel__dots">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              className="carousel__dot"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

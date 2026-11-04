"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { wedding } from "@/content/wedding";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const photos = wedding.photos.prenup;
const subscribeNoop = () => () => {};

/** Full-screen view of one photo, with previous and next. */
function Lightbox({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (step: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);
  const photo = photos[index];

  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onMove]);

  return (
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) onMove(dx < 0 ? 1 : -1);
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={photo.src}
          className="lightbox__figure"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="lightbox__frame">
            <Image src={photo.src} alt={photo.alt} fill sizes="100vw" quality={80} />
          </span>
          <figcaption>
            <span className="lightbox__caption">{photo.alt}</span>
            <span className="caps lightbox__count">
              {index + 1} / {photos.length}
            </span>
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close photo">
        <span aria-hidden="true" />
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={(e) => {
          e.stopPropagation();
          onMove(-1);
        }}
        aria-label="Previous photo"
      >
        <span aria-hidden="true" />
      </button>
      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={(e) => {
          e.stopPropagation();
          onMove(1);
        }}
        aria-label="Next photo"
      >
        <span aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/** The prenup photos, in a gallery that opens each one full-screen. */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const openRef = useRef<number | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Closing puts focus back on the thumbnail of the photo that was showing.
  const close = useCallback(() => {
    const showing = openRef.current;
    setOpen(null);
    if (showing !== null) thumbs.current[showing]?.focus({ preventScroll: true });
  }, []);

  const move = useCallback((step: number) => {
    setOpen((current) => (current === null ? null : (current + step + photos.length) % photos.length));
  }, []);

  return (
    <section id="prenup" className="section" aria-labelledby="prenup-title">
      <SectionHeading id="prenup-title" title="Our Prenup" intro="A few of our favorite moments before the big day." />

      <ul className="gallery">
        {photos.map((photo, i) => (
          <Reveal
            as="li"
            key={photo.src}
            className={`gallery__item gallery__item--${photo.shape ?? "wide"}`}
            delay={(i % 4) * 0.12}
            variant="curtain"
          >
            <button
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              type="button"
              className="gallery__button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes={photo.shape === "tall" ? "(max-width: 760px) 50vw, 25vw" : "(max-width: 760px) 100vw, 50vw"}
              />
            </button>
          </Reveal>
        ))}
      </ul>

      {/* Rendered at the end of <body> so it sits above the navigation bar. */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open !== null ? <Lightbox key="lightbox" index={open} onClose={close} onMove={move} /> : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </section>
  );
}

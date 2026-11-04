"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { wedding } from "@/content/wedding";
import { useInvite } from "./InviteProvider";

const LINKS = [
  { id: "schedule", label: "Schedule" },
  { id: "venue", label: "Venue" },
  { id: "prenup", label: "Prenup" },
  { id: "attire", label: "Attire" },
  { id: "entourage", label: "Entourage" },
  { id: "notes", label: "Details" },
];

export function SiteNav() {
  const { opened } = useInvite();
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    setPastHero(y > window.innerHeight * 0.6);
  });

  // Highlight the section currently in the middle of the screen.
  useEffect(() => {
    const sections = [...LINKS.map((l) => l.id), "rsvp"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const visible = opened && (pastHero || menuOpen);

  return (
    <motion.header
      id="site-nav"
      className={`site-nav${visible ? " is-visible" : ""}`}
      inert={!visible}
      initial={false}
      animate={{ y: visible ? 0 : "-110%", opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-nav__bar">
        <a href="#top" className="site-nav__mark" onClick={() => setMenuOpen(false)}>
          <span className="site-nav__initials" aria-hidden="true">
            {wedding.couple.groom.charAt(0)}
            <span>&amp;</span>
            {wedding.couple.bride.charAt(0)}
          </span>
          <span className="sr-only">Back to top</span>
        </a>

        <nav aria-label="Sections" className="site-nav__links">
          {LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} aria-current={active === link.id ? "true" : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-nav__actions">
          <a href="#rsvp" className="btn btn--small" aria-current={active === "rsvp" ? "true" : undefined}>
            RSVP
          </a>
          <button
            type="button"
            className="site-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span className={`site-nav__burger${menuOpen ? " is-open" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="site-menu"
            aria-label="Sections"
            className="site-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {[...LINKS, { id: "rsvp", label: "RSVP" }].map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

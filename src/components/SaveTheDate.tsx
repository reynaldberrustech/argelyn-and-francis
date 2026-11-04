"use client";

import { AnimatePresence, motion } from "motion/react";
import { wedding } from "@/content/wedding";
import { googleCalendarUrl, weddingEnd, weddingStart } from "@/lib/calendar";
import type { Lettering } from "@/lib/lettering-types";
import { useNow } from "@/lib/useNow";
import { FlowerSprig } from "./Ornaments";
import { Reveal } from "./Reveal";
import { ScriptWord } from "./ScriptWord";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;
const calendarUrl = googleCalendarUrl();

/** A number that rolls up to its new value, like a split-flap clock. */
function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={text}
          className="roll__value"
          initial={{ y: "75%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-75%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Countdown() {
  const now = useNow();

  if (now !== null && now >= weddingStart.getTime()) {
    const over = now > weddingEnd.getTime();
    return (
      <p className="countdown__done">
        {over ? "Thank you for celebrating with us." : "Today's the day. We're getting married!"}
      </p>
    );
  }

  const ms = now === null ? null : weddingStart.getTime() - now;
  const units = [
    { label: "Days", value: ms === null ? null : Math.floor(ms / DAY) },
    { label: "Hours", value: ms === null ? null : Math.floor((ms % DAY) / HOUR) },
    { label: "Minutes", value: ms === null ? null : Math.floor((ms % HOUR) / MINUTE) },
    { label: "Seconds", value: ms === null ? null : Math.floor((ms % MINUTE) / 1000) },
  ];

  return (
    <dl className="countdown" aria-label="Time until the wedding">
      {units.map((u) => (
        <div key={u.label} className="countdown__unit">
          <dt className="caps">{u.label}</dt>
          <dd>
            <Roll text={u.value === null ? "–" : String(u.value).padStart(u.label === "Days" ? 1 : 2, "0")} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Save the Date: the date, the day, the time and place, and how long until then. */
export function SaveTheDate({ lettering }: { lettering: Lettering }) {
  const { date, venue } = wedding;
  return (
    <section id="countdown" className="section page page--save" aria-labelledby="save-title">
      <h2 id="save-title" className="save__script">
        <span className="sr-only">Save the date</span>
        <ScriptWord word={lettering.save} className="save__word save__word--save" />
        <ScriptWord word={lettering.the} delay={0.5} className="save__word save__word--the" />
        <ScriptWord word={lettering.date} delay={0.8} className="save__word save__word--date" />
      </h2>

      <Reveal delay={0.3}>
        <p className="save__date">
          {date.month} {date.day}, {date.year}
        </p>
      </Reveal>

      <FlowerSprig className="save__sprig" />

      <Reveal delay={0.2} className="save__details">
        <p className="script-title save__day">{date.weekday}</p>
        <p className="caps save__line">{date.timeWords}</p>
        <p className="caps save__line">At {venue.name}</p>
      </Reveal>

      <Reveal delay={0.2} className="save__countdown">
        <Countdown />
        <div className="save__actions">
          <a className="btn" href={calendarUrl} target="_blank" rel="noopener noreferrer">
            Add to Google Calendar
          </a>
          <a className="btn" href="/calendar.ics" download="francis-and-argelyn-wedding.ics">
            Save to Apple or Outlook
          </a>
        </div>
      </Reveal>
    </section>
  );
}

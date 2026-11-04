"use client";

import { motion, type Variants } from "motion/react";
import { useSyncExternalStore } from "react";
import { wedding } from "@/content/wedding";
import type { Lettering } from "@/lib/lettering-types";
import { FloralCorner } from "./Florals";
import { useInvite } from "./InviteProvider";
import { GoldRule, TaperedLine } from "./Ornaments";
import { ScriptWord, writingTime } from "./ScriptWord";

const EASE = [0.22, 1, 0.36, 1] as const;

// The monogram is written in order: F, then "&" (or "and"), then A.
const FIRST_AT = 0.7;
const AND_AT = 1.5;
const SECOND_AT = 2.1;

// ?monogram=and|amp and ?line=on|off preview the other options without changing the settings.
const subscribeNoop = () => () => {};
const readJoinPreview = () => new URLSearchParams(window.location.search).get("monogram");
const readLinePreview = () => new URLSearchParams(window.location.search).get("line");
const noPreview = () => null;

function grow(delay: number, axis: "x" | "y"): Variants {
  const transition = { duration: 1.4, delay, ease: EASE };
  return axis === "x"
    ? { hidden: { scaleX: 0, opacity: 0 }, shown: { scaleX: 1, opacity: 1, transition } }
    : { hidden: { scaleY: 0, opacity: 0 }, shown: { scaleY: 1, opacity: 1, transition } };
}

function rise(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 16 },
    shown: { opacity: 1, y: 0, transition: { duration: 1.2, delay, ease: EASE } },
  };
}

/** The monogram page: the couple's initials joined by "&" (or "and"), written in gold calligraphy, framed by flowers. */
export function Hero({ lettering }: { lettering: Lettering }) {
  const { opened } = useInvite();
  const { groom, bride } = wedding.couple;
  const joinPreview = useSyncExternalStore(subscribeNoop, readJoinPreview, noPreview);
  const linePreview = useSyncExternalStore(subscribeNoop, readLinePreview, noPreview);
  const useAmpersand = joinPreview === "amp" ? true : joinPreview === "and" ? false : wedding.monogram.join === "&";
  const showLine = linePreview === "on" ? true : linePreview === "off" ? false : wedding.monogram.line;
  const done = writingTime(lettering.second, SECOND_AT);

  return (
    <motion.section
      id="top"
      className="hero"
      initial="hidden"
      animate={opened ? "shown" : "hidden"}
      aria-labelledby="hero-title"
    >
      <h1 id="hero-title" className="sr-only">
        {groom} and {bride}, {wedding.date.long}
      </h1>

      {opened ? (
        <>
          <FloralCorner corner="tl" variant={0} className="hero__floral hero__floral--tl" />
          <FloralCorner corner="br" variant={1} className="hero__floral hero__floral--br" />
        </>
      ) : null}

      <div className="monogram" aria-hidden="true">
        <motion.span className="monogram__rule monogram__rule--top" variants={grow(0.2, "y")}>
          <GoldRule />
        </motion.span>
        <ScriptWord word={lettering.first} play={opened} delay={FIRST_AT} className="monogram__letter" />
        <span className="monogram__and">
          {showLine ? (
            <motion.span className="monogram__line" variants={grow(1.2, "x")}>
              <TaperedLine />
            </motion.span>
          ) : null}
          <ScriptWord
            key={useAmpersand ? "amp" : "and"}
            word={useAmpersand ? lettering.ampersand : lettering.and}
            play={opened}
            delay={AND_AT}
            className={`monogram__script${useAmpersand ? " monogram__script--amp" : ""}`}
          />
        </span>
        <ScriptWord word={lettering.second} play={opened} delay={SECOND_AT} className="monogram__letter" />
        <motion.span className="monogram__rule monogram__rule--bottom" variants={grow(done - 0.8, "y")}>
          <GoldRule flip />
        </motion.span>
      </div>

      <motion.a href="#invited" className="hero__cue" variants={rise(done)}>
        <span className="caps">{wedding.date.short}</span>
        <span className="hero__cue-line" aria-hidden="true" />
      </motion.a>
    </motion.section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useInvite } from "./InviteProvider";

const VOLUME = 0.55;
const FADE_MS = 2500;
// Events that count as the guest interacting, which lets the browser play sound.
const GESTURES = ["click", "keydown", "touchend", "pointerup"] as const;

/** Raises the volume gently instead of starting at full blast. */
function fadeIn(audio: HTMLAudioElement) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / FADE_MS, 1);
    audio.volume = VOLUME * t * t;
    if (t < 1 && !audio.paused) requestAnimationFrame(step);
  };
  audio.volume = 0;
  requestAnimationFrame(step);
}

/**
 * Background music. It starts on its own where the browser allows it, and otherwise at the guest's
 * first tap (usually the wax seal). A small button lets them pause it, and it stays paused after that.
 */
export function MusicToggle({ src, title }: { src: string; title: string }) {
  const { opened } = useInvite();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const pausedByGuest = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let started = false;
    let trying = false;

    const stopListening = () => {
      for (const g of GESTURES) window.removeEventListener(g, start);
      window.removeEventListener("invitation:open", start);
    };

    function start() {
      if (started || trying || pausedByGuest.current || !audio) return;
      trying = true;
      audio
        .play()
        .then(() => {
          started = true;
          fadeIn(audio);
          stopListening();
        })
        .catch(() => {
          // Not allowed yet: the next tap will try again.
        })
        .finally(() => {
          trying = false;
        });
    }

    // Try straight away; most phones will wait for the first tap instead.
    start();
    for (const g of GESTURES) window.addEventListener(g, start, { passive: true });
    window.addEventListener("invitation:open", start);

    // Pause while the guest is in another tab or app, and carry on when they come back.
    let resumeOnReturn = false;
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnReturn = !audio.paused;
        audio.pause();
      } else if (resumeOnReturn && !pausedByGuest.current) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopListening();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      pausedByGuest.current = false;
      audio
        .play()
        .then(() => fadeIn(audio))
        .catch(() => {});
    } else {
      pausedByGuest.current = true;
      audio.pause();
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {opened ? (
        <button
          type="button"
          className={`music${playing ? " is-playing" : ""}`}
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Pause the music (${title})` : `Play the music (${title})`}
        >
          <span className="music__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useInvite } from "./InviteProvider";

/** Plays the couple's song once the envelope is opened, with a button to pause it. */
export function MusicToggle({ src, title }: { src: string; title: string }) {
  const { opened } = useInvite();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // Browsers only allow sound after a tap, so start on the envelope's open click.
  useEffect(() => {
    const start = () => {
      audioRef.current
        ?.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };
    window.addEventListener("invitation:open", start);
    return () => window.removeEventListener("invitation:open", start);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      {opened ? (
        <button
          type="button"
          className={`music${playing ? " is-playing" : ""}`}
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
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

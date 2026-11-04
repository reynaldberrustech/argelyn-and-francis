"use client";

import { useEffect, useState } from "react";

export function CopyHashtag({ hashtag }: { hashtag: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(t);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hashtag);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="hashtag">
      <p className="hashtag__label">Share your photos with</p>
      <button type="button" className="hashtag__button" onClick={copy}>
        <span className="hashtag__tag">{hashtag}</span>
        <span className="hashtag__action" aria-live="polite">
          {state === "copied" ? "Copied" : state === "failed" ? "Select and copy it" : "Copy hashtag"}
        </span>
      </button>
    </div>
  );
}

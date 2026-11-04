"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Guest = {
  /** From ?to= in the invitation link, e.g. ?to=Tita%20Maria */
  name: string | null;
  /** From ?seats= in the invitation link */
  seats: number | null;
};

type InviteState = {
  opened: boolean;
  open: () => void;
  guest: Guest;
};

const InviteContext = createContext<InviteState | null>(null);

const subscribeNoop = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

function parseGuest(search: string): Guest {
  const params = new URLSearchParams(search);
  const rawName = params.get("to")?.trim().slice(0, 60);
  const rawSeats = Number.parseInt(params.get("seats") ?? "", 10);
  return {
    name: rawName ? rawName : null,
    seats: Number.isFinite(rawSeats) ? Math.min(Math.max(rawSeats, 1), 10) : null,
  };
}

export function InviteProvider({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const search = useSyncExternalStore(subscribeNoop, getSearch, getServerSearch);
  const guest = useMemo(() => parseGuest(search), [search]);
  const open = useCallback(() => setOpened(true), []);

  // Start every visit at the top, behind the sealed envelope.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // While sealed, the page behind the envelope can't scroll or take focus.
  useEffect(() => {
    document.documentElement.classList.toggle("is-sealed", !opened);
    for (const id of ["main", "site-footer"]) {
      document.getElementById(id)?.toggleAttribute("inert", !opened);
    }
  }, [opened]);

  const value = useMemo(() => ({ opened, open, guest }), [opened, open, guest]);

  return (
    <MotionConfig reducedMotion="user">
      <InviteContext.Provider value={value}>{children}</InviteContext.Provider>
    </MotionConfig>
  );
}

export function useInvite() {
  const ctx = useContext(InviteContext);
  if (!ctx) throw new Error("useInvite must be used inside <InviteProvider>");
  return ctx;
}

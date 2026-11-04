"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { SignInForm } from "./SignInForm";

const subscribeNoop = () => () => {};
// Set beside the real (unreadable) session cookie; it only changes the button's label.
const hasHint = () => /(?:^|;\s*)fa_couple_hint=1(?:;|$)/.test(document.cookie);

/** The couple's way in, at the very bottom of the invitation. Opens a sign-in popup. */
export function CoupleLogin() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const signedIn = useSyncExternalStore(subscribeNoop, hasHint, () => false);

  function show() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <div className="couple-login">
      {signedIn ? (
        <Link href="/guests" className="couple-login__button">
          <KeyIcon />
          Guest list
        </Link>
      ) : (
        <button type="button" className="couple-login__button" onClick={show} aria-haspopup="dialog">
          <KeyIcon />
          Couple login
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="login-dialog"
        aria-labelledby="login-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the dimmed backdrop closes it.
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="reply-card login-dialog__card">
          <button type="button" className="login-dialog__close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
          <h2 id="login-title" className="script-title login-dialog__title">
            For the couple
          </h2>
          <p className="login-dialog__intro">Sign in to see who has replied, plan the tables and download the list.</p>
          {/* Mounted only while open, so it starts empty each time and the password field takes focus. */}
          {open ? <SignInForm autoFocus /> : null}
        </div>
      </dialog>
    </div>
  );
}

function KeyIcon() {
  return (
    <svg className="couple-login__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="12" r="3.6" />
      <path d="M11.6 12H21M17.5 12v3M20.5 12v2.2" />
    </svg>
  );
}

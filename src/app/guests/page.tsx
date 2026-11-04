import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GuestList } from "@/components/couple/GuestList";
import { SignInForm } from "@/components/couple/SignInForm";
import { wedding } from "@/content/wedding";
import { getGuestList } from "@/lib/replies";

const { groom, bride } = wedding.couple;

export const metadata: Metadata = {
  title: `Guest list | ${groom} & ${bride}`,
  robots: { index: false, follow: false },
};

export default function GuestsPage() {
  return (
    <div className="ledger-page">
      <div className="backdrop" aria-hidden="true" />
      <header className="ledger-top">
        <Link href="/" className="ledger-top__mark" aria-label="Back to the invitation">
          <span className="script-title">
            {groom.charAt(0)} &amp; {bride.charAt(0)}
          </span>
        </Link>
        <Link href="/" className="ledger-top__link">
          Back to the invitation
        </Link>
      </header>
      <Suspense fallback={<p className="ledger-loading">Opening your guest list…</p>}>
        <GuestsContent />
      </Suspense>
    </div>
  );
}

async function GuestsContent() {
  const list = await getGuestList();

  if (!list.signedIn) {
    return (
      <main className="ledger-signin">
        <div className="reply-card">
          <div className="ledger-signin__inner">
            <h1 className="script-title login-dialog__title">For the couple</h1>
            <p className="login-dialog__intro">
              Sign in to see who has replied, plan the tables and download the list.
            </p>
            <SignInForm />
          </div>
        </div>
      </main>
    );
  }

  return (
    <GuestList
      replies={list.replies}
      source={list.source}
      error={list.error}
      loadedAt={list.loadedAt}
      deadline={wedding.rsvp.deadline}
      sheetUrl={process.env.RSVP_SHEET_URL?.trim() || null}
    />
  );
}

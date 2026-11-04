"use client";

import { useEffect, useRef, useState } from "react";
import { DETAIL_LIMITS, type GuestDetails } from "@/lib/replies-shared";
import { contactHref, formatDay, formatTime, type Row } from "./guest-utils";

type Props = {
  row: Row | null;
  onClose: () => void;
  /** Resolves to an error message, or null once saved. */
  onSave: (row: Row, changes: Partial<GuestDetails>) => Promise<string | null>;
};

/** Everything about one reply, with the table and private notes the couple can change. */
export function GuestSheet({ row, onClose, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = row !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className="guest-sheet"
      aria-labelledby="guest-sheet-name"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {row ? <SheetBody key={row.id} row={row} onSave={onSave} close={() => ref.current?.close()} /> : null}
    </dialog>
  );
}

function SheetBody({
  row,
  onSave,
  close,
}: {
  row: Row;
  onSave: Props["onSave"];
  close: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coming = row.attending === "yes";
  const href = contactHref(row.contact);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const changes: Partial<GuestDetails> = {};
    const table = String(form.get("table") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    if (table !== row.table) changes.table = table;
    if (notes !== row.notes) changes.notes = notes;
    if (!Object.keys(changes).length) return close();

    setSaving(true);
    setError(null);
    const problem = await onSave(row, changes);
    setSaving(false);
    if (problem) setError(problem);
    else close();
  }

  return (
    <div className="guest-sheet__panel">
      <button type="button" className="guest-sheet__close" onClick={close} aria-label="Close">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>

      <h2 id="guest-sheet-name" className="guest-sheet__name">
        {row.name}
      </h2>
      <p className="guest-sheet__answer">
        <span className={`status status--${coming ? "yes" : "no"}`}>{coming ? "Coming" : "Not coming"}</span>
        {coming ? (
          <span>
            {row.guests} {row.guests === 1 ? "guest" : "guests"} of {row.seatsOffered}{" "}
            {row.seatsOffered === 1 ? "seat" : "seats"}
          </span>
        ) : null}
      </p>
      {!row.isLatest && row.replacedOn ? (
        <p className="guest-sheet__notice">
          This is an earlier reply. {row.name} replied again on {formatDay(row.replacedOn)}, and that reply is the one
          counted.
        </p>
      ) : null}

      <dl className="guest-sheet__facts">
        {coming && row.guests > 1 ? <Fact term="Coming with" value={row.companions} /> : null}
        {coming ? <Fact term="Food needs" value={row.dietary} /> : null}
        <div>
          <dt>Phone or email</dt>
          <dd>
            {row.contact ? href ? <a href={href}>{row.contact}</a> : row.contact : <Missing />}
          </dd>
        </div>
        <Fact term="Message" value={row.message} />
        <div>
          <dt>Invitation link</dt>
          <dd>
            {row.inviteName ? `For ${row.inviteName}, ` : "No name in the link, "}
            {row.seatsOffered} {row.seatsOffered === 1 ? "seat" : "seats"}
          </dd>
        </div>
        <div>
          <dt>Replied</dt>
          <dd>
            {row.submittedAt ? `${formatDay(row.submittedAt)} at ${formatTime(row.submittedAt)}` : <Missing />}
          </dd>
        </div>
        {row.earlier.length ? (
          <div>
            <dt>Earlier replies</dt>
            <dd>
              <ul className="guest-sheet__earlier">
                {row.earlier.map((r) => (
                  <li key={r.id}>
                    {formatDay(r.submittedAt)}:{" "}
                    {r.attending === "yes" ? `coming, ${r.guests} ${r.guests === 1 ? "guest" : "guests"}` : "not coming"}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      <form className="guest-sheet__form" onSubmit={handleSubmit}>
        <div className="guest-field">
          <label htmlFor="guest-sheet-table">Table</label>
          <input
            id="guest-sheet-table"
            name="table"
            defaultValue={row.table}
            maxLength={DETAIL_LIMITS.table}
            autoComplete="off"
            placeholder="For example: 4, or Family A"
          />
        </div>
        <div className="guest-field">
          <label htmlFor="guest-sheet-notes">Private notes</label>
          <textarea
            id="guest-sheet-notes"
            name="notes"
            defaultValue={row.notes}
            maxLength={DETAIL_LIMITS.notes}
            rows={4}
            placeholder="Only the two of you see these."
          />
        </div>
        {error ? (
          <p className="guest-sheet__error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="guest-sheet__buttons">
          <button type="submit" className="ledger-button ledger-button--solid" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className="ledger-button" onClick={close}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value ? value : <Missing />}</dd>
    </div>
  );
}

function Missing() {
  return <span className="ledger-muted">Not given</span>;
}

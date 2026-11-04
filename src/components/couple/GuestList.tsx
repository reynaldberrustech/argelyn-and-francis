"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { saveGuestDetails, signOut, type SaveResult } from "@/app/guests/actions";
import { DETAIL_LIMITS, type GuestDetails, type Reply, type ReplySource } from "@/lib/replies-shared";
import { GuestSheet } from "./GuestSheet";
import { buildRows, contactHref, formatDay, formatTime, sameName, toCsv, type Row } from "./guest-utils";

type Filter = "all" | "coming" | "declined" | "unseated" | "dietary";
type SortKey = "submittedAt" | "name" | "attending" | "guests" | "table";
type Sort = { key: SortKey; dir: 1 | -1 };

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Everyone" },
  { key: "coming", label: "Coming" },
  { key: "declined", label: "Not coming" },
  { key: "unseated", label: "Need a table" },
  { key: "dietary", label: "Food needs" },
];

const MATCHES: Record<Filter, (r: Row) => boolean> = {
  all: () => true,
  coming: (r) => r.attending === "yes",
  declined: (r) => r.attending === "no",
  unseated: (r) => r.attending === "yes" && !r.table,
  dietary: (r) => r.attending === "yes" && !!r.dietary,
};

const FIRST_DIRECTION: Record<SortKey, 1 | -1> = { submittedAt: -1, name: 1, attending: 1, guests: -1, table: 1 };

const COMPARE: Record<SortKey, (a: Row, b: Row) => number> = {
  submittedAt: (a, b) => a.submittedAt.localeCompare(b.submittedAt),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  attending: (a, b) => (a.attending === b.attending ? 0 : a.attending === "yes" ? -1 : 1),
  guests: (a, b) => a.guests - b.guests,
  table: (a, b) => a.table.localeCompare(b.table, undefined, { numeric: true, sensitivity: "base" }),
};

function sortRows(rows: Row[], { key, dir }: Sort) {
  return [...rows].sort((a, b) => {
    // Guests without a table always go to the end.
    if (key === "table" && !a.table !== !b.table) return a.table ? -1 : 1;
    return COMPARE[key](a, b) * dir || COMPARE.name(a, b);
  });
}

// When the couple last opened the list, so newer replies can be marked "New".
const VISIT_KEY = "fa-guests-last-visit";
let previousVisit: number | undefined;
const subscribeNoop = () => () => {};
function readPreviousVisit() {
  if (previousVisit === undefined) {
    previousVisit = 0;
    try {
      previousVisit = Number(localStorage.getItem(VISIT_KEY)) || 0;
      localStorage.setItem(VISIT_KEY, String(Date.now()));
    } catch {
      // Private browsing: no "New" marks, nothing else changes.
    }
  }
  return previousVisit;
}

type Props = {
  replies: Reply[];
  source: ReplySource;
  error: string | null;
  loadedAt: string;
  deadline: string;
  sheetUrl: string | null;
};

export function GuestList({ replies, source, error, loadedAt, deadline, sheetUrl }: Props) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>({ key: "submittedAt", dir: -1 });
  const [showEarlier, setShowEarlier] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<GuestDetails>>>({});
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "error"; at: number } | null>(null);
  const lastVisit = useSyncExternalStore(subscribeNoop, readPreviousVisit, () => 0);

  // Fresh data from the sheet replaces anything changed here.
  const [dataVersion, setDataVersion] = useState(loadedAt);
  if (dataVersion !== loadedAt) {
    setDataVersion(loadedAt);
    setEdits({});
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.tone === "error" ? 6000 : 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const rows = useMemo(
    () => buildRows(replies.map((r) => (edits[r.id] ? { ...r, ...edits[r.id] } : r))),
    [replies, edits],
  );
  const current = useMemo(() => rows.filter((r) => r.isLatest), [rows]);

  const stats = useMemo(() => {
    const coming = current.filter((r) => r.attending === "yes");
    const sum = (list: Row[]) => list.reduce((total, r) => total + r.guests, 0);
    return {
      replies: current.length,
      comingReplies: coming.length,
      declined: current.length - coming.length,
      guests: sum(coming),
      unseated: sum(coming.filter((r) => !r.table)),
      tables: new Set(coming.map((r) => sameName(r.table)).filter(Boolean)).size,
      dietary: coming.filter((r) => r.dietary).length,
      earlier: rows.length - current.length,
    };
  }, [rows, current]);

  const counts = useMemo(() => {
    const base = showEarlier ? rows : current;
    return Object.fromEntries(FILTERS.map((f) => [f.key, base.filter(MATCHES[f.key]).length])) as Record<Filter, number>;
  }, [rows, current, showEarlier]);

  const visible = useMemo(() => {
    const words = sameName(query).split(" ").filter(Boolean);
    const base = (showEarlier ? rows : current).filter(MATCHES[filter]);
    const found = words.length
      ? base.filter((r) => {
          const haystack = sameName(
            [r.name, r.companions, r.inviteName, r.contact, r.message, r.notes, r.dietary, r.table].join(" "),
          );
          return words.every((w) => haystack.includes(w));
        })
      : base;
    return sortRows(found, sort);
  }, [rows, current, showEarlier, filter, query, sort]);

  const openRow = openId ? (rows.find((r) => r.id === openId) ?? null) : null;

  /** Saves a change straight away. Resolves to an error message, or null once saved. */
  async function save(row: Row, changes: Partial<GuestDetails>): Promise<string | null> {
    const before = edits[row.id];
    setEdits((all) => ({ ...all, [row.id]: { ...all[row.id], ...changes } }));
    let result: SaveResult;
    try {
      result = await saveGuestDetails(row.id, changes);
    } catch {
      result = { ok: false, error: "We couldn't reach the website. Check your connection and try again." };
    }
    if (!result.ok) {
      setEdits((all) => ({ ...all, [row.id]: before ?? {} }));
      setToast({ text: result.error, tone: "error", at: Date.now() });
      return result.error;
    }
    const what =
      changes.table !== undefined && changes.notes === undefined
        ? changes.table
          ? `${row.name} is at table ${changes.table}.`
          : `${row.name} has no table now.`
        : `Saved changes for ${row.name}.`;
    setToast({ text: what, tone: "ok", at: Date.now() });
    return null;
  }

  function sortBy(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: FIRST_DIRECTION[key] }));
  }

  function download() {
    const blob = new Blob([toCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guest-list-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const ariaSort = (key: SortKey) =>
    sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined;

  const sortButton = (key: SortKey, label: string) => (
    <button type="button" className="ledger-sort" onClick={() => sortBy(key)}>
      {label}
      <span className="ledger-sort__arrow" aria-hidden="true">
        {sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : ""}
      </span>
    </button>
  );

  const isNew = (r: Row) => lastVisit > 0 && Date.parse(r.submittedAt) > lastVisit;
  const safeSheetUrl = sheetUrl && /^https:\/\//.test(sheetUrl) ? sheetUrl : null;

  return (
    <main className="ledger">
      <section className="ledger-head" aria-labelledby="ledger-title">
        <h1 id="ledger-title" className="script-title ledger-head__title">
          Guest list
        </h1>
        <p className="ledger-head__intro">
          Replies are due by {deadline}.{" "}
          {source === "sheet"
            ? "Every reply is also saved in your Google Sheet."
            : source === "local"
              ? "Test mode: replies sent from this computer are kept in .data/rsvps.json."
              : null}
        </p>
        <div className="ledger-head__actions">
          <span className="ledger-head__updated">Updated {formatTime(loadedAt)}</span>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => startRefresh(() => router.refresh())}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          {safeSheetUrl ? (
            <a className="btn btn--small" href={safeSheetUrl} target="_blank" rel="noreferrer">
              Open the Google Sheet
            </a>
          ) : null}
          <form action={signOut}>
            <button type="submit" className="btn btn--small">
              Sign out
            </button>
          </form>
        </div>
      </section>

      {error ? (
        <p className="ledger-alert" role="alert">
          The replies couldn&rsquo;t be loaded from your Google Sheet just now. Press Refresh to try again.
          <span className="ledger-alert__detail">Details: {error}</span>
        </p>
      ) : null}
      {source === "none" ? (
        <p className="ledger-alert">
          Online replies aren&rsquo;t connected yet, so guests can&rsquo;t reply. Set RSVP_WEBHOOK_URL and
          RSVP_WEBHOOK_SECRET in Vercel, as the README explains.
        </p>
      ) : null}

      <section className="tally" aria-label="Summary">
        <p className="tally__lead">
          <span className="tally__number">{stats.guests}</span>
          <span className="tally__words">{stats.guests === 1 ? "guest is coming" : "guests are coming"}</span>
        </p>
        <dl className="tally__grid">
          <div>
            <dt>Replies</dt>
            <dd>{stats.replies}</dd>
          </div>
          <div>
            <dt>Coming</dt>
            <dd>
              {stats.comingReplies} <small>{stats.comingReplies === 1 ? "reply" : "replies"}</small>
            </dd>
          </div>
          <div>
            <dt>Not coming</dt>
            <dd>
              {stats.declined} <small>{stats.declined === 1 ? "reply" : "replies"}</small>
            </dd>
          </div>
          <div>
            <dt>Need a table</dt>
            <dd>
              {stats.unseated} <small>{stats.unseated === 1 ? "guest" : "guests"}</small>
            </dd>
          </div>
          <div>
            <dt>Tables used</dt>
            <dd>{stats.tables}</dd>
          </div>
          <div>
            <dt>Food needs</dt>
            <dd>
              {stats.dietary} <small>{stats.dietary === 1 ? "reply" : "replies"}</small>
            </dd>
          </div>
        </dl>
      </section>

      <section className="ledger-book" aria-label="Replies">
        <div className="ledger-tools">
          <div className="ledger-search">
            <label htmlFor="guest-search" className="sr-only">
              Search the guest list
            </label>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l4.5 4.5" />
            </svg>
            <input
              id="guest-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, tables, notes"
              autoComplete="off"
            />
          </div>
          <div className="ledger-filters" role="group" aria-label="Show">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className="ledger-filter"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="ledger-filter__count">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <div className="ledger-tools__end">
            {stats.earlier ? (
              <label className="ledger-check">
                <input type="checkbox" checked={showEarlier} onChange={(e) => setShowEarlier(e.target.checked)} />
                Show earlier replies ({stats.earlier})
              </label>
            ) : null}
            <button type="button" className="ledger-button" onClick={download} disabled={!visible.length}>
              Download CSV
            </button>
            <button type="button" className="ledger-button" onClick={() => window.print()} disabled={!visible.length}>
              Print
            </button>
          </div>
        </div>

        {visible.length ? (
          <>
            <div className="ledger-table-wrap">
              <table className="ledger-table">
                <caption className="sr-only">
                  {FILTERS.find((f) => f.key === filter)?.label}: {visible.length} replies. Select a name to see
                  everything they sent.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" aria-sort={ariaSort("name")}>
                      {sortButton("name", "Guest")}
                    </th>
                    <th scope="col" aria-sort={ariaSort("attending")}>
                      {sortButton("attending", "Reply")}
                    </th>
                    <th scope="col" aria-sort={ariaSort("guests")} className="ledger-table__num">
                      {sortButton("guests", "Guests")}
                    </th>
                    <th scope="col" aria-sort={ariaSort("table")}>
                      {sortButton("table", "Table")}
                    </th>
                    <th scope="col">Food needs</th>
                    <th scope="col">Phone or email</th>
                    <th scope="col">Message</th>
                    <th scope="col" aria-sort={ariaSort("submittedAt")}>
                      {sortButton("submittedAt", "Replied")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className={r.isLatest ? undefined : "is-earlier"}>
                      <td className="ledger-table__guest">
                        <button type="button" className="ledger-name" onClick={() => setOpenId(r.id)}>
                          {r.name}
                        </button>
                        <Tags row={r} isNew={isNew(r)} />
                        {r.companions && r.attending === "yes" ? (
                          <span className="ledger-sub">with {r.companions}</span>
                        ) : null}
                        {r.inviteName && sameName(r.inviteName) !== sameName(r.name) ? (
                          <span className="ledger-sub">Invited as {r.inviteName}</span>
                        ) : null}
                        {r.notes ? <span className="ledger-sub ledger-sub--note">Note: {r.notes}</span> : null}
                      </td>
                      <td>
                        <Status attending={r.attending} />
                      </td>
                      <td className="ledger-table__num">
                        {r.attending === "yes" ? (
                          <>
                            {r.guests}
                            <span className="ledger-of"> of {r.seatsOffered}</span>
                          </>
                        ) : (
                          <span className="ledger-muted">–</span>
                        )}
                      </td>
                      <td>
                        {r.attending === "yes" && r.isLatest ? (
                          <TableField key={`${r.id}:${r.table}`} row={r} onSave={save} />
                        ) : (
                          <span className="ledger-muted">{r.table || "–"}</span>
                        )}
                      </td>
                      <td className="ledger-table__clip">{r.dietary || <span className="ledger-muted">–</span>}</td>
                      <td className="ledger-table__contact">
                        <Contact value={r.contact} />
                      </td>
                      <td className="ledger-table__clip ledger-table__message">
                        {r.message ? <span title={r.message}>{r.message}</span> : <span className="ledger-muted">–</span>}
                      </td>
                      <td className="ledger-table__date">
                        {r.submittedAt ? (
                          <>
                            {formatDay(r.submittedAt)}
                            <span>{formatTime(r.submittedAt)}</span>
                          </>
                        ) : (
                          <span className="ledger-muted">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="ledger-cards">
              {visible.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`guest-card${r.isLatest ? "" : " is-earlier"}`}
                    onClick={() => setOpenId(r.id)}
                  >
                    <span className="guest-card__top">
                      <span className="guest-card__name">{r.name}</span>
                      <Status attending={r.attending} />
                    </span>
                    <Tags row={r} isNew={isNew(r)} />
                    <span className="guest-card__meta">
                      {r.attending === "yes" ? (
                        <span>
                          {r.guests} of {r.seatsOffered} {r.seatsOffered === 1 ? "seat" : "seats"}
                        </span>
                      ) : null}
                      {r.attending === "yes" ? (
                        <span className={r.table ? undefined : "guest-card__todo"}>
                          {r.table ? `Table ${r.table}` : "No table yet"}
                        </span>
                      ) : null}
                      {r.submittedAt ? <span>{formatDay(r.submittedAt)}</span> : null}
                    </span>
                    {r.companions && r.attending === "yes" ? (
                      <span className="ledger-sub">with {r.companions}</span>
                    ) : null}
                    {r.dietary && r.attending === "yes" ? (
                      <span className="ledger-sub">Food needs: {r.dietary}</span>
                    ) : null}
                    {r.message ? <span className="guest-card__message">&ldquo;{r.message}&rdquo;</span> : null}
                    {r.notes ? <span className="ledger-sub ledger-sub--note">Note: {r.notes}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Empty
            hasReplies={rows.length > 0}
            query={query}
            onClear={() => {
              setQuery("");
              setFilter("all");
            }}
          />
        )}

        {visible.length ? (
          <p className="ledger-foot">
            Showing {visible.length} of {showEarlier ? rows.length : current.length}{" "}
            {(showEarlier ? rows.length : current.length) === 1 ? "reply" : "replies"}. Select a name to see
            everything they sent, change their table or add a note.
          </p>
        ) : null}
      </section>

      <GuestSheet row={openRow} onClose={() => setOpenId(null)} onSave={save} />

      <div className={`ledger-toast${toast ? " is-shown" : ""}${toast?.tone === "error" ? " is-error" : ""}`} role="status">
        {toast?.text}
      </div>
    </main>
  );
}

function Status({ attending }: { attending: Reply["attending"] }) {
  return (
    <span className={`status status--${attending === "yes" ? "yes" : "no"}`}>
      {attending === "yes" ? "Coming" : "Not coming"}
    </span>
  );
}

function Tags({ row, isNew }: { row: Row; isNew: boolean }) {
  if (!isNew && row.isLatest && !row.earlier.length) return null;
  return (
    <span className="ledger-tags">
      {isNew ? <span className="ledger-tag ledger-tag--new">New</span> : null}
      {row.earlier.length ? <span className="ledger-tag">Changed reply</span> : null}
      {!row.isLatest ? <span className="ledger-tag">Earlier reply</span> : null}
    </span>
  );
}

function Contact({ value }: { value: string }) {
  if (!value) return <span className="ledger-muted">–</span>;
  const href = contactHref(value);
  return href ? <a href={href}>{value}</a> : <>{value}</>;
}

/** Type a table and press Enter (or leave the box) to save it. */
function TableField({
  row,
  onSave,
}: {
  row: Row;
  onSave: (row: Row, changes: Partial<GuestDetails>) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState(row.table);

  function commit() {
    const value = draft.trim();
    if (value !== row.table) void onSave(row, { table: value });
  }

  return (
    <input
      className="ledger-seat"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setDraft(row.table);
      }}
      maxLength={DETAIL_LIMITS.table}
      placeholder="Add"
      aria-label={`Table for ${row.name}`}
      autoComplete="off"
    />
  );
}

function Empty({ hasReplies, query, onClear }: { hasReplies: boolean; query: string; onClear: () => void }) {
  if (!hasReplies) {
    return (
      <div className="ledger-empty">
        <p className="ledger-empty__title">No replies yet</p>
        <p>When guests send the reply card on the invitation, they&rsquo;ll appear here.</p>
      </div>
    );
  }
  return (
    <div className="ledger-empty">
      <p className="ledger-empty__title">No guests match{query.trim() ? ` “${query.trim()}”` : " this view"}</p>
      <button type="button" className="ledger-button" onClick={onClear}>
        Show everyone
      </button>
    </div>
  );
}

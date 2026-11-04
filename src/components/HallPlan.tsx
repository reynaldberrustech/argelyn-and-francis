"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { wedding } from "@/content/wedding";

import { Reveal } from "./Reveal";

type AreaId = "stage" | "aisle" | "family" | "tables" | "buffet" | "booth" | "entrance";

const AREAS: { id: AreaId; name: string; note: string }[] = [
  { id: "entrance", name: "Entrance", note: "Come in through the floral arch. The seating chart is just inside." },
  {
    id: "tables",
    name: "Guest tables",
    note: "Find your name on the seating chart and your table number will be beside it.",
  },
  { id: "aisle", name: "The aisle", note: "Please keep it clear when the newlyweds make their entrance." },
  {
    id: "family",
    name: "Family tables",
    note: `${wedding.couple.groom}'s family sits on the left of the stage and ${wedding.couple.bride}'s on the right.`,
  },
  { id: "stage", name: "Main stage", note: "Where the toasts, the program and our first dance take place." },
  { id: "buffet", name: "Buffet", note: "Dinner is served here once the reception begins." },
  { id: "booth", name: "Photo booth", note: "Grab your people and take a photo to remember the night." },
];

const TABLE_X = [70, 124, 236, 290];
const TABLE_Y = [140, 200, 260];
const POSTS_Y = [110, 170, 230, 290, 350];
const CHAIRS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { dx: Math.cos(angle) * 22, dy: Math.sin(angle) * 22 };
});

export function HallPlan() {
  const [active, setActive] = useState<AreaId>("stage");
  const current = AREAS.find((a) => a.id === active) ?? AREAS[0];
  const cls = (id: AreaId) => `hall-area${active === id ? " is-active" : ""}`;
  const pick = (id: AreaId) => () => setActive(id);

  return (
    <Reveal className="hall">
      <div className="hall__copy">
        <h3 className="hall__title">Inside the reception hall</h3>
        <p className="hall__intro">Choose a spot to see where it is.</p>
        <ul className="hall__legend">
          {AREAS.map((area) => (
            <li key={area.id}>
              <button
                type="button"
                aria-pressed={active === area.id}
                onClick={pick(area.id)}
                onMouseEnter={pick(area.id)}
                onFocus={pick(area.id)}
              >
                {area.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="hall__note" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {current.note}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <svg
        className="hall__plan"
        viewBox="0 0 360 456"
        role="img"
        aria-label={`Floor plan of the hall. ${current.name} is highlighted.`}
      >
        <path
          className="hall__walls"
          d="M150 432 H18 a10 10 0 0 1 -10 -10 V18 a10 10 0 0 1 10 -10 H342 a10 10 0 0 1 10 10 V422 a10 10 0 0 1 -10 10 H210"
        />

        <g className={cls("stage")} onClick={pick("stage")}>
          <rect x="116" y="20" width="128" height="48" rx="4" />
          <circle cx="174.5" cy="44" r="7" className="hall-area__ring" />
          <circle cx="185.5" cy="44" r="7" className="hall-area__ring" />
        </g>

        <g className={cls("family")} onClick={pick("family")}>
          <rect x="30" y="80" width="98" height="14" rx="3" />
          <rect x="232" y="80" width="98" height="14" rx="3" />
        </g>

        <g className={cls("aisle")} onClick={pick("aisle")}>
          <rect x="165" y="100" width="30" height="322" rx="2" />
          {POSTS_Y.map((y) => (
            <g key={y}>
              <circle cx="158" cy={y} r="3.2" className="hall-area__glyph" />
              <circle cx="202" cy={y} r="3.2" className="hall-area__glyph" />
            </g>
          ))}
        </g>

        <g className={cls("tables")} onClick={pick("tables")}>
          {TABLE_X.flatMap((x) =>
            TABLE_Y.map((y) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="15" />
                {CHAIRS.map((c, i) => (
                  <circle key={i} cx={x + c.dx} cy={y + c.dy} r="2.6" className="hall-area__chair" />
                ))}
              </g>
            )),
          )}
        </g>

        <g className={cls("buffet")} onClick={pick("buffet")}>
          <rect x="326" y="128" width="16" height="156" rx="3" />
        </g>

        <g className={cls("booth")} onClick={pick("booth")}>
          <rect x="24" y="318" width="96" height="68" rx="4" />
          <rect x="60" y="342" width="24" height="17" rx="3" className="hall-area__line" />
          <circle cx="72" cy="350.5" r="4.5" className="hall-area__line" />
        </g>

        <g className={cls("entrance")} onClick={pick("entrance")}>
          <path d="M150 432 V418 a30 26 0 0 1 60 0 V432" className="hall-area__line" />
        </g>

        <text x="180" y="87" className="hall__label" textAnchor="middle">
          Stage
        </text>
        <text x="180" y="450" className="hall__label" textAnchor="middle">
          Entrance
        </text>
      </svg>
    </Reveal>
  );
}

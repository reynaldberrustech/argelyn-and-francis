/**
 * Fine-line botanicals drawn in code: open blossoms, buds and slim leaves on branching stems.
 * Seeded, so the same drawing renders on the server and in the browser.
 */

export type Point = [number, number];
export type Dot = { cx: number; cy: number; r: number };
export type Floral = { lines: string[]; fills: string[]; dots: Dot[] };

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (p: Point) => `${r1(p[0])} ${r1(p[1])}`;

export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

type Rand = () => number;

const polar = (c: Point, r: number, a: number): Point => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];

function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
  const u = 1 - t;
  const at = (k: 0 | 1) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k];
  const tan = (k: 0 | 1) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]);
  return { pos: [at(0), at(1)] as Point, angle: Math.atan2(tan(1), tan(0)) };
}

/** Local frame: u runs along `angle`, v across it, squashed by `tilt` to suggest perspective. */
function frame(origin: Point, angle: number, tilt = 1) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return (u: number, v: number): Point => [origin[0] + c * u - s * v * tilt, origin[1] + s * u + c * v * tilt];
}

const empty = (): Floral => ({ lines: [], fills: [], dots: [] });

function merge(into: Floral, part: Partial<Floral>) {
  into.lines.push(...(part.lines ?? []));
  into.fills.push(...(part.fills ?? []));
  into.dots.push(...(part.dots ?? []));
}

/** A slim leaf: two soft curves meeting at a point, with a midrib. */
function leaf(base: Point, angle: number, len: number, bend = 0): Partial<Floral> {
  const P = frame(base, angle);
  const w = len * 0.2;
  const outline =
    `M ${pt(P(0, 0))} C ${pt(P(len * 0.3, w + bend * 0.4))} ${pt(P(len * 0.75, w * 0.75 + bend))} ${pt(P(len, bend))}` +
    ` C ${pt(P(len * 0.72, -w * 0.6 + bend))} ${pt(P(len * 0.28, -w + bend * 0.4))} ${pt(P(0, 0))} Z`;
  const rib = `M ${pt(P(len * 0.05, 0))} Q ${pt(P(len * 0.5, bend * 0.6))} ${pt(P(len * 0.85, bend * 0.92))}`;
  return { lines: [outline, rib], fills: [outline] };
}

/** An open blossom (like an anemone or cosmos), slightly tilted. */
function blossom(c: Point, size: number, rot: number, tilt: number, petals: number, rand: Rand): Floral {
  const out = empty();
  const P = frame(c, rot, tilt);
  const at = (r: number, t: number) => P(Math.cos(t) * r, Math.sin(t) * r);
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    const half = (Math.PI / petals) * 0.92;
    const len = size * (0.92 + rand() * 0.14);
    // A rounded petal with a gentle notch at its tip.
    const d =
      `M ${pt(at(size * 0.16, a - half * 0.55))}` +
      ` C ${pt(at(len * 0.55, a - half * 1.15))} ${pt(at(len * 1.02, a - half * 0.75))} ${pt(at(len, a - half * 0.18))}` +
      ` Q ${pt(at(len * 0.93, a))} ${pt(at(len, a + half * 0.18))}` +
      ` C ${pt(at(len * 1.02, a + half * 0.75))} ${pt(at(len * 0.55, a + half * 1.15))} ${pt(at(size * 0.16, a + half * 0.55))}`;
    out.lines.push(d);
    out.fills.push(`${d} Z`);
    out.lines.push(`M ${pt(at(size * 0.3, a))} L ${pt(at(len * 0.62, a + (rand() - 0.5) * 0.08))}`);
  }
  const ring: Point[] = [];
  for (let k = 0; k <= 24; k++) ring.push(at(size * 0.15, (k / 24) * Math.PI * 2));
  const centre = `M ${ring.map(pt).join(" L ")} Z`;
  out.lines.push(centre);
  out.fills.push(centre, centre);
  for (let k = 0; k < 11; k++) {
    const p = at(size * 0.25, (k / 11) * Math.PI * 2);
    out.dots.push({ cx: r1(p[0]), cy: r1(p[1]), r: r1(size * 0.028 + 0.4) });
  }
  return out;
}

/** A closed bud with two sepals. */
function bud(base: Point, angle: number, size: number): Partial<Floral> {
  const P = frame(base, angle);
  const body =
    `M ${pt(P(size * 0.12, 0))} C ${pt(P(size * 0.25, size * 0.36))} ${pt(P(size * 0.82, size * 0.32))} ${pt(P(size, 0))}` +
    ` C ${pt(P(size * 0.82, -size * 0.32))} ${pt(P(size * 0.25, -size * 0.36))} ${pt(P(size * 0.12, 0))} Z`;
  const fold = `M ${pt(P(size * 0.3, size * 0.08))} Q ${pt(P(size * 0.65, size * 0.16))} ${pt(P(size * 0.95, 0))}`;
  const sepals = [1, -1].map(
    (side) => `M ${pt(P(0, 0))} Q ${pt(P(size * 0.22, side * size * 0.34))} ${pt(P(size * 0.5, side * size * 0.24))}`,
  );
  return { lines: [body, fold, ...sepals], fills: [body] };
}

type End = "flower" | "small" | "bud" | "leaf";

/** A curving stem with leaves along it and short side shoots, ending in a flower, bud or leaf. */
function branch(
  out: Floral,
  rand: Rand,
  from: Point,
  angle: number,
  length: number,
  scale: number,
  end: End,
  curve: number,
  depth = 0,
) {
  const bend = (rand() - 0.5) * 0.9 * curve;
  const p0 = from;
  const p1 = polar(from, length * 0.33, angle - bend * 0.5);
  const p2 = polar(from, length * 0.66, angle + bend * 0.6);
  const p3 = polar(from, length, angle + bend * 0.2);
  out.lines.push(`M ${pt(p0)} C ${pt(p1)} ${pt(p2)} ${pt(p3)}`);

  const steps = Math.max(2, Math.round(length / (26 * scale)));
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const { pos, angle: a } = cubicAt(p0, p1, p2, p3, t);
    const side = i % 2 ? 1 : -1;
    if (depth === 0 && i % 3 === 2 && length > 90 * scale) {
      const shootEnd: End = rand() < 0.5 ? "bud" : "small";
      branch(
        out,
        rand,
        pos,
        a + side * (0.55 + rand() * 0.3),
        length * (0.3 + rand() * 0.15),
        scale,
        shootEnd,
        curve,
        1,
      );
    } else {
      merge(
        out,
        leaf(pos, a + side * (0.55 + rand() * 0.35), scale * (17 + rand() * 7) * (1 - t * 0.45), side * scale * 2.5),
      );
    }
  }

  const tip = cubicAt(p0, p1, p2, p3, 1);
  if (end === "flower") merge(out, blossom(p3, scale * (15 + rand() * 4), tip.angle, 0.72, 6, rand));
  else if (end === "small") merge(out, blossom(p3, scale * (8 + rand() * 2), rand() * 6, 0.85, 5, rand));
  else if (end === "bud") merge(out, bud(p3, tip.angle, scale * (11 + rand() * 3)));
  else merge(out, leaf(p3, tip.angle, scale * 16, 0));
}

type SprayOptions = {
  origin: Point;
  /** Direction the spray grows in, in radians */
  angle: number;
  spread?: number;
  reach?: number;
  seed?: number;
  scale?: number;
  branches?: number;
  /** Two open flowers and a bud gathered near the origin */
  cluster?: boolean;
  /** How much the stems curve, 0 to 1 */
  curve?: number;
  /** Let stems branch into short side shoots */
  shoots?: boolean;
};

/** A spray growing from `origin`: branches fanning out, with a cluster of open blossoms near the origin. */
export function spray({
  origin,
  angle,
  spread = 1.2,
  reach = 220,
  seed = 1,
  scale = 1,
  branches = 3,
  cluster = true,
  curve = 1,
  shoots = true,
}: SprayOptions): Floral {
  const rand = rng(seed);
  const out = empty();
  const ends: End[] = ["bud", "flower", "small", "leaf"];
  for (let i = 0; i < branches; i++) {
    const t = branches === 1 ? 0.5 : i / (branches - 1);
    const a = angle - spread / 2 + spread * t + (rand() - 0.5) * 0.12 * curve;
    const len = reach * (i === Math.floor(branches / 2) ? 1 : 0.62 + rand() * 0.25);
    branch(out, rand, origin, a, len, scale, ends[(i + seed) % ends.length], curve, shoots ? 0 : 1);
  }
  if (cluster) {
    merge(out, blossom(polar(origin, reach * 0.16, angle - 0.25), 27 * scale, angle + 0.4, 0.78, 7, rand));
    merge(out, blossom(polar(origin, reach * 0.3, angle + 0.35), 17 * scale, angle - 0.6, 0.7, 6, rand));
    merge(out, bud(polar(origin, reach * 0.24, angle - 0.7), angle - 0.9, 13 * scale));
  }
  return out;
}

/** A level garland for dividers: two gently curving sprays growing outward from a centre flower. */
export function garland({
  center,
  reach = 220,
  seed = 1,
  scale = 1,
}: {
  center: Point;
  reach?: number;
  seed?: number;
  scale?: number;
}) {
  const opts = { spread: 0.22, reach, scale, branches: 2, cluster: false, curve: 0.45, shoots: false };
  const out = empty();
  merge(out, spray({ ...opts, origin: center, angle: Math.PI, seed }));
  merge(out, spray({ ...opts, origin: center, angle: 0, seed: seed + 7 }));
  merge(out, blossom(center, 17 * scale, -Math.PI / 2, 0.75, 7, rng(seed + 3)));
  merge(out, blossom([center[0] - 22 * scale, center[1] + 6 * scale], 10 * scale, 0.6, 0.8, 6, rng(seed + 5)));
  merge(out, blossom([center[0] + 22 * scale, center[1] + 6 * scale], 10 * scale, 2.2, 0.8, 6, rng(seed + 9)));
  return out;
}

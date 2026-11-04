/**
 * Turns the calligraphy on the page into outlines (server only), in the Ephesis script,
 * so it can be drawn stroke by stroke like a pen. Names come from src/content/wedding.ts.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";
import { wedding } from "@/content/wedding";
import type { Lettering, ScriptWord } from "./lettering-types";

const SIZE = 100;
const PAD = 4;

const buf = readFileSync(join(process.cwd(), "src/assets/fonts/Ephesis-Regular.ttf"));
const script = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

type Shaped = { glyphs: string[]; x1: number; x2: number; y1: number; y2: number };

function shape(text: string): Shaped {
  const glyphs = script
    .getPaths(text, 0, 0, SIZE)
    .map((p) => p.toPathData(1))
    .filter((d) => d.length > 0);
  const box = script.getPath(text, 0, 0, SIZE).getBoundingBox();
  return { glyphs, x1: box.x1, x2: box.x2, y1: box.y1, y2: box.y2 };
}

/** Words drawn together share a top and bottom, so they keep the same size and baseline. */
function toWords(shapes: Shaped[]): ScriptWord[] {
  const top = Math.floor(Math.min(...shapes.map((s) => s.y1))) - PAD;
  const bottom = Math.ceil(Math.max(...shapes.map((s) => s.y2))) + PAD;
  return shapes.map((s) => {
    const x = Math.floor(s.x1) - PAD;
    return { glyphs: s.glyphs, x, y: top, width: Math.ceil(s.x2) + PAD - x, height: bottom - top };
  });
}

const { groom, bride } = wedding.couple;

const [first, second] = toWords([shape(groom.charAt(0)), shape(bride.charAt(0))]);
const [and] = toWords([shape("and")]);
const [save, the, date] = toWords([shape("Save"), shape("the"), shape("Date")]);
const [groomWord, amp, brideWord] = toWords([shape(groom), shape("&"), shape(bride)]);

export const lettering: Lettering = { first, second, and, save, the, date, groom: groomWord, amp, bride: brideWord };

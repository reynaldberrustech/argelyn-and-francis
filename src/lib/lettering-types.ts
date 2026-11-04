/** A word drawn as glyph outlines, in a viewBox at 100px font size. */
export type ScriptWord = {
  glyphs: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Lettering = {
  /** The couple's initials, for the monogram (same scale as each other) */
  first: ScriptWord;
  second: ScriptWord;
  and: ScriptWord;
  save: ScriptWord;
  the: ScriptWord;
  date: ScriptWord;
  /** The couple's names (same scale as each other) */
  groom: ScriptWord;
  amp: ScriptWord;
  bride: ScriptWord;
};

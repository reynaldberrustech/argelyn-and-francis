import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { wedding } from "@/content/wedding";

export const alt = `${wedding.couple.groom} & ${wedding.couple.bride}, ${wedding.date.long}, ${wedding.venues.ceremony.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = join(process.cwd(), "src/assets/fonts");
const [script, serif] = await Promise.all([
  readFile(join(fonts, "Ephesis-Regular.ttf")),
  readFile(join(fonts, "CormorantGaramond-Medium.ttf")),
]);

const GOLD = "#E6B47F";
const GOLD_LIGHT = "#F8DCB4";
const caps = { fontFamily: "Cormorant", letterSpacing: 6, textTransform: "uppercase" as const, display: "flex" };

/** The link preview: the gold monogram on the left, names and date on the right. */
export default function Image() {
  const { groom, bride } = wedding.couple;
  const { date, venues } = wedding;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        alignItems: "center",
        background: "radial-gradient(circle at 30% 30%, #1F3568 0%, #13244A 50%, #0C1834 100%)",
        color: "#F8F6F1",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          right: 22,
          bottom: 22,
          border: "1px solid rgba(230,180,127,0.55)",
          display: "flex",
        }}
      />

      {/* Monogram */}
      <div style={{ width: 470, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 1, height: 70, background: GOLD, display: "flex" }} />
        <div style={{ fontFamily: "Ephesis", fontSize: 190, lineHeight: 1.05, color: GOLD, display: "flex" }}>
          {groom.charAt(0)}
        </div>
        <div style={{ position: "relative", width: 300, height: 60, display: "flex", justifyContent: "center" }}>
          {wedding.monogram.line ? (
            <div
              style={{
                position: "absolute",
                top: 32,
                left: 0,
                right: 0,
                height: 1,
                background: `linear-gradient(90deg, rgba(230,180,127,0), ${GOLD_LIGHT}, rgba(230,180,127,0))`,
                display: "flex",
              }}
            />
          ) : null}
          <div
            style={{
              fontFamily: "Ephesis",
              fontSize: wedding.monogram.join === "&" ? 96 : 76,
              lineHeight: 0.8,
              color: GOLD,
              display: "flex",
            }}
          >
            {wedding.monogram.join}
          </div>
        </div>
        <div style={{ fontFamily: "Ephesis", fontSize: 190, lineHeight: 1.05, color: GOLD, display: "flex" }}>
          {bride.charAt(0)}
        </div>
        <div style={{ width: 1, height: 70, background: GOLD, display: "flex" }} />
      </div>

      {/* Names and date */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingRight: 60 }}>
        <div style={{ ...caps, fontSize: 20, color: "#F8F6F1" }}>{wedding.invitation.together}</div>
        <div
          style={{
            fontFamily: "Ephesis",
            fontSize: 104,
            lineHeight: 1.05,
            color: GOLD,
            marginTop: 24,
            display: "flex",
          }}
        >
          {groom}
        </div>
        <div style={{ fontFamily: "Ephesis", fontSize: 64, lineHeight: 0.9, color: GOLD, display: "flex" }}>&amp;</div>
        <div style={{ fontFamily: "Ephesis", fontSize: 104, lineHeight: 1.05, color: GOLD, display: "flex" }}>
          {bride}
        </div>
        <div style={{ ...caps, fontSize: 22, color: GOLD_LIGHT, marginTop: 30 }}>
          {`${date.weekday} / ${date.short}`}
        </div>
        <div style={{ ...caps, fontSize: 17, letterSpacing: 4, color: "#CDD4E8", marginTop: 12 }}>{venues.ceremony.name}</div>
        <div style={{ ...caps, fontSize: 15, letterSpacing: 4, color: "#A6B2D2", marginTop: 4 }}>
          {`Reception at ${venues.reception.name}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Ephesis", data: script, style: "normal", weight: 400 },
        { name: "Cormorant", data: serif, style: "normal", weight: 500 },
      ],
    },
  );
}

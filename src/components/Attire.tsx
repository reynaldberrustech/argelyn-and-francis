import { wedding, type Look } from "@/content/wedding";
import { Daub } from "./Ornaments";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function Chips({ colors }: { colors: string[] }) {
  return (
    <span className="chips" aria-hidden="true">
      {colors.map((hex, i) => (
        <Daub key={`${hex}-${i}`} color={hex} seed={i * 7 + hex.length} className="chip" />
      ))}
    </span>
  );
}

function LookList({ looks }: { looks: Look[] }) {
  return (
    <>
      {looks.map((look) => (
        <div key={look.role} className="look">
          <Chips colors={look.colors} />
          <h4 className="caps">{look.role}</h4>
          <p>{look.description}</p>
        </div>
      ))}
    </>
  );
}

export function Attire() {
  const { attire, taglines } = wedding;

  return (
    <section id="attire" className="section" aria-labelledby="attire-title">
      <SectionHeading
        id="attire-title"
        title="Attire"
        intro="Our colors are midnight blue, royal blue, dusty blue and blush. Wear them if you'd like to match the evening."
      />

      <Reveal>
        <ul className="palette" aria-label="Wedding colors">
          {attire.palette.map((swatch, i) => (
            <li key={swatch.name}>
              <Daub color={swatch.hex} seed={i * 3 + 2} className="palette__daub" />
              <span className="caps palette__name">{swatch.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="attire">
        <Reveal className="attire__group">
          <h3 className="caps">Entourage</h3>
          <p className="attire__who">Bridesmaids and groomsmen</p>
          <LookList looks={attire.entourage} />
        </Reveal>

        <Reveal className="attire__group" delay={0.08}>
          <h3 className="caps">Principal sponsors</h3>
          <p className="attire__who">We would be delighted to see you in formal attire</p>
          <LookList looks={attire.sponsors} />
        </Reveal>

        <Reveal className="attire__group" delay={0.16}>
          <h3 className="caps">Guests</h3>
          <p className="attire__who">Formal or semi-formal attire</p>
          {attire.guests.map((look) => (
            <div key={look.role} className="look">
              <Chips colors={look.colors} />
              <h4 className="caps">{look.role}</h4>
              <ul>
                {look.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal className="attire__closing">
        <p className="attire__quote">{taglines.attire}</p>
        <p className="attire__note">Please leave white gowns to the bride.</p>
      </Reveal>
    </section>
  );
}

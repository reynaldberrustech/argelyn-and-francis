import Image from "next/image";
import { wedding, type Look } from "@/content/wedding";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ratio = (photo: { width: number; height: number }) => photo.width / photo.height;

/**
 * Each look grows in proportion to its photo's width-to-height ratio,
 * so every photo in a row ends up the same height.
 */
function LookFigure({ look, delay }: { look: Look; delay: number }) {
  return (
    <figure className="look" style={{ "--ar": ratio(look.photo).toFixed(3) } as React.CSSProperties}>
      <Reveal variant="curtain" delay={delay} className="look__photo">
        <Image
          src={look.photo.src}
          width={look.photo.width}
          height={look.photo.height}
          alt={look.photo.alt}
          sizes="(max-width: 700px) 46vw, (max-width: 1100px) 30vw, 300px"
        />
      </Reveal>
      <figcaption>
        <span className="look__role">{look.role}</span>
        <span className="look__desc">{look.description}</span>
      </figcaption>
    </figure>
  );
}

function Group({
  title,
  who,
  grow,
  className,
  children,
}: {
  title: string;
  who: string;
  grow: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`lookbook__group ${className ?? ""}`} style={{ "--grow": grow.toFixed(3) } as React.CSSProperties}>
      <header className="lookbook__head">
        <h3>{title}</h3>
        <p>{who}</p>
      </header>
      <div className="lookbook__looks">{children}</div>
    </section>
  );
}

/** The dress code as a lookbook: models wearing each look, the colors of the day, and a note for guests. */
export function Attire() {
  const { attire, taglines } = wedding;
  const sum = (looks: Look[]) => looks.reduce((total, look) => total + ratio(look.photo), 0);

  return (
    <section id="attire" className="section" aria-labelledby="attire-title">
      <SectionHeading
        id="attire-title"
        title="Attire"
        intro="Our colors are midnight blue and champagne, with white and touches of gold. Here's how everyone will look on the day."
      />

      <Reveal className="lookbook">
        <div className="lookbook__groups">
          <Group title="Entourage" who="Bridesmaids & groomsmen" grow={sum(attire.entourage)}>
            {attire.entourage.map((look, i) => (
              <LookFigure key={look.role} look={look} delay={0.15 + i * 0.12} />
            ))}
          </Group>

          <Group title="Principal sponsors" who="Maid of honor, best man & secondary sponsors" grow={sum(attire.sponsors)}>
            {attire.sponsors.map((look, i) => (
              <LookFigure key={look.role} look={look} delay={0.3 + i * 0.12} />
            ))}
          </Group>
        </div>

        <div className="lookbook__lower">
          <Group title="Guests" who="Suggested" grow={ratio(attire.guests.photo)} className="lookbook__group--guests">
            <figure
              className="look"
              style={{ "--ar": ratio(attire.guests.photo).toFixed(3) } as React.CSSProperties}
            >
              <Reveal variant="curtain" delay={0.45} className="look__photo">
                <Image
                  src={attire.guests.photo.src}
                  width={attire.guests.photo.width}
                  height={attire.guests.photo.height}
                  alt={attire.guests.photo.alt}
                  sizes="(max-width: 700px) 40vw, (max-width: 1100px) 24vw, 200px"
                />
              </Reveal>
            </figure>
            <div className="lookbook__lists">
              <div>
                <h4>Men</h4>
                <ul>
                  {attire.guests.men.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Women</h4>
                <ul>
                  {attire.guests.women.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Group>

          <div className="lookbook__foot">
            <div className="lookbook__palette">
              <p className="lookbook__palette-title">Color palette</p>
              <ul aria-label="Wedding colors">
                {attire.palette.map((color) => (
                  <li key={color.name}>
                    <span className="lookbook__swatch" style={{ background: color.swatch }} aria-hidden="true" />
                    {color.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lookbook__closing">
              <p className="lookbook__tagline">
                {/* One sentence per line. */}
                {taglines.attire.split(/(?<=\.)\s+/).map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              <p className="lookbook__note">Please leave white gowns to the bride.</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

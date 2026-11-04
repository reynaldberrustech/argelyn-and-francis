import { wedding, type GuestLook, type Look } from "@/content/wedding";
import { LookCarousel } from "./LookCarousel";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/** "Maid of honor & secondary sponsors (ladies)" -> "Ladies"; "Bridesmaids" stays "Bridesmaids". */
const shortRole = (role: string) => {
  const inBrackets = role.match(/\(([^)]+)\)/)?.[1];
  return inBrackets ? inBrackets.charAt(0).toUpperCase() + inBrackets.slice(1) : role;
};

/** Takes turns between the roles (bridesmaid, groomsman, bridesmaid...), labelling each photo with its role. */
function alternate(roles: Look[]): GuestLook[] {
  const longest = Math.max(...roles.map((r) => r.looks.length));
  const out: GuestLook[] = [];
  for (let i = 0; i < longest; i++) {
    for (const r of roles) if (r.looks[i]) out.push({ ...r.looks[i], role: shortRole(r.role) });
  }
  return out;
}

/** One part of the wedding party: what each role wears, then sample photos of the looks. */
function Party({ title, who, roles }: { title: string; who: string; roles: Look[] }) {
  return (
    <section className="lookbook__group" aria-label={title}>
      <header className="lookbook__head">
        <h3>{title}</h3>
        <p>{who}</p>
      </header>
      <dl className="lookbook__roles">
        {roles.map((r) => (
          <div key={r.role}>
            <dt className="look__role">{r.role}</dt>
            <dd className="look__desc">{r.description}</dd>
          </div>
        ))}
      </dl>
      <LookCarousel label={`${title} looks`} looks={alternate(roles)} showLabel={false} half />
    </section>
  );
}

/** The dress code as a lookbook: models wearing each look, the colors of the day, and a note for guests. */
export function Attire() {
  const { attire, taglines } = wedding;

  return (
    <section id="attire" className="section" aria-labelledby="attire-title">
      <SectionHeading
        id="attire-title"
        title="Attire"
        intro="Our colors are midnight blue and champagne. Here's how everyone will look on the day."
      />

      <Reveal className="lookbook">
        <div className="lookbook__groups">
          <Party title="Entourage" who="Bridesmaids & groomsmen" roles={attire.entourage} />
          <Party title="Principal sponsors" who="Maid of honor, best man & secondary sponsors" roles={attire.sponsors} />
        </div>

        <section className="lookbook__guests" aria-labelledby="guests-attire-title">
          <header className="lookbook__head">
            <h3 id="guests-attire-title">Guests</h3>
            <p>Suggested</p>
          </header>

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

          <LookCarousel label="In midnight blue" looks={attire.guests.midnightBlue} />
          <LookCarousel label="In champagne" looks={attire.guests.champagne} />
        </section>

        <div className="lookbook__foot">
          <div className="lookbook__palette">
            <p className="lookbook__palette-title">Suggested colors</p>
            <ul aria-label="Suggested colors">
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
            <p className="lookbook__note">White is reserved for the bride, so please avoid white outfits.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

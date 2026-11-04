import { wedding } from "@/content/wedding";
import type { Lettering } from "@/lib/lettering-types";
import { FloralCorner, FloralGarland } from "./Florals";
import { InkTitle } from "./InkTitle";
import { Reveal } from "./Reveal";
import { RevealPhoto } from "./RevealPhoto";
import { ScriptWord } from "./ScriptWord";

/** "You are cordially invited. Be our guest." */
export function Cordially() {
  const words = wedding.invitation.cordially.split(" ");
  // Break into lines like the card: "You are / cordially invited".
  const lines = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  return (
    <section id="invited" className="section page page--cordially" aria-labelledby="cordially-title">
      <InkTitle id="cordially-title" className="script-title cordially__title">
        {lines.map((line) => (
          <span key={line} className="cordially__line">
            {line}
          </span>
        ))}
      </InkTitle>
      <Reveal delay={0.6}>
        <p className="caps cordially__guest">{wedding.invitation.beOurGuest}</p>
      </Reveal>
      <FloralGarland className="cordially__garland" />
    </section>
  );
}

/** "Together with their families", a photo framed with flowers, the couple's names and the invitation line. */
export function PhotoInvitation({ lettering }: { lettering: Lettering }) {
  const { groom, bride } = wedding.couple;
  const photo = wedding.photos.invitation;
  return (
    <section className="section page page--photo" aria-labelledby="names-title">
      <Reveal>
        <p className="caps page__eyebrow">{wedding.invitation.together}</p>
      </Reveal>

      <div className="photo-frame">
        <RevealPhoto
          src={photo.src}
          alt={photo.alt}
          sizes="(max-width: 640px) 86vw, 460px"
          className="painted-photo painted-photo--portrait"
        />
        <FloralCorner corner="tr" variant={2} className="photo-frame__floral photo-frame__floral--tr" />
        <FloralCorner corner="bl" variant={0} className="photo-frame__floral photo-frame__floral--bl" />
      </div>

      <h2 id="names-title" className="names">
        <span className="sr-only">
          {groom} and {bride}
        </span>
        <ScriptWord word={lettering.groom} className="names__word names__word--groom" />
        <ScriptWord word={lettering.amp} delay={0.9} className="names__word names__word--amp" />
        <ScriptWord word={lettering.bride} delay={1.3} className="names__word names__word--bride" />
      </h2>

      <Reveal delay={0.3}>
        <p className="caps page__line">{wedding.invitation.joyfully}</p>
      </Reveal>
    </section>
  );
}

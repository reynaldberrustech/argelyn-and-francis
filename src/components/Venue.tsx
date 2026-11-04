import { wedding } from "@/content/wedding";
import { mapsDirectionsUrl, mapsEmbedUrl, mapsSearchUrl } from "@/lib/calendar";
import { HallPlan } from "./HallPlan";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Venue() {
  const { venue } = wedding;

  return (
    <section id="venue" className="section" aria-labelledby="venue-title">
      <SectionHeading id="venue-title" title="The Venue" />

      <div className="venue">
        <Reveal className="venue__info">
          <h3 className="venue__name">{venue.name}</h3>
          <p className="venue__town">{venue.town}</p>
          <p className="venue__detail">{venue.detail}</p>
          <div className="venue__actions">
            <a className="btn btn--solid" href={mapsDirectionsUrl()} target="_blank" rel="noopener noreferrer">
              Get directions
            </a>
            <a className="btn" href={mapsSearchUrl()} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </div>
        </Reveal>

        <Reveal className="venue__map" delay={0.1}>
          <iframe
            title={`Map showing ${venue.name}`}
            src={mapsEmbedUrl()}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Reveal>
      </div>

      <HallPlan />
    </section>
  );
}

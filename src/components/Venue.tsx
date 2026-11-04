import { wedding, type Venue as Place } from "@/content/wedding";
import { mapsDirectionsUrl, mapsSearchUrl } from "@/lib/calendar";
import { HallPlan } from "./HallPlan";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function VenueCard({ place }: { place: Place }) {
  return (
    <article className="venue-card">
      <p className="caps venue-card__label">
        {place.label}
        <span className="venue-card__time">{place.time}</span>
      </p>
      <h3 className="venue-card__name">{place.name}</h3>
      <p className="caps venue-card__town">{place.town}</p>
      <p className="venue-card__detail">{place.detail}</p>
      <div className="venue-card__actions">
        <a className="btn btn--solid btn--small" href={mapsDirectionsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">
          Get directions
        </a>
        <a className="btn btn--small" href={mapsSearchUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </div>
    </article>
  );
}

/** The church, then the hotel: two cards joined by a gold line, each with directions. */
export function Venue() {
  const { ceremony, reception } = wedding.venues;

  return (
    <section id="venue" className="section" aria-labelledby="venue-title">
      <SectionHeading
        id="venue-title"
        title="The Venues"
        intro={`We say our vows at ${ceremony.name}, then everyone heads to ${reception.name} to celebrate.`}
      />

      <div className="venues">
        <Reveal className="venues__item">
          <VenueCard place={ceremony} />
        </Reveal>
        <div className="venues__then" aria-hidden="true">
          <span className="venues__line" />
          <span className="venues__word">then</span>
          <span className="venues__line" />
        </div>
        <Reveal className="venues__item" delay={0.12}>
          <VenueCard place={reception} />
        </Reveal>
      </div>

      <HallPlan />
    </section>
  );
}

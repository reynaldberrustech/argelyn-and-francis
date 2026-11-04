"use client";

import { useState } from "react";
import type { Venue } from "@/content/wedding";
import { mapsEmbedUrl } from "@/lib/calendar";

/** One map with a switch between the ceremony and the reception. */
export function VenueMap({ places }: { places: Venue[] }) {
  const [index, setIndex] = useState(0);
  const place = places[index];

  return (
    <div className="venue-map">
      <div className="venue-map__switch" role="group" aria-label="Show on the map">
        {places.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className="venue-map__option"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="venue-map__frame">
        <iframe
          key={place.mapsQuery}
          title={`Map showing ${place.name}`}
          src={mapsEmbedUrl(place.mapsQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}

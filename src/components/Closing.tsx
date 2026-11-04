import { wedding } from "@/content/wedding";
import { CopyHashtag } from "./CopyHashtag";
import { CoupleLogin } from "./couple/CoupleLogin";
import { FloralGarland } from "./Florals";
import { InkTitle } from "./InkTitle";
import { Reveal } from "./Reveal";
import { RevealPhoto } from "./RevealPhoto";

/** The last page: a thank-you note, a photo with painted edges, and the couple's sign-off. */
export function Closing() {
  const { groom, bride } = wedding.couple;
  const photo = wedding.photos.closing;
  return (
    <footer id="site-footer" className="closing">
      <InkTitle as="p" className="closing__note">
        {wedding.thankYou}
      </InkTitle>
      <RevealPhoto
        src={photo.src}
        alt={photo.alt}
        sizes="(max-width: 760px) 100vw, 900px"
        className="painted-photo painted-photo--wide closing__photo"
      />
      <Reveal className="closing__sign" delay={0.15}>
        <FloralGarland className="closing__garland" />
        <p className="closing__love">With love,</p>
        <p className="script-title closing__names">
          {groom} &amp; {bride}
        </p>
        <p className="caps closing__meta">
          {wedding.date.long}
          <br />
          {wedding.venues.ceremony.name}
          <br />
          {wedding.venues.reception.name}
          <br />
          {wedding.venues.ceremony.town}
        </p>
        <CopyHashtag hashtag={wedding.hashtag} />
      </Reveal>
      <CoupleLogin />
    </footer>
  );
}

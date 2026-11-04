import { Attire } from "@/components/Attire";
import { Carousel } from "@/components/Carousel";
import { Closing } from "@/components/Closing";
import { Entourage } from "@/components/Entourage";
import { EnvelopeGate } from "@/components/EnvelopeGate";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Cordially, PhotoInvitation } from "@/components/Invitation";
import { InviteProvider } from "@/components/InviteProvider";
import { MusicToggle } from "@/components/MusicToggle";
import { Notes } from "@/components/Notes";
import { PetalShower } from "@/components/PetalShower";
import { Program } from "@/components/Program";
import { Rsvp } from "@/components/Rsvp";
import { SaveTheDate } from "@/components/SaveTheDate";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteNav } from "@/components/SiteNav";
import { Venue } from "@/components/Venue";
import { wedding } from "@/content/wedding";
import { lettering } from "@/lib/lettering";

export default function Home() {
  return (
    <InviteProvider>
      <div className="backdrop" aria-hidden="true" />
      <EnvelopeGate lettering={lettering} />
      <PetalShower />
      <ScrollProgress />
      <SiteNav />
      <main id="main">
        <Hero lettering={lettering} />
        <Cordially />
        <PhotoInvitation lettering={lettering} />
        <SaveTheDate lettering={lettering} />
        <Carousel />
        <Program />
        <Venue />
        <Gallery />
        <Attire />
        <Entourage />
        <Notes />
        <Rsvp />
      </main>
      <Closing />
      {wedding.music ? <MusicToggle src={wedding.music.src} title={wedding.music.title} /> : null}
    </InviteProvider>
  );
}

import { wedding } from "@/content/wedding";
import { fillTokens } from "@/lib/calendar";
import { Faq } from "./Faq";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Notes() {
  const items = wedding.faqs.map((f) => ({ q: f.q, a: fillTokens(f.a) }));

  return (
    <section id="notes" className="section" aria-labelledby="notes-title">
      <SectionHeading id="notes-title" title="Details" />
      <div className="notes">
        <Reveal className="notes__faq">
          <h3 className="caps">Questions guests ask</h3>
          <Faq items={items} />
        </Reveal>
      </div>
    </section>
  );
}

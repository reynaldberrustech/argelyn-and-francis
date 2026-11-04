import { InkTitle } from "./InkTitle";
import { Flourish } from "./Ornaments";
import { Reveal } from "./Reveal";

/** A section title in gold calligraphy that inks itself in, with a tapered gold line under it. */
export function SectionHeading({ title, intro, id }: { title: string; intro?: string; id?: string }) {
  return (
    <header className="section-head">
      <InkTitle id={id} className="script-title section-head__title">
        {title}
      </InkTitle>
      <Flourish className="section-head__flourish" />
      {intro ? (
        <Reveal as="p" delay={0.35}>
          {intro}
        </Reveal>
      ) : null}
    </header>
  );
}

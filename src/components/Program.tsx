import { wedding } from "@/content/wedding";
import { ProgramSpine } from "./ProgramSpine";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Program() {
  return (
    <section id="schedule" className="section" aria-labelledby="schedule-title">
      <SectionHeading
        id="schedule-title"
        title="Our Day"
        intro={`Everything happens at ${wedding.venue.name}, from the vows to the last dance.`}
      />
      <ProgramSpine>
        <ol className="program">
          {wedding.schedule.map((item, i) => (
            <Reveal as="li" key={item.iso} className="program__item" delay={i * 0.05}>
              <time className="program__time" dateTime={item.iso}>
                {item.time}
              </time>
              <span className="program__node" aria-hidden="true" />
              <div className="program__body">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </ProgramSpine>
    </section>
  );
}

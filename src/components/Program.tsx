import { wedding } from "@/content/wedding";
import { ProgramSpine } from "./ProgramSpine";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Program() {
  const { ceremony, reception } = wedding.venues;
  return (
    <section id="schedule" className="section" aria-labelledby="schedule-title">
      <SectionHeading
        id="schedule-title"
        title="Our Day"
        intro={`The ceremony is at ${ceremony.name} at ${ceremony.time}, and the celebration continues at ${reception.name}.`}
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
                <p className="program__place">{wedding.venues[item.place].name}</p>
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

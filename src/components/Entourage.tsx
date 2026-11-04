import { wedding, type RoleGroup } from "@/content/wedding";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="party">
      <h3 className="caps party__title">
        <span>{title}</span>
      </h3>
      {children}
    </Reveal>
  );
}

function Names({ names, label }: { names: string[]; label?: string }) {
  return (
    <div className="party__side">
      {label ? <p className="party__role">{label}</p> : null}
      <ul>
        {names.map((name, i) => (
          <li key={`${name}-${i}`}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

function Roles({ groups }: { groups: RoleGroup[] }) {
  return (
    <div className="party__side">
      {groups.map((g) => (
        <div key={g.role} className="party__roleblock">
          <p className="party__role">{g.role}</p>
          <p className="party__meaning">{g.meaning}</p>
          <ul>
            {g.names.map((name, i) => (
              <li key={`${name}-${i}`}>{name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Entourage() {
  const e = wedding.entourage;

  return (
    <section id="entourage" className="section" aria-labelledby="entourage-title">
      <SectionHeading
        id="entourage-title"
        title="Entourage"
        intro="The family and friends walking the aisle with us."
      />

      <div className="entourage">
        <span className="entourage__aisle" aria-hidden="true" />

        <Group title="Parents">
          <div className="party__row">
            <Names label="Parents of the groom" names={e.parents.groom} />
            <Names label="Parents of the bride" names={e.parents.bride} />
          </div>
        </Group>

        <Group title="Principal sponsors">
          <div className="party__row">
            <Names names={e.principalSponsors.map((p) => p.left)} />
            <Names names={e.principalSponsors.map((p) => p.right)} />
          </div>
        </Group>

        <Group title="Best man and maid of honor">
          <div className="party__row">
            <Names label="Best man" names={[e.bestMan]} />
            <Names label="Maid of honor" names={[e.maidOfHonor]} />
          </div>
        </Group>

        <Group title="Secondary sponsors">
          {e.secondarySponsors.map((s) => (
            <div key={s.role} className="party__pair">
              <p className="party__pair-role">
                {s.role}
                <span>{s.meaning}</span>
              </p>
              <div className="party__row">
                <Names names={[s.left]} />
                <Names names={[s.right]} />
              </div>
            </div>
          ))}
        </Group>

        <Group title="Groomsmen and bridesmaids">
          <div className="party__row">
            <Names label="Groomsmen" names={e.groomsmen} />
            <Names label="Bridesmaids" names={e.bridesmaids} />
          </div>
        </Group>

        <Group title="Our little ones">
          <div className="party__row">
            <Roles groups={e.littleOnes.left} />
            <Roles groups={e.littleOnes.right} />
          </div>
        </Group>
      </div>
    </section>
  );
}

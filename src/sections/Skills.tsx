import { Container } from "@/components/Container";
import { ArrowUpRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader, SectionLabel } from "@/components/SectionHeader";
import { capabilityGroups, certifications, toolGroups } from "@/data/skills";

export function Skills() {
  return (
    <section id="skills" data-nav="about" aria-labelledby="skills-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container>
        <SectionHeader
          id="skills-title"
          index="06"
          label="Tools & skills"
          title={
            <>
              Tools <Accent>&amp;</Accent> skills
            </>
          }
          intro="The tools behind the work, and the skills I bring to every project."
        />

        <Reveal className="mt-14 md:mt-20">
          <h3 className="label text-faint">Tools</h3>
          <dl className="mt-4 border-t border-line">
            {toolGroups.map((group) => (
              <div key={group.group} className="grid grid-cols-1 gap-2 border-b border-line py-6 md:grid-cols-12 md:items-baseline md:gap-8">
                <dt className="label text-mute md:col-span-3">{group.group}</dt>
                <dd className="flex flex-wrap gap-x-6 gap-y-1 font-display text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] md:col-span-9">
                  {group.tools.map((tool, index) => (
                    <span key={tool} className="flex items-baseline gap-6">
                      {index > 0 && (
                        <span aria-hidden className="text-faint/60">
                          /
                        </span>
                      )}
                      {tool}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="mt-16 md:mt-20" delay={0.05}>
          <h3 className="label text-faint">Capabilities</h3>
          <div className="mt-4 grid grid-cols-1 gap-10 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {capabilityGroups.map((group) => (
              <div key={group.group}>
                <h4 className="text-lg font-medium">{group.group}</h4>
                <ul className="mt-4 grid gap-2.5 text-[0.9375rem] text-mute">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-baseline gap-3">
                      <span aria-hidden className="h-px w-3 shrink-0 translate-y-[-0.3em] bg-line-strong" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function Certifications() {
  return (
    <section id="certifications" data-nav="about" aria-labelledby="certifications-title" className="pb-24 md:pb-32 lg:pb-36">
      <Container>
        <Reveal className="grid grid-cols-1 gap-8 border-t border-line pt-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <SectionLabel index="07">Certifications</SectionLabel>
            <h2 id="certifications-title" className="sr-only">
              Certifications
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8">
            {certifications.map((certification) => (
              <li key={certification.name} className="flex flex-col rounded-[1.25rem] border border-line p-6 md:p-7">
                <p className="font-display text-[1.75rem] leading-none">{certification.issuer}</p>
                <p className="mt-6 text-[1.0625rem] font-medium">{certification.name}</p>
                <p className="mt-1 text-sm text-mute">Certificate · Issued by {certification.issuer}</p>
                {certification.url && (
                  <a
                    href={certification.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm text-paper underline decoration-line-strong underline-offset-4 hover:decoration-paper"
                  >
                    Verify credential <ArrowUpRight width={14} height={14} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

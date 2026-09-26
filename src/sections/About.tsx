import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowRight, LinkedIn } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionLabel } from "@/components/SectionHeader";
import { about, profile } from "@/data/profile";

export function About() {
  const [first, second, accent] = about.heading;

  return (
    <section id="about" data-nav="about" aria-labelledby="about-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container className="grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <Reveal className="lg:col-span-5">
          <SectionLabel index="05">About</SectionLabel>
          <h2 id="about-title" className="mt-5 font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.92]">
            {first} {second} <Accent>{accent}</Accent>
          </h2>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mb-5 text-[1.1875rem] leading-relaxed text-paper/90 last:mb-0 md:text-xl">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.05}>
            <dl className="mt-12 grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-3 sm:gap-6">
              {about.stats.map((stat) => (
                <div key={stat.unit}>
                  <dt className="sr-only">{stat.unit}</dt>
                  <dd>
                    <span className="font-display text-[3.25rem] leading-none">{stat.value}</span>
                    <span className="label mt-3 block text-paper">{stat.unit}</span>
                    <span className="mt-1.5 block text-sm leading-snug text-mute">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-10 border-t border-line pt-8 sm:grid-cols-2">
              <div>
                <h3 className="label text-faint">What sales taught me</h3>
                <ul className="mt-4 grid gap-2 text-[0.9375rem] text-paper">
                  {about.understands.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span aria-hidden className="size-1 rounded-full bg-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="label text-faint">Building expertise in</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {about.building.map((item) => (
                    <li key={item} className="rounded-full border border-line px-3 py-1 text-sm text-mute">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#contact">
                Let’s Work Together
                <ArrowRight width={18} height={18} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href={profile.linkedin} variant="secondary">
                <LinkedIn width={18} height={18} />
                View LinkedIn
              </ButtonLink>
              {profile.cvUrl && (
                <ButtonLink href={profile.cvUrl} variant="secondary" download>
                  Download CV
                </ButtonLink>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

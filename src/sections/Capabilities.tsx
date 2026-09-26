import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader } from "@/components/SectionHeader";
import { capabilities } from "@/data/capabilities";

/** Renders "A & B" with the ampersand in the editorial italic used across the site. */
function CapabilityName({ name }: { name: string }) {
  const [before, after] = name.split(" & ");
  if (after === undefined) return <>{name}</>;
  return (
    <>
      {before} <Accent>&amp;</Accent> {after}
    </>
  );
}

export function Capabilities() {
  return (
    <section
      id="capabilities"
      data-nav="about"
      aria-labelledby="capabilities-title"
      className="border-t border-line py-24 md:py-32 lg:py-36"
    >
      <Container>
        <SectionHeader id="capabilities-title" index="06" label="Capabilities" title="Capabilities" />

        <Reveal className="mt-14 md:mt-20">
          <ol className="border-t border-line">
            {capabilities.map((capability, index) => (
              <li
                key={capability}
                className="group grid grid-cols-[2.75rem_1fr] items-baseline gap-x-3 border-b border-line py-6 md:grid-cols-12 md:gap-x-8 md:py-7"
              >
                <span className="label tabular text-faint transition-colors duration-300 group-hover:text-signal md:col-span-3">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] text-balance transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:col-span-9">
                  <CapabilityName name={capability} />
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}

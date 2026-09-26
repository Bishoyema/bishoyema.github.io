import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader } from "@/components/SectionHeader";
import { reasons } from "@/data/services";

export function WhyMe() {
  return (
    <section id="why" data-nav="about" aria-labelledby="why-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container>
        <SectionHeader
          id="why-title"
          index="08"
          label="Why work with me"
          title={
            <>
              Why work <Accent>with me</Accent>
            </>
          }
          intro="Creative thinking, marketing knowledge and real sales experience, in one person who can also make the content."
        />

        <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-y-16">
          {reasons.map((reason, index) => (
            <li key={reason.title} className="border-t border-line">
              <Reveal delay={(index % 3) * 0.06} className="pt-6">
                <span className="label tabular text-signal">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[1.375rem] font-medium leading-snug tracking-[-0.01em]">{reason.title}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-mute">{reason.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

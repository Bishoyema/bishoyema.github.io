import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionLabel } from "@/components/SectionHeader";
import { profile } from "@/data/profile";
import { ContactPanel } from "./ContactPanel";

export function Contact() {
  return (
    <section
      id="contact"
      data-nav="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-t border-line py-24 md:py-32 lg:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[30rem] left-1/2 size-[70rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(255_59_47/0.12),transparent)]"
      />
      <Container className="relative">
        <Reveal>
          <SectionLabel index="09">Contact</SectionLabel>
          <h2 id="contact-title" className="mt-6 max-w-[16ch] font-display text-[clamp(3rem,9.5vw,9rem)] leading-[0.88]">
            Have a project in mind? Let’s create something <Accent>worth watching.</Accent>
          </h2>
          <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-mute md:text-lg">
            Freelance projects, agency collaborations and full-time roles in digital marketing, e-commerce, social media
            and AI creative. Based in {profile.location} ({profile.timezone}).
          </p>
        </Reveal>

        <Reveal className="mt-14 border-t border-line pt-10 md:mt-20" delay={0.05}>
          <ContactPanel />
        </Reveal>
      </Container>
    </section>
  );
}

import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowDown } from "@/components/Icons";
import { Accent } from "@/components/SectionHeader";
import { profile, services } from "@/data/profile";
import { HeroReel } from "./HeroReel";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-x-clip pb-12 pt-28 sm:pt-32 lg:pb-14 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[20rem] right-[-20rem] size-[60rem] bg-[radial-gradient(closest-side,rgb(255_59_47/0.13),transparent)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <p className="label flex animate-fade items-center gap-2.5 text-mute">
            <span className="size-2 rounded-full bg-signal animate-rec" />
            {profile.availability} · {profile.location}
          </p>

          <h1
            id="hero-title"
            className="mt-6 font-display text-[clamp(4.75rem,24vw,7.5rem)] uppercase leading-[0.8] sm:text-[clamp(6rem,19vw,10rem)] lg:text-[clamp(7.5rem,12.4vw,12.5rem)]"
          >
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="block animate-rise [animation-delay:100ms]">Bishoy</span>
            </span>
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="block animate-rise [animation-delay:200ms]">Emad</span>
            </span>
          </h1>

          <p className="mt-6 animate-rise text-[clamp(1.375rem,3.6vw,2.125rem)] leading-[1.15] tracking-[-0.01em] [animation-delay:340ms]">
            AI Creative <Accent>&amp;</Accent> Digital Marketing Freelancer
          </p>
          <p className="mt-5 max-w-[34rem] animate-rise text-[1.0625rem] leading-relaxed text-mute [animation-delay:420ms] sm:text-lg">
            {profile.intro}
          </p>

          <div className="mt-9 flex animate-rise flex-col gap-3 [animation-delay:500ms] sm:flex-row">
            <ButtonLink href="/#work">
              View My Work
              <ArrowDown width={18} height={18} className="transition-transform duration-300 group-hover/button:translate-y-0.5" />
            </ButtonLink>
            <ButtonLink href="/#contact" variant="secondary">
              Let’s Work Together
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroReel />
        </div>
      </Container>

      <Container className="relative mt-16 animate-fade [animation-delay:800ms] lg:mt-20">
        <ul
          aria-label="Services"
          className="flex flex-wrap gap-x-3 gap-y-2 border-t border-line pt-6 text-sm text-mute lg:flex-nowrap lg:justify-between"
        >
          {services.map((service, index) => (
            <li key={service} className="flex items-center gap-3 whitespace-nowrap">
              {index > 0 && (
                <span aria-hidden className="text-faint lg:hidden">
                  /
                </span>
              )}
              {service}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

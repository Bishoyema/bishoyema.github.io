import Link from "next/link";
import { Container } from "@/components/Container";
import { ArrowRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader } from "@/components/SectionHeader";
import { serviceList } from "@/data/services";

export function Services() {
  return (
    <section id="services" data-nav="services" aria-labelledby="services-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container>
        <SectionHeader
          id="services-title"
          index="04"
          label="Services"
          title={
            <>
              What I can do for <Accent>your brand</Accent>
            </>
          }
          intro="Six ways to work together, from a single ad to a complete launch. Available to brands directly or as an extra pair of hands for agencies."
        />

        <Reveal className="mt-14 md:mt-20">
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((service, index) => (
              <li key={service.title} className="group flex flex-col bg-ink p-7 transition-colors duration-500 hover:bg-ink-2 lg:p-9">
                <span className="label tabular text-faint">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[0.95] lg:mt-14">{service.title}</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-mute">{service.description}</p>
                <ul aria-label={`${service.title} includes`} className="mt-6 flex flex-wrap gap-2">
                  {service.includes.map((item) => (
                    <li key={item} className="rounded-full border border-line px-3 py-1 text-xs text-mute">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  {service.example ? (
                    <Link
                      href={service.example.href}
                      className="inline-flex items-center gap-2 text-[0.9375rem] text-paper underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-paper"
                    >
                      {service.example.label}
                      <ArrowRight width={16} height={16} />
                    </Link>
                  ) : (
                    <Link
                      href="/#contact"
                      className="inline-flex items-center gap-2 text-[0.9375rem] text-mute transition-colors hover:text-paper"
                    >
                      Discuss a project
                      <ArrowRight width={16} height={16} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}

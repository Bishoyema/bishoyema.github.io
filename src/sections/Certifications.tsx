import { Container } from "@/components/Container";
import { ArrowUpRight } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionHeader";
import { certifications } from "@/data/certifications";

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
          <ul className="grid gap-4 sm:grid-cols-2 md:col-span-8">
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

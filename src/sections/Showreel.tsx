import Link from "next/link";
import { Container } from "@/components/Container";
import { ArrowRight, Play } from "@/components/Icons";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionLabel } from "@/components/SectionHeader";
import { ChapterButton, FilmStage, PlayFilmButton, StagePlayer } from "@/components/video/FilmStage";
import { films } from "@/data/media";
import { buttonClasses } from "@/components/Button";

const chapters = [
  { time: "0:00", seconds: 0, title: "The problem" },
  { time: "0:10", seconds: 10.1, title: "Enter the mascot" },
  { time: "0:20", seconds: 20.1, title: "The services" },
  { time: "0:30", seconds: 30.2, title: "Automation & AI video" },
  { time: "0:40", seconds: 40.25, title: "The close" },
];

const facts = [
  { term: "Format", detail: "Vertical 9:16" },
  { term: "Length", detail: "0:50" },
  { term: "Built for", detail: "Instagram & paid social" },
  { term: "Made with", detail: "AI, from script to sound" },
];

export function Showreel() {
  const film = films.brand;

  return (
    <section id="showreel" data-nav="work" aria-labelledby="showreel-title" className="relative py-24 md:py-32 lg:py-36">
      <Container>
        <FilmStage>
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-10">
            <Reveal className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
              <SectionLabel index="01">Featured film</SectionLabel>
              <h2 id="showreel-title" className="mt-5 font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.9]">
                ImpactX <Accent>brand film</Accent>
              </h2>
              <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-mute">
                A 50-second vertical film that introduces a new Dubai creative agency, told through the character who
                fronts it. Script, visuals, edit and sound were all produced with AI.
              </p>
            </Reveal>

            <div className="relative lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <div aria-hidden className="absolute inset-x-[4%] inset-y-[8%] -z-10 opacity-60 blur-[70px] saturate-150">
                <ResponsiveImage image={film.teaserPoster} sizes="240px" alt="" />
              </div>
              <Reveal y={40}>
                <StagePlayer
                  film={film}
                  preview
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="mx-auto w-full max-w-[25rem] lg:max-w-[min(28rem,calc((100svh-9rem)*0.5625))]"
                />
              </Reveal>
            </div>

            <Reveal className="lg:col-span-5 lg:col-start-8 lg:row-start-2" delay={0.1}>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6">
                {facts.map((fact) => (
                  <div key={fact.term}>
                    <dt className="label text-faint">{fact.term}</dt>
                    <dd className="mt-1.5 text-[0.9375rem] text-paper">{fact.detail}</dd>
                  </div>
                ))}
              </dl>

              <p className="label mt-8 text-faint">Chapters</p>
              <ol className="mt-3 border-t border-line">
                {chapters.map((chapter, index) => (
                  <li key={chapter.time} className="border-b border-line">
                    <ChapterButton
                      seconds={chapter.seconds}
                      until={chapters[index + 1]?.seconds}
                      className="flex w-full cursor-pointer items-center gap-5 py-3.5 text-left text-mute transition-colors duration-300 hover:text-paper data-[active]:text-paper"
                    >
                      <span className="tabular w-10 text-sm text-faint group-data-[active]/chapter:text-signal">
                        {chapter.time}
                      </span>
                      <span className="flex-1 text-[0.9375rem]">{chapter.title}</span>
                      <Play
                        width={14}
                        height={14}
                        className="opacity-0 transition-opacity duration-300 group-hover/chapter:opacity-100 group-data-[active]/chapter:opacity-100"
                      />
                    </ChapterButton>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PlayFilmButton className={buttonClasses("primary", "lg", "cursor-pointer")}>
                  <Play width={16} height={16} />
                  Watch with sound
                </PlayFilmButton>
                <Link href="/work/impactx-brand-film/" className={buttonClasses("secondary")}>
                  Read the case study
                  <ArrowRight width={18} height={18} className="transition-transform duration-300 group-hover/button:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </FilmStage>
      </Container>
    </section>
  );
}

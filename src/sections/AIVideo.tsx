import Link from "next/link";
import { Container } from "@/components/Container";
import { ArrowRight } from "@/components/Icons";
import { TypeBadge } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader } from "@/components/SectionHeader";
import { FilmPlayer } from "@/components/video/FilmPlayer";
import { getProject } from "@/data/projects";
import { videoFormats } from "@/data/services";
import { formatTime } from "@/lib/media-prefs";

const filmProjects = ["impactx-brand-film", "skincare-launch-ad", "serum-launch-reel", "serum-ingredient-film"].map(
  (slug) => getProject(slug)!,
);

export function AIVideo() {
  return (
    <section id="ai-video" data-nav="work" aria-labelledby="ai-video-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container>
        <SectionHeader
          id="ai-video-title"
          index="03"
          label="AI video"
          title={
            <>
              AI video, from script <Accent>to screen</Accent>
            </>
          }
          intro="Commercials, product films and brand stories produced with AI. No camera crew, no studio, and a turnaround measured in days instead of weeks."
        />

        <div className="mt-14 grid grid-cols-1 gap-y-16 md:mt-20 lg:grid-cols-12 lg:gap-x-10">
          <div className="min-w-0 lg:col-span-7">
            <ul
              aria-label="AI films"
              className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0"
            >
              {filmProjects.map((project) => (
                <li key={project.slug} className="w-[78vw] max-w-[22rem] shrink-0 snap-center md:w-auto md:max-w-none">
                  <Reveal>
                    <FilmPlayer film={project.film!} sizes="(min-width: 1024px) 20rem, (min-width: 768px) 45vw, 78vw" />
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="label text-mute">{project.tags.slice(1, 2).join("")} · {formatTime(project.film!.duration)}</p>
                        <h3 className="mt-2 font-display text-[1.75rem] leading-none">{project.title}</h3>
                      </div>
                      <TypeBadge project={project} className="mt-0.5 shrink-0" />
                    </div>
                    <Link
                      href={`/work/${project.slug}/`}
                      className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] text-mute transition-colors hover:text-paper"
                    >
                      Case study <ArrowRight width={16} height={16} />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <h3 className="label text-faint">Formats I produce</h3>
            <ol className="mt-4 border-t border-line">
              {videoFormats.map((format, index) => (
                <li key={format.title} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-line py-5">
                  <span className="label tabular pt-1 text-faint">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-lg font-medium leading-snug">{format.title}</p>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-mute">{format.note}</p>
                    {format.example && (
                      <Link
                        href={format.example.href}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-paper underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-paper"
                      >
                        See: {format.example.label}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

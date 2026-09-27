import Link from "next/link";
import type { ReactNode } from "react";
import type { Project } from "@/data/projects";
import { whatsappLink } from "@/data/profile";
import { cn } from "@/lib/site";
import { ButtonLink } from "../Button";
import { Container } from "../Container";
import { ArrowLeft, ArrowRight, Play, WhatsApp } from "../Icons";
import { ResponsiveImage } from "../ResponsiveImage";
import { Reveal } from "../Reveal";
import { Accent, SectionLabel } from "../SectionHeader";
import { ChapterButton, FilmStage, StagePlayer } from "../video/FilmStage";
import { TypeBadge } from "./ProjectCard";

export function CaseStudy({ project, next }: { project: Project; next: Project }) {
  const facts = [
    { term: "Brand", detail: project.brandNote ? `${project.brand}, ${project.brandNote}` : project.brand },
    { term: "Type", detail: project.type },
    { term: "Format", detail: project.format },
    { term: "Category", detail: project.tags.join(" · ") },
  ];

  return (
    <article>
      <header className="relative overflow-x-clip pt-28 sm:pt-32 lg:pt-40">
        <Container>
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-sm text-mute transition-colors hover:text-paper"
          >
            <ArrowLeft width={16} height={16} />
            All work
          </Link>

          <div className="mt-10 flex animate-fade flex-wrap items-center gap-4">
            <SectionLabel>Case study · {project.category}</SectionLabel>
            <TypeBadge project={project} />
          </div>

          <h1 className="mt-6 max-w-[15ch] animate-rise font-display text-[clamp(3.25rem,10vw,8.5rem)] leading-[0.88] text-balance [animation-delay:80ms]">
            {project.title}
          </h1>
          {project.line && project.line.replace(/\.$/, "") !== project.title.replace(/\.$/, "") && (
            <p className="mt-6 max-w-3xl animate-rise font-accent text-[clamp(1.5rem,3.4vw,2.5rem)] leading-tight text-paper/90 [animation-delay:160ms]">
              “{project.line}”
            </p>
          )}
          <p className="mt-8 max-w-2xl animate-rise text-lg leading-relaxed text-mute [animation-delay:220ms] md:text-xl">
            {project.summary}
          </p>

          <dl className="mt-12 grid animate-fade grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 [animation-delay:300ms] md:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.term}>
                <dt className="label text-faint">{fact.term}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-snug text-paper">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </header>

      <div className="mt-16 md:mt-24">
        {project.film ? <FilmMedia project={project} /> : <ImageMedia project={project} />}
      </div>

      <Container className="mt-24 md:mt-32">
        <div className="border-t border-line">
          <CaseRow title="Challenge">
            <p>{project.caseStudy.challenge}</p>
          </CaseRow>
          <CaseRow title="Creative approach">
            <p>{project.caseStudy.approach}</p>
          </CaseRow>
          <CaseRow title="Execution">
            <List items={project.caseStudy.execution} />
          </CaseRow>
          <CaseRow title="Deliverables">
            <List items={project.caseStudy.deliverables} />
          </CaseRow>
          <CaseRow title="Final result">
            <p>{project.caseStudy.result}</p>
          </CaseRow>
        </div>

        {project.disclaimer && (
          <p className="mt-10 max-w-3xl rounded-2xl border border-line bg-ink-2 p-5 text-sm leading-relaxed text-mute md:p-6">
            {project.disclaimer}
          </p>
        )}
      </Container>

      <NextProject next={next} />

      <Container className="py-24 md:py-32">
        <Reveal className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <h2 className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.9] md:col-span-8">
            Want something like this <Accent>for your brand?</Accent>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col md:items-stretch lg:flex-row lg:justify-end">
            <ButtonLink href="/#contact">Let’s Work Together</ButtonLink>
            <ButtonLink href={whatsappLink(`Hi Bishoy, I saw your ${project.title} project and I’d like to talk.`)} variant="secondary">
              <WhatsApp width={18} height={18} />
              WhatsApp
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </article>
  );
}

function CaseRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal className="grid grid-cols-1 gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8 md:py-10">
      <h2 className="label pt-1.5 text-faint md:col-span-3">{title}</h2>
      <div className="max-w-3xl text-[1.125rem] leading-relaxed text-paper/90 md:col-span-8 md:text-xl">{children}</div>
    </Reveal>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-4">
          <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-signal" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FilmMedia({ project }: { project: Project }) {
  const film = project.film!;
  const frames = project.storyboard ?? [];

  return (
    <FilmStage>
      <Container>
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="relative lg:col-span-6">
            <div aria-hidden className="absolute inset-x-[6%] inset-y-[10%] -z-10 opacity-50 blur-[70px] saturate-150">
              <ResponsiveImage image={film.poster} sizes="240px" alt="" />
            </div>
            <StagePlayer
              film={film}
              priority
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="mx-auto w-full max-w-[25rem] lg:max-w-[min(28rem,calc((100svh-8rem)*0.5625))]"
            />
          </div>

          <div className="lg:col-span-6">
            <h2 className="label text-faint">Key frames</h2>
            <p className="mt-2 text-sm text-mute">Frames from the film. Select one to play from that moment.</p>
            {/* `relative` keeps the buttons' screen-reader text inside the scroller, so phones never scroll sideways. */}
            <ol className="no-scrollbar relative -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-1 lg:gap-0 lg:overflow-visible lg:border-t lg:border-line lg:px-0 lg:pb-0">
              {frames.map((frame, index) => (
                <li key={frame.time} className="w-[40vw] max-w-[11rem] shrink-0 snap-start lg:w-auto lg:max-w-none lg:border-b lg:border-line">
                  <ChapterButton
                    seconds={frame.seconds}
                    until={frames[index + 1]?.seconds}
                    className="flex w-full cursor-pointer flex-col gap-3 text-left lg:flex-row lg:items-center lg:gap-5 lg:py-3"
                  >
                    <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-xl ring-1 ring-line transition-[box-shadow] duration-300 group-data-[active]/chapter:ring-2 group-data-[active]/chapter:ring-signal lg:w-14 lg:shrink-0 lg:rounded-lg">
                      <ResponsiveImage image={frame.still} sizes="(min-width: 1024px) 56px, 40vw" alt="" />
                      <span className="absolute inset-0 grid place-items-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover/chapter:opacity-100 lg:hidden">
                        <Play width={20} height={20} />
                      </span>
                    </span>
                    <span className="flex flex-1 flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-4">
                      <span className="tabular text-sm text-faint group-data-[active]/chapter:text-signal">{frame.time}</span>
                      <span className="flex-1">
                        <span className="block text-[0.9375rem] font-medium text-paper">{frame.title}</span>
                        <span className="mt-0.5 hidden text-sm leading-snug text-mute lg:block">{frame.note}</span>
                      </span>
                    </span>
                  </ChapterButton>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </FilmStage>
  );
}

function ImageMedia({ project }: { project: Project }) {
  if (project.variants?.length) {
    return (
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:gap-12">
          {project.variants.map((variant, index) => (
            <Reveal key={variant.label} delay={index * 0.08}>
              <figure>
                <div className="overflow-hidden rounded-[1.25rem] ring-1 ring-line">
                  <ResponsiveImage image={variant.image} sizes="(min-width: 768px) 45vw, 92vw" priority={index === 0} />
                </div>
                <figcaption className="mt-5">
                  <p className="label text-mute">
                    {variant.label} · <span className="text-paper">{variant.title}</span>
                  </p>
                  <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-mute">{variant.note}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="relative mx-auto max-w-[42rem]">
        <div aria-hidden className="absolute inset-[6%] -z-10 opacity-40 blur-[80px] saturate-150">
          <ResponsiveImage image={project.cover} sizes="240px" alt="" />
        </div>
        <div className="overflow-hidden rounded-[1.25rem] ring-1 ring-line">
          <ResponsiveImage image={project.cover} sizes="(min-width: 768px) 42rem, 92vw" priority />
        </div>
      </div>
    </Container>
  );
}

function NextProject({ next }: { next: Project }) {
  return (
    <Container className="mt-24 md:mt-32">
      <Link
        href={`/work/${next.slug}/`}
        className="group grid grid-cols-1 items-center gap-8 border-y border-line py-10 md:grid-cols-12 md:py-14"
      >
        <div className="md:col-span-8">
          <p className="label text-faint">Next project</p>
          <p className="mt-4 flex items-center gap-4 font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.9] transition-colors duration-500 group-hover:text-white">
            <span className="text-balance">{next.title}</span>
            <ArrowRight
              width={48}
              height={48}
              className="hidden shrink-0 transition-transform duration-500 group-hover:translate-x-2 md:block"
            />
          </p>
          <p className="mt-4 text-mute">{next.tags.slice(0, 2).join(" · ")}</p>
        </div>
        <div
          className={cn(
            "hidden aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-line md:col-span-3 md:col-start-10 md:block",
          )}
        >
          <ResponsiveImage
            image={next.cover}
            sizes="18rem"
            className="h-full transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
          />
        </div>
      </Link>
    </Container>
  );
}

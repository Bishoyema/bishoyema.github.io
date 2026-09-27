import { Container } from "@/components/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { Accent, SectionHeader } from "@/components/SectionHeader";
import { projects } from "@/data/projects";
import { cn } from "@/lib/site";

export function SelectedWork() {
  return (
    <section id="work" data-nav="work" aria-labelledby="work-title" className="border-t border-line py-24 md:py-32 lg:py-36">
      <Container>
        <SectionHeader
          id="work-title"
          index="02"
          label="Selected work"
          title={
            <>
              Selected <Accent>work</Accent>
            </>
          }
          intro="Eight pieces across AI video, advertising and social campaigns. Self-initiated work is clearly labelled as a concept project."
        />

        <div
          className={cn(
            "mt-14 grid grid-cols-1 gap-x-6 gap-y-20 md:mt-20 md:grid-cols-2 lg:gap-x-12 lg:gap-y-28",
            // The offset right column needs room below when it holds the last card.
            projects.length % 2 === 0 && "md:pb-40",
          )}
        >
          {projects.map((project, index) => (
            <Reveal key={project.slug} className={cn(index % 2 === 1 && "md:translate-y-40")}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

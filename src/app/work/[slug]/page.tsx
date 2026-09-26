import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { getNextProject, getProject, projects } from "@/data/projects";

// Only the projects listed in src/data/projects.ts exist; everything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title}: Case Study`;
  const url = `/work/${project.slug}/`;
  const image = { url: `/og/${project.slug}.jpg`, width: 1200, height: 630, alt: project.title };

  return {
    title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description: project.summary, images: [image] },
    twitter: { card: "summary_large_image", title, description: project.summary, images: [image.url] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudy project={project} next={getNextProject(slug)} />;
}

import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { getNextProject, getProject, projects } from "@/data/projects";
import { profile } from "@/data/profile";

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
  // Per-project social image when one exists in public/og/, otherwise the site-wide one.
  const custom = `/og/${project.slug}.jpg`;
  const hasCustom = existsSync(path.join(process.cwd(), "public", custom));
  const image = { url: hasCustom ? custom : "/og.jpg", width: 1200, height: 630, alt: project.title };

  return {
    title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: profile.name,
      locale: "en_US",
      url,
      title,
      description: project.summary,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: project.summary, images: [image.url] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudy project={project} next={getNextProject(slug)} />;
}

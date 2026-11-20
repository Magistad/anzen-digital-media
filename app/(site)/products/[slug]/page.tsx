import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS, projectBySlug } from "../../../../lib/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return PROJECTS.filter((item) => item.slug !== "closepath" && item.slug !== "vegas").map((item) => ({
    slug: item.slug,
  }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const project = projectBySlug(params.slug);
  if (!project || project.slug === "closepath" || project.slug === "vegas") return {};
  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: project.name,
      description: project.summary,
      url: project.href,
    },
  };
}

export default function ReleasePage({ params }: { params: Params }) {
  const project = projectBySlug(params.slug);
  if (!project || project.slug === "closepath" || project.slug === "vegas") notFound();
  const soon = project.status === "soon";

  return (
    <main id="content" className="bg-black px-4 py-24 font-display text-paper sm:px-8 md:py-28">
      <article className="hud-panel mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="hud-kicker">{project.statusLabel}</p>
        <h1 className="hud-title mt-4 text-[clamp(2.6rem,8vw,5.5rem)]">{project.name}</h1>
        <p className="mt-6 max-w-xl text-base leading-snug text-paper/80 sm:text-lg">{project.summary}</p>
        {soon ? (
          <p className="mt-4 max-w-xl text-sm leading-snug text-paper/60">
            There is nothing to open or buy yet. The page is here so the project has a home.
          </p>
        ) : (
          <p className="mt-4 max-w-xl text-sm leading-snug text-paper/60">This project is part of the studio catalog.</p>
        )}
        <div className="mt-10 flex flex-wrap gap-3 font-display text-[12px] uppercase tracking-[0.16em]">
          <Link href="/projects" className="hud-signin">
            All projects
          </Link>
          <Link href="/" className="hud-tab">
            Studio
          </Link>
        </div>
      </article>
    </main>
  );
}

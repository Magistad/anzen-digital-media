import type { Metadata } from "next";
import Link from "next/link";
import { ProjectGrid } from "../../../components/studio/ProjectGrid";

const description =
  "Projects from Anzen Digital Media. Small apps, each with its own page. None of them is the whole studio.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  openGraph: {
    title: "Projects",
    description,
    url: "/projects",
  },
};

export default function ProjectsPage() {
  return (
    <main id="content" className="brand-wash min-h-[100svh] bg-black px-4 pb-20 pt-12 font-display text-paper sm:px-8 md:pt-16">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/" className="hud-tab">
          Studio
        </Link>
        <p className="hud-kicker mt-8">Field catalog</p>
        <h1 className="hud-releases-title">Projects</h1>
        <p className="hud-releases-lead">
          Small apps from the studio. Open a live one, or read what is still on the bench.
        </p>
        <ProjectGrid />
      </div>
    </main>
  );
}

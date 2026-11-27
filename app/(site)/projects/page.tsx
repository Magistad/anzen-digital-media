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
    <main id="content" className="relative min-h-[100svh] overflow-hidden px-4 pb-20 pt-[calc(7rem+env(safe-area-inset-top))] font-display text-paper sm:px-8">
      <div className="section-art-bleed" data-slot="projects" aria-hidden="true">
        <picture>
          <source srcSet="/brand/section-projects.webp" type="image/webp" />
          <img src="/brand/section-projects.jpg" alt="" width={2400} height={1356} decoding="async" />
        </picture>
      </div>
      <div className="product-hero-shade" aria-hidden="true" />
      <div className="relative z-[1] mx-auto w-full max-w-5xl">
        <Link href="/" className="hud-tab">
          Studio
        </Link>
        <h1 className="page-title mt-8 text-[clamp(3.4rem,8vw,6rem)]">Projects</h1>
        <p className="hud-releases-lead">
          Small apps from the studio. Open a live one, or read what is still on the bench.
        </p>
        <ProjectGrid />
      </div>
    </main>
  );
}

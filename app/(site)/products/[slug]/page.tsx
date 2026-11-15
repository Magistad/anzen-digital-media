import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RELEASES, releaseBySlug } from "../../../../lib/releases";
import { STUDIO_EMAIL } from "../../../../lib/studio";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return RELEASES.filter((item) => item.slug !== "closepath").map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const release = releaseBySlug(params.slug);
  if (!release || release.slug === "closepath") return {};
  return {
    title: release.name,
    description: release.summary,
    openGraph: {
      title: release.name,
      description: release.summary,
      url: release.href,
    },
  };
}

export default function ReleasePage({ params }: { params: Params }) {
  const release = releaseBySlug(params.slug);
  if (!release || release.slug === "closepath") notFound();
  const soon = release.status === "soon";

  return (
    <main id="content" className="bg-black px-4 py-24 font-display text-paper sm:px-8 md:py-28">
      <article className="hud-panel mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="hud-kicker">{release.statusLabel}</p>
        <h1 className="hud-title mt-4 text-[clamp(2.6rem,8vw,5.5rem)]">{release.name}</h1>
        <p className="mt-6 max-w-xl text-base leading-snug text-paper/80 sm:text-lg">{release.summary}</p>
        {soon ? (
          <p className="mt-4 max-w-xl text-sm leading-snug text-paper/60">
            There is nothing to open or buy yet. The page is here so the release has a home.
          </p>
        ) : (
          <p className="mt-4 max-w-xl text-sm leading-snug text-paper/60">This release is part of the studio catalog.</p>
        )}
        <p className="mt-8 text-sm text-paper/70">
          Questions go to{" "}
          <a className="text-signal underline decoration-signal/40 underline-offset-4" href={`mailto:${STUDIO_EMAIL}`}>
            {STUDIO_EMAIL}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-display text-[12px] uppercase tracking-[0.16em]">
          <Link href="/#releases" className="hud-signin">
            All releases
          </Link>
          <Link href="/" className="hud-tab">
            Studio
          </Link>
        </div>
      </article>
    </main>
  );
}

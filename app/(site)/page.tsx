import type { Metadata } from "next";
import { HomeBands } from "../../components/studio/HomeBands";
import { StudioHero } from "../../components/studio/StudioHero";

const description = "Anzen Digital Media is an independent studio.";

export const metadata: Metadata = {
  title: { absolute: "Anzen Digital Media" },
  description,
  openGraph: {
    title: "Anzen Digital Media",
    description,
    url: "https://anzendigitalmedia.com",
  },
  twitter: {
    card: "summary",
    title: "Anzen Digital Media",
    description,
  },
};

export default function Page() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/brand/hero-poster-phone.webp"
        media="(max-width: 859px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/brand/hero-poster.webp"
        media="(min-width: 860px)"
        fetchPriority="high"
      />
      <main id="content" className="bg-black font-display text-paper">
        <StudioHero />
        <HomeBands />
      </main>
    </>
  );
}

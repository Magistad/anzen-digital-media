import type { Metadata } from "next";
import { StudioHero } from "../../components/studio/StudioHero";

const description =
  "Anzen Digital Media is an independent studio. We build and release small apps people actually use.";

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
    <main id="content" className="bg-black font-display text-paper">
      <StudioHero />
    </main>
  );
}

import type { Metadata } from "next";
import { GamingKicker, GamingShell } from "../../../components/gaming/GamingShell";
import { GamingNotes } from "../../../components/gaming/GamingNotes";
import { SectionDirectory } from "../../../components/gaming/SectionDirectory";
import { listPosts } from "../../../lib/gaming/posts";

const description =
  "LUNCHBRK notes from Javier Segura in Las Vegas. What he is actually playing, not a trailer recap.";

export const metadata: Metadata = {
  title: "Gaming",
  description,
  openGraph: {
    title: "Gaming",
    description,
    url: "/gaming",
    siteName: "Anzen Digital Media",
  },
  alternates: { canonical: "/gaming" },
  twitter: { card: "summary", title: "Gaming | Anzen Digital Media", description },
};

export default function GamingPage() {
  const posts = listPosts();
  const published = posts.filter((post) => !post.draft);
  const drafts = posts.filter((post) => post.draft);

  return (
    <GamingShell>
      <div className="gaming-frame">
        <GamingKicker href="/" label="Anzen" />
        <h1 className="page-title gaming-title">Gaming</h1>
        <p className="gaming-lead">
          I play as LUNCHBRK. These notes are from the games on my PC, written in Las Vegas. Same desk layout as Business, Tech, and Money. Not the whole company.
        </p>
        {published.length === 0 ? (
          <p className="gaming-empty">Nothing is published yet.</p>
        ) : null}
        {drafts.length > 0 ? (
          <p className="gaming-draft-link">
            Drafts are visible on this preview only.{" "}
            <a href={drafts[0].href}>{drafts[0].title}</a>
          </p>
        ) : null}
        <SectionDirectory />
        <GamingNotes />
      </div>
    </GamingShell>
  );
}

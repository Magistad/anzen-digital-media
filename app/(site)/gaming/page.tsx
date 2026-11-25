import type { Metadata } from "next";
import { GamingKicker, GamingShell } from "../../../components/gaming/GamingShell";
import { GamingNotes } from "../../../components/gaming/GamingNotes";
import { SectionDirectory } from "../../../components/gaming/SectionDirectory";
import { listPosts } from "../../../lib/gaming/posts";

const description =
  "Notes on games we play and watch, from Anzen Digital Media. News, updates, tips, ratings, and a hype tracker.";

export const metadata: Metadata = {
  title: "Gaming",
  description,
  openGraph: {
    title: "Gaming",
    description,
    url: "/gaming",
  },
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
        <p className="gaming-lead">Notes on games we play and watch.</p>
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

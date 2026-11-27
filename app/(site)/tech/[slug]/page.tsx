import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeskArticle } from "../../../../components/desk/DeskArticle";
import { draftsArePublic } from "../../../../lib/gaming/drafts";
import { getDeskPost, listDeskPosts } from "../../../../lib/desk-posts";

type Params = { slug: string };

export function generateStaticParams() {
  return listDeskPosts("tech", { includeDrafts: draftsArePublic() }).map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const post = getDeskPost("tech", params.slug);
  if (!post) return { title: "Tech", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: { title: post.title, description: post.excerpt, url: post.href, type: "article" },
    alternates: { canonical: post.href },
  };
}

export default async function TechArticle({ params }: { params: Params }) {
  const post = getDeskPost("tech", params.slug);
  if (!post) notFound();
  return <DeskArticle post={post} deskName="Tech" deskHref="/tech" />;
}

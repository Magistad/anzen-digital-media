import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeskArticle } from "../../../../components/desk/DeskArticle";
import { draftsArePublic } from "../../../../lib/gaming/drafts";
import { getDeskPost, listDeskPosts } from "../../../../lib/desk-posts";

type Params = { slug: string };

export function generateStaticParams() {
  return listDeskPosts("business", { includeDrafts: draftsArePublic() }).map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const post = getDeskPost("business", params.slug);
  if (!post) return { title: "Business", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: { title: post.title, description: post.excerpt, url: post.href, type: "article" },
    alternates: { canonical: post.href },
  };
}

export default async function BusinessArticle({ params }: { params: Params }) {
  const post = getDeskPost("business", params.slug);
  if (!post) notFound();
  return <DeskArticle post={post} deskName="Business" deskHref="/business" />;
}

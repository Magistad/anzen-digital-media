import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../../../../components/gaming/ArticleBody";
import { GamingKicker, GamingShell } from "../../../../components/gaming/GamingShell";
import { SectionDirectory } from "../../../../components/gaming/SectionDirectory";
import { draftsArePublic } from "../../../../lib/gaming/drafts";
import { formatPostDate, getPost, listPosts, listPostsInSection } from "../../../../lib/gaming/posts";
import { GAMING_SECTIONS, sectionBySlug } from "../../../../lib/gaming/sections";

type Params = { slug: string };

export function generateStaticParams() {
  const sections = GAMING_SECTIONS.map((section) => ({ slug: section.slug }));
  const posts = listPosts({ includeDrafts: draftsArePublic() }).map((post) => ({ slug: post.slug }));
  return [...sections, ...posts];
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const section = sectionBySlug(params.slug);
  if (section) {
    return {
      title: section.name,
      description: section.summary,
      openGraph: { title: section.name, description: section.summary, url: section.href },
    };
  }
  const post = getPost(params.slug);
  if (!post) {
    return { title: "Gaming", robots: { index: false, follow: false } };
  }
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: { title: post.title, description: post.excerpt, url: post.href, type: "article" },
    robots: post.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function GamingSlugPage({ params }: { params: Params }) {
  const section = sectionBySlug(params.slug);
  if (section) {
    const posts = listPostsInSection(section.slug);
    return (
      <GamingShell>
        <div className="gaming-frame">
          <GamingKicker />
          <h1 className="page-title gaming-title">{section.name}</h1>
          <p className="gaming-lead">{section.summary}</p>
          {posts.length === 0 ? (
            <p className="gaming-empty">Nothing in this section yet.</p>
          ) : (
            <ul className="gaming-index">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={post.href}>
                    <span className="gaming-index-title">
                      {post.draft ? <span className="gaming-flag">Draft</span> : null}
                      {post.title}
                    </span>
                    <span className="gaming-index-meta">
                      <span translate="no">{post.author}</span>
                      {", "}
                      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    </span>
                    {post.excerpt ? <span className="gaming-index-excerpt">{post.excerpt}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <SectionDirectory />
        </div>
      </GamingShell>
    );
  }

  const post = getPost(params.slug);
  if (!post) notFound();
  const sectionMeta = sectionBySlug(post.section);

  return (
    <GamingShell>
      <article className="gaming-frame gaming-article">
        {post.draft ? <p className="gaming-flag gaming-flag-banner">Draft</p> : null}
        <GamingKicker href={sectionMeta?.href ?? "/gaming"} label={post.sectionName} />
        <h1 className="page-title gaming-title">{post.title}</h1>
        <p className="gaming-byline">
          <span translate="no">{post.author}</span>
          {", "}
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        {post.todo ? (
          <p className="gaming-todo">
            <strong>TODO for Javier:</strong> {post.todo}
          </p>
        ) : null}
        <ArticleBody source={post.content} />
      </article>
    </GamingShell>
  );
}

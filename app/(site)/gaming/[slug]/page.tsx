import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeskCard } from "../../../../components/desk/DeskCard";
import { ArticleBody } from "../../../../components/gaming/ArticleBody";
import { GamingKicker, GamingShell } from "../../../../components/gaming/GamingShell";
import { SectionDirectory } from "../../../../components/gaming/SectionDirectory";
import { draftsArePublic } from "../../../../lib/gaming/drafts";
import { formatPostDate, getPost, listPosts, listPostsInSection } from "../../../../lib/gaming/posts";
import { GAMING_SECTIONS, sectionBySlug } from "../../../../lib/gaming/sections";
import { JsonLd } from "../../../../components/JsonLd";
import { creatorByline, isCreatorByline, PUBLISHER } from "../../../../lib/identity";
import { articleGraph } from "../../../../lib/structured-data";

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
      openGraph: { title: section.name, description: section.summary, url: section.href, siteName: PUBLISHER.name },
      twitter: { card: "summary", title: section.name, description: section.summary },
    };
  }
  const post = getPost(params.slug);
  if (!post) {
    return { title: "Gaming", robots: { index: false, follow: false } };
  }
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: isCreatorByline(post.author) ? creatorByline() : post.author, url: isCreatorByline(post.author) ? "/about" : undefined }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: post.href,
      type: "article",
      siteName: PUBLISHER.name,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: { card: "summary", title: post.title, description: post.excerpt },
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
            <ul className="desk-grid">
              {posts.map((post) => (
                <li key={post.slug}>
                  <DeskCard
                    href={post.href}
                    kicker={post.draft ? "Draft" : section.name}
                    title={post.title}
                    detail={post.excerpt}
                    meta={`${post.author}, ${formatPostDate(post.date)}`}
                  />
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
      {post.draft ? null : <JsonLd data={articleGraph(post)} />}
      <article className="gaming-frame gaming-article">
        {post.draft ? <p className="gaming-flag gaming-flag-banner">Draft</p> : null}
        <GamingKicker href={sectionMeta?.href ?? "/gaming"} label={post.sectionName} />
        <h1 className="page-title gaming-title">{post.title}</h1>
        <p className="gaming-byline">
          {isCreatorByline(post.author) ? (
            <Link href="/about" translate="no">
              {creatorByline()}
            </Link>
          ) : (
            <span translate="no">{post.author}</span>
          )}
          {", "}
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {post.updated && post.updated !== post.date ? (
            <>
              {". Updated "}
              <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
            </>
          ) : null}
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

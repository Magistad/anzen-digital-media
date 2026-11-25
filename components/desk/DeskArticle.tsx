import Link from "next/link";
import { ArticleBody } from "../gaming/ArticleBody";
import { formatDeskDate, type DeskPost } from "../../lib/desk-posts";

export async function DeskArticle({ post, deskName, deskHref }: { post: DeskPost; deskName: string; deskHref: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      address: { "@type": "PostalAddress", addressLocality: "Las Vegas", addressRegion: "NV" },
    },
    publisher: {
      "@type": "Organization",
      name: "Anzen Digital Media LLC",
      url: "https://anzendigitalmedia.com",
    },
    mainEntityOfPage: `https://anzendigitalmedia.com${post.href}`,
  };

  return (
    <main id="content" className="desk-shell">
      <article className="desk-frame">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <p className="desk-kicker">
          <Link href={deskHref}>{deskName}</Link>
        </p>
        <h1 className="desk-title">{post.title}</h1>
        <p className="desk-byline">
          <span translate="no">{post.author}</span>
          {", Las Vegas. "}
          <time dateTime={post.date}>{formatDeskDate(post.date)}</time>
        </p>
        <ArticleBody source={post.content} />
      </article>
    </main>
  );
}

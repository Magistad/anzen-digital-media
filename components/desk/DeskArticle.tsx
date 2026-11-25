import Link from "next/link";
import { ArticleBody } from "../gaming/ArticleBody";
import { formatDeskDate, type DeskPost } from "../../lib/desk-posts";

export async function DeskArticle({ post, deskName, deskHref }: { post: DeskPost; deskName: string; deskHref: string }) {
  return (
    <main id="content" className="desk-shell">
      <article className="desk-frame">
        <p className="desk-kicker">
          <Link href={deskHref}>{deskName}</Link>
        </p>
        <h1 className="desk-title">{post.title}</h1>
        <p className="desk-byline">
          <span translate="no">{post.author}</span>
          {", "}
          <time dateTime={post.date}>{formatDeskDate(post.date)}</time>
        </p>
        <ArticleBody source={post.content} />
      </article>
    </main>
  );
}

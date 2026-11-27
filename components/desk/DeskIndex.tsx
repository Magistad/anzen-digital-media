import Link from "next/link";
import type { ReactNode } from "react";
import { formatDeskDate, type DeskPostMeta } from "../../lib/desk-posts";
import { DeskCard } from "./DeskCard";

export function DeskIndex({
  name,
  lead,
  posts,
  children,
}: {
  name: string;
  lead: string;
  posts: DeskPostMeta[];
  children?: ReactNode;
}) {
  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame">
        <p className="desk-kicker">
          <Link href="/">Anzen</Link>
        </p>
        <h1 className="desk-title">{name}</h1>
        <p className="desk-lead">{lead}</p>
        {children}
        {posts.length === 0 ? <p className="desk-lead">Nothing is published in this desk yet.</p> : null}
        {posts.length > 0 ? (
          <ul className="desk-grid">
            {posts.map((post) => (
              <li key={post.href}>
                <DeskCard
                  href={post.href}
                  kicker={name}
                  title={post.title}
                  detail={post.excerpt}
                  meta={`${post.author}, ${formatDeskDate(post.date)}`}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}

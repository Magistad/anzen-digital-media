import type { Metadata } from "next";
import { DeskCard } from "../../../components/desk/DeskCard";
import { DeskIndex } from "../../../components/desk/DeskIndex";
import { listDeskPosts } from "../../../lib/desk-posts";
import { CLOSEPATH_OFFER } from "../../../lib/closepath";
import { verticalById } from "../../../lib/verticals";

const vertical = verticalById("business")!;
const description = `${vertical.summary} Trademark search notes, Nevada annual list deadlines, and Closepath.`;

export const metadata: Metadata = {
  title: vertical.name,
  description,
  openGraph: { title: vertical.name, description, url: vertical.href },
};

export default function BusinessPage() {
  const posts = listDeskPosts("business");
  return (
    <DeskIndex name={vertical.name} lead={vertical.summary} posts={posts}>
      <ul className="desk-grid">
        <li>
          <DeskCard
            href="/products/closepath"
            kicker="Product"
            title="Closepath"
            detail={`A listing-to-close book for solo residential agents. ${CLOSEPATH_OFFER}`}
          />
        </li>
        <li>
          <DeskCard
            href="/services"
            kicker="Services"
            title="Buy a service"
            detail="Trademark search, grant match report, and the Nevada annual compliance kit."
          />
        </li>
      </ul>
    </DeskIndex>
  );
}

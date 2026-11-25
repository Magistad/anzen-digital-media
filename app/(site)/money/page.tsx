import type { Metadata } from "next";
import { DeskIndex } from "../../../components/desk/DeskIndex";
import { listDeskPosts } from "../../../lib/desk-posts";
import { verticalById } from "../../../lib/verticals";

const vertical = verticalById("money")!;

export const metadata: Metadata = {
  title: vertical.name,
  description: vertical.summary,
  openGraph: { title: vertical.name, description: vertical.summary, url: vertical.href },
  alternates: { canonical: vertical.href },
};

export default function MoneyPage() {
  return <DeskIndex name={vertical.name} lead={vertical.summary} posts={listDeskPosts("money")} />;
}

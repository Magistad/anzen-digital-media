export type GamingSection = {
  slug: string;
  name: string;
  href: string;
  summary: string;
};

export const GAMING_SECTIONS: readonly GamingSection[] = [
  {
    slug: "news",
    name: "Gaming News",
    href: "/gaming/news",
    summary: "What changed in the games I am actually following.",
  },
  {
    slug: "updates",
    name: "Game Updates",
    href: "/gaming/updates",
    summary: "Patch notes, after I have played the patch.",
  },
  {
    slug: "tips",
    name: "Tips and Strategy",
    href: "/gaming/tips",
    summary: "How I play, including the mistakes.",
  },
  {
    slug: "ratings",
    name: "Game Value Ratings",
    href: "/gaming/ratings",
    summary: "Whether I would spend the money again.",
  },
  {
    slug: "hype",
    name: "Hype Tracker",
    href: "/gaming/hype",
    summary: "Hot or Not from my lobby, not from a trailer.",
  },
];

export function sectionBySlug(slug: string): GamingSection | undefined {
  return GAMING_SECTIONS.find((item) => item.slug === slug);
}

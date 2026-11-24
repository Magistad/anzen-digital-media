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
    summary: "What is going on in the games we follow.",
  },
  {
    slug: "updates",
    name: "Game Updates",
    href: "/gaming/updates",
    summary: "Patch notes and season changes, with a point of view.",
  },
  {
    slug: "tips",
    name: "Tips and Strategy",
    href: "/gaming/tips",
    summary: "How we actually play.",
  },
  {
    slug: "ratings",
    name: "Game Value Ratings",
    href: "/gaming/ratings",
    summary: "Whether a game is worth your time or money.",
  },
  {
    slug: "hype",
    name: "Hype Tracker",
    href: "/gaming/hype",
    summary: "How a game is landing with players, including Hot or Not.",
  },
];

export function sectionBySlug(slug: string): GamingSection | undefined {
  return GAMING_SECTIONS.find((item) => item.slug === slug);
}

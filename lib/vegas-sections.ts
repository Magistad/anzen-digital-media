export const VEGAS_SECTIONS = [
  { slug: "sports", title: "Sports", href: "/products/vegas/sports" },
  { slug: "shows", title: "Shows", href: "/products/vegas/shows" },
  { slug: "nightlife", title: "Nightlife", href: "/products/vegas/nightlife" },
  { slug: "conventions", title: "Conventions", href: "/products/vegas/conventions" },
  { slug: "events", title: "Events", href: "/products/vegas/events" },
] as const;

export type VegasSectionSlug = (typeof VEGAS_SECTIONS)[number]["slug"];

/** The four content desks. Gaming keeps its own routes. The others share one article pattern. */
export type VerticalId = "gaming" | "business" | "tech" | "money";

export type Vertical = {
  id: VerticalId;
  name: string;
  href: string;
  summary: string;
};

export const VERTICALS: readonly Vertical[] = [
  {
    id: "gaming",
    name: "Gaming",
    href: "/gaming",
    summary: "I play as LUNCHBRK. Notes from the games on my PC, not a press roundup.",
  },
  {
    id: "business",
    name: "Business",
    href: "/business",
    summary: "I run a Nevada LLC from Las Vegas. Trademark records, the annual list, and Closepath.",
  },
  {
    id: "tech",
    name: "Tech",
    href: "/tech",
    summary: "What I use on a laptop, and what I will not paste into a chat box.",
  },
  {
    id: "money",
    name: "Money",
    href: "/money",
    summary: "Grants I will look up, and the pitches I delete.",
  },
];

export function verticalById(id: string): Vertical | undefined {
  return VERTICALS.find((item) => item.id === id);
}

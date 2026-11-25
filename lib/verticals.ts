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
    summary: "Notes on games we play and watch.",
  },
  {
    id: "business",
    name: "Business",
    href: "/business",
    summary: "Practical notes for running a small company.",
  },
  {
    id: "tech",
    name: "Tech",
    href: "/tech",
    summary: "Tools and buying checks for everyday software.",
  },
  {
    id: "money",
    name: "Money",
    href: "/money",
    summary: "How small businesses find funding and avoid bad offers.",
  },
];

export function verticalById(id: string): Vertical | undefined {
  return VERTICALS.find((item) => item.id === id);
}

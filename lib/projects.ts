export type ProjectStatus = "live" | "soon";

/** One catalog row. The projects grid and the product route both read this. */
export type Project = {
  slug: string;
  name: string;
  href: string;
  summary: string;
  status: ProjectStatus;
  statusLabel: string;
  action: string;
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "closepath",
    name: "Closepath",
    href: "/products/closepath",
    summary: "A listing-to-close book for solo residential agents. Open it in the browser.",
    status: "live",
    statusLabel: "Live",
    action: "Open",
  },
  {
    slug: "countdown",
    name: "Countdown",
    href: "/products/countdown",
    summary: "A small countdown for a date you mean to keep. Not open yet.",
    status: "soon",
    statusLabel: "Coming soon",
    action: "Soon",
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((item) => item.slug === slug);
}

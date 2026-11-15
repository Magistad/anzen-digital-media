export type ReleaseStatus = "live" | "soon";

/** One catalog row. The homepage list and the product route both read this. */
export type Release = {
  slug: string;
  name: string;
  href: string;
  summary: string;
  status: ReleaseStatus;
  statusLabel: string;
  action: string;
};

export const RELEASES: readonly Release[] = [
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

export function releaseBySlug(slug: string): Release | undefined {
  return RELEASES.find((item) => item.slug === slug);
}

/** The release the HUD treats as the one you can open today. */
export function featuredRelease(): Release | undefined {
  return RELEASES.find((item) => item.status === "live") ?? RELEASES[0];
}

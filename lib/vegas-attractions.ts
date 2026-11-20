/**
 * Plain links until an affiliate account exists. Empty ids must not be written
 * onto URLs. Do not put a sample or fake id here.
 */

export const AFFILIATE_IDS = {
  viator: "",
  getyourguide: "",
} as const;

export type AffiliateNetwork = keyof typeof AFFILIATE_IDS | "none";

export type Attraction = {
  id: string;
  name: string;
  detail: string;
  href: string;
  network: AffiliateNetwork;
};

export const ATTRACTIONS_CHECKED = "2026-11-19";

export const ATTRACTIONS: readonly Attraction[] = [
  {
    id: "hoover",
    name: "Hoover Dam",
    detail: "Bureau of Reclamation. Hours, tours, and tickets are on their site.",
    href: "https://www.usbr.gov/lc/hooverdam/",
    network: "none",
  },
  {
    id: "grand-canyon-west",
    name: "Grand Canyon West",
    detail: "The Hualapai Tribe’s West Rim, which is not the South Rim.",
    href: "https://grandcanyonwest.com/",
    network: "none",
  },
  {
    id: "red-rock",
    name: "Red Rock Canyon",
    detail: "The conservation area. Fees and timed entry, when they apply, are on this site.",
    href: "https://www.redrockcanyonlv.org/",
    network: "none",
  },
  {
    id: "helicopter",
    name: "Helicopter night flight",
    detail: "Maverick’s Las Vegas pages. Pick the current night flight there. This link has no affiliate id.",
    href: "https://www.maverickhelicopter.com/",
    network: "viator",
  },
  {
    id: "sphere",
    name: "Sphere",
    detail: "The venue’s own schedule. Residencies change, so use this page rather than a fixed show name.",
    href: "https://www.thesphere.com/",
    network: "none",
  },
];

export function attractionHref(
  item: Attraction,
  ids: { viator: string; getyourguide: string } = AFFILIATE_IDS,
): string {
  if (item.network === "none") return item.href;
  const id = ids[item.network].trim();
  if (!id) return item.href;
  const url = new URL(item.href);
  const key = item.network === "viator" ? "pid" : "partner_id";
  url.searchParams.set(key, id);
  return url.toString();
}

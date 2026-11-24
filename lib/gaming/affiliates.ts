/**
 * Affiliate partner IDs are placeholders until Anzen is accepted
 * into each program. Do not apply from this change. Empty IDs
 * render a plain (non-affiliate) store URL.
 */
export type AffiliatePartner = {
  id: string;
  name: string;
  href: string;
};

const FANATICAL_ID = "PLACEHOLDER_FANATICAL";
const HUMBLE_ID = "PLACEHOLDER_HUMBLE";
const GMG_ID = "PLACEHOLDER_GMG";
const GOG_ID = "PLACEHOLDER_GOG";
const AMAZON_TAG = "PLACEHOLDER_AMAZON";
const NEWEGG_ID = "PLACEHOLDER_NEWEGG";
const BESTBUY_ID = "PLACEHOLDER_BESTBUY";

function hasRealId(value: string): boolean {
  return Boolean(value) && !value.startsWith("PLACEHOLDER_");
}

export const AFFILIATE_PARTNERS: readonly AffiliatePartner[] = [
  {
    id: "fanatical",
    name: "Fanatical",
    href: hasRealId(FANATICAL_ID)
      ? `https://www.fanatical.com/?ref=${encodeURIComponent(FANATICAL_ID)}`
      : "https://www.fanatical.com/",
  },
  {
    id: "humble",
    name: "Humble Bundle",
    href: hasRealId(HUMBLE_ID)
      ? `https://www.humblebundle.com/?partner=${encodeURIComponent(HUMBLE_ID)}`
      : "https://www.humblebundle.com/",
  },
  {
    id: "gmg",
    name: "Green Man Gaming",
    href: hasRealId(GMG_ID)
      ? `https://www.greenmangaming.com/?tap_a=${encodeURIComponent(GMG_ID)}`
      : "https://www.greenmangaming.com/",
  },
  {
    id: "gog",
    name: "GOG",
    href: hasRealId(GOG_ID)
      ? `https://www.gog.com/?pp=${encodeURIComponent(GOG_ID)}`
      : "https://www.gog.com/",
  },
  {
    id: "amazon",
    name: "Amazon",
    href: hasRealId(AMAZON_TAG)
      ? `https://www.amazon.com/?tag=${encodeURIComponent(AMAZON_TAG)}`
      : "https://www.amazon.com/",
  },
  {
    id: "newegg",
    name: "Newegg",
    href: hasRealId(NEWEGG_ID)
      ? `https://www.newegg.com/?cm_mmc=${encodeURIComponent(NEWEGG_ID)}`
      : "https://www.newegg.com/",
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    href: hasRealId(BESTBUY_ID)
      ? `https://www.bestbuy.com/?ref=${encodeURIComponent(BESTBUY_ID)}`
      : "https://www.bestbuy.com/",
  },
];

export const AFFILIATE_DISCLOSURE =
  "Anzen may earn a commission if you buy through links on this page, at no extra cost to you. We have not joined these programs yet, so the store links below are ordinary store pages for now.";

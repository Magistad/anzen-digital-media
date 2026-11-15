import type { MetadataRoute } from "next";
import { RELEASES } from "../lib/releases";

const origin = "https://anzendigitalmedia.com";

/** Public marketing and legal pages. The book, sign-in, checkout, and APIs stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin },
    ...RELEASES.map((release) => ({ url: `${origin}${release.href}` })),
    { url: `${origin}/terms` },
    { url: `${origin}/privacy` },
    { url: `${origin}/refunds` },
  ];
}

import type { MetadataRoute } from "next";

const origin = "https://anzendigitalmedia.com";

/** Public marketing and legal pages. The book, sign-in, checkout, and APIs stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin },
    { url: `${origin}/products/closepath` },
    { url: `${origin}/terms` },
    { url: `${origin}/privacy` },
    { url: `${origin}/refunds` },
  ];
}

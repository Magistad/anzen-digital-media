import type { MetadataRoute } from "next";

const origin = "https://anzendigitalmedia.com";

/** Public marketing pages. The book, sign-in, checkout, and APIs stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin },
    { url: `${origin}/products/closepath` },
  ];
}

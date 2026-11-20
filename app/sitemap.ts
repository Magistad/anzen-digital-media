import type { MetadataRoute } from "next";
import { PROJECTS } from "../lib/projects";

const origin = "https://anzendigitalmedia.com";

/** Public marketing and legal pages. The book, sign-in, checkout, and APIs stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: origin },
    { url: `${origin}/projects` },
    { url: `${origin}/contact` },
    ...PROJECTS.map((project) => ({ url: `${origin}${project.href}` })),
    { url: `${origin}/products/vegas/sports` },
    { url: `${origin}/products/vegas/shows` },
    { url: `${origin}/products/vegas/nightlife` },
    { url: `${origin}/products/vegas/conventions` },
    { url: `${origin}/products/vegas/events` },
    { url: `${origin}/terms` },
    { url: `${origin}/privacy` },
    { url: `${origin}/refunds` },
  ];
}

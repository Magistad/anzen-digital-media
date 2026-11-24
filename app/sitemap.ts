import type { MetadataRoute } from "next";
import { listPosts } from "../lib/gaming/posts";
import { GAMING_SECTIONS } from "../lib/gaming/sections";
import { PROJECTS } from "../lib/projects";

const origin = "https://anzendigitalmedia.com";

/** Public marketing and legal pages. The book, sign-in, checkout, and APIs stay out. Draft gaming posts stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const gaming = [
    { url: `${origin}/gaming` },
    ...GAMING_SECTIONS.map((section) => ({ url: `${origin}${section.href}` })),
    ...listPosts({ includeDrafts: false }).map((post) => ({ url: `${origin}${post.href}` })),
  ];

  return [
    { url: origin },
    { url: `${origin}/projects` },
    { url: `${origin}/contact` },
    ...PROJECTS.map((project) => ({ url: `${origin}${project.href}` })),
    ...gaming,
    { url: `${origin}/terms` },
    { url: `${origin}/privacy` },
    { url: `${origin}/refunds` },
  ];
}

import type { MetadataRoute } from "next";
import { listDeskPosts } from "../lib/desk-posts";
import { listPosts } from "../lib/gaming/posts";
import { GAMING_SECTIONS } from "../lib/gaming/sections";
import { PROJECTS } from "../lib/projects";
import { SERVICE_PAGES } from "../lib/service-copy";

const origin = "https://anzendigitalmedia.com";

/** Public marketing and legal pages. The book, sign-in, checkout, and APIs stay out. Draft gaming posts stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const gaming = [
    { url: `${origin}/gaming` },
    ...GAMING_SECTIONS.map((section) => ({ url: `${origin}${section.href}` })),
    ...listPosts({ includeDrafts: false }).map((post) => ({ url: `${origin}${post.href}` })),
  ];

  const desks = (["business", "tech", "money"] as const).flatMap((vertical) => [
    { url: `${origin}/${vertical}` },
    ...listDeskPosts(vertical, { includeDrafts: false }).map((post) => ({ url: `${origin}${post.href}` })),
  ]);

  return [
    { url: origin },
    { url: `${origin}/projects` },
    { url: `${origin}/contact` },
    ...PROJECTS.map((project) => ({ url: `${origin}${project.href}` })),
    ...gaming,
    ...desks,
    { url: `${origin}/services` },
    ...SERVICE_PAGES.map((page) => ({ url: `${origin}/services/${page.slug}` })),
    { url: `${origin}/faq` },
    { url: `${origin}/terms` },
    { url: `${origin}/privacy` },
    { url: `${origin}/refunds` },
  ];
}

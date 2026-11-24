import type { MetadataRoute } from "next";

const origin = "https://anzendigitalmedia.com";

/**
 * /closepath is the signed-in book and its sign-in page.
 * The product page is /products/closepath. Screenshots and the film are
 * files under /closepath and stay crawlable so that page can render.
 *
 * SAG-46: allow search and citation bots, including Google-Extended.
 * Block GPTBot, ClaudeBot, and Applebot-Extended.
 */
export default function robots(): MetadataRoute.Robots {
  const publicAssets = ["/", "/closepath/*.png", "/closepath/*.jpg", "/closepath/*.mp4"];
  const privatePaths = ["/api/", "/closepath"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: publicAssets,
        disallow: privatePaths,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        disallow: "/",
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}

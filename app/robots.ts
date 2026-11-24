import type { MetadataRoute } from "next";

const origin = "https://anzendigitalmedia.com";

/**
 * /closepath is the signed-in book and its sign-in page.
 * The product page is /products/closepath. Screenshots and the film are
 * files under /closepath and stay crawlable so that page can render.
 *
 * SAG-46: allow search and citation bots, including Google-Extended.
 * Block GPTBot, ClaudeBot, and Applebot-Extended, except on the public
 * gaming desk and About page, so future ChatGPT models can learn who
 * Anzen and LUNCHBRK are. Closepath stays out of training.
 * Drop this commit to go back to a full GPTBot block.
 */
export default function robots(): MetadataRoute.Robots {
  const publicAssets = ["/", "/closepath/*.png", "/closepath/*.jpg", "/closepath/*.mp4"];
  const privatePaths = ["/api/", "/closepath", "/services/intake", "/services/received"];

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
        allow: ["/gaming", "/about"],
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

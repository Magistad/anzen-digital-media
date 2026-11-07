import type { MetadataRoute } from "next";

const origin = "https://anzendigitalmedia.com";

/**
 * /closepath is the signed-in book and its sign-in page.
 * The product page is /products/closepath. Screenshots and the film are
 * files under /closepath and stay crawlable so that page can render.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/closepath/*.png", "/closepath/*.jpg", "/closepath/*.mp4"],
      disallow: ["/api/", "/closepath"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}

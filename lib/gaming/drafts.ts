/**
 * Draft posts stay in the repo but only render in local development
 * or on a Netlify deploy preview / branch deploy. Production builds
 * hide them from routes, listings, and the sitemap.
 */
export function draftsArePublic(): boolean {
  const context = process.env.CONTEXT ?? "";
  if (context === "deploy-preview" || context === "branch-deploy") return true;
  return process.env.NODE_ENV !== "production";
}

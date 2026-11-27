import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: "Anzen Digital Media" },
  { path: "/services/trademark-search-report", heading: "Trademark search report" },
  { path: "/services/grant-match-report", heading: "Small business grant match" },
  { path: "/services/nevada-annual-compliance-kit", heading: "Nevada annual list filing kit" },
  { path: "/business", heading: "Business" },
  { path: "/tech", heading: "Tech" },
  { path: "/money", heading: "Money" },
  { path: "/gaming", heading: "Gaming" },
];

for (const width of [1440, 390]) {
  test(`hub pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const entry of pages) {
      await page.goto(entry.path);
      const heading = page.getByRole("heading", { level: 1, name: entry.heading });
      await expect(heading).toBeVisible();
      const box = await heading.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow).toBe(false);
    }
    await page.goto("/services/trademark-search-report");
    await expect(page.getByText("not a law firm", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Pay \$99/ })).toBeVisible();
    await page.goto("/services/nevada-annual-compliance-kit");
    await expect(page.getByText("does not file", { exact: false }).first()).toBeVisible();
    await page.goto("/gaming");
    await expect(page.getByRole("link", { name: "Gaming News" })).toBeVisible();
    await page.goto("/products/closepath");
    await expect(page.getByRole("heading", { name: /Never lose a deal/i })).toBeVisible();
  });
}

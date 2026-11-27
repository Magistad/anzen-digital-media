import { expect, test } from "@playwright/test";

/**
 * Read-only checks against the public site.
 * These tests never submit checkout, sign-in, or any other form.
 */

test.beforeEach(async ({ page }) => {
  page.on("request", (request) => {
    const url = request.url();
    expect(url.includes("/api/checkout"), `smoke test must not call checkout: ${url}`).toBe(false);
    expect(request.method(), url).not.toBe("POST");
  });
});

test("/ responds and renders the studio homepage", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Anzen Digital Media");
  await expect(page.getByRole("heading", { level: 1, name: "Anzen Digital Media" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
});

const pages: { path: string; text: string }[] = [
  { path: "/products/closepath", text: "Never lose a deal" },
  { path: "/closepath/sign-in", text: "Open your book." },
  { path: "/terms", text: "Terms" },
  { path: "/privacy", text: "Privacy" },
  { path: "/refunds", text: "Refund" },
];

for (const entry of pages) {
  test(`${entry.path} responds and renders`, async ({ page }) => {
    const response = await page.goto(entry.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(entry.text);
  });
}

test("the product page offers checkout without starting it", async ({ page }) => {
  await page.goto("/products/closepath");
  const trial = page.getByRole("button", { name: "Start free trial" });
  const soon = page.getByText("Checkout coming soon");
  await expect(trial.or(soon).first()).toBeVisible();
});

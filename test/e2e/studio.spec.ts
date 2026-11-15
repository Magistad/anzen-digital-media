import { expect, test } from "@playwright/test";

test.describe("studio homepage", () => {
  test("reads as a studio and links each release", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Strange little things people actually use" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Releases" })).toBeVisible();

    const closepath = page.getByRole("link", { name: /Closepath/i });
    expect(await closepath.count()).toBeGreaterThan(1);
    const closepathCount = await closepath.count();
    for (let index = 0; index < closepathCount; index += 1) {
      await expect(closepath.nth(index)).toHaveAttribute("href", "/products/closepath");
    }

    const countdown = page.getByRole("link", { name: /Countdown/i });
    await expect(countdown).toHaveAttribute("href", "/products/countdown");
    await expect(countdown).toContainText("Coming soon");

    const mail = page.getByRole("link", { name: "contact@anzendigitalmedia.com" });
    expect(await mail.count()).toBeGreaterThan(0);
    const mailCount = await mail.count();
    for (let index = 0; index < mailCount; index += 1) {
      await expect(mail.nth(index)).toHaveAttribute("href", "mailto:contact@anzendigitalmedia.com");
    }
    await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(page.getByRole("link", { name: "Refunds" })).toHaveAttribute("href", "/refunds");

    const hero = page.locator(".hud-hero");
    await expect(hero).toBeVisible();
    await expect(hero.locator(".hud-portal svg")).toBeVisible();
    const background = await hero.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).toBe("rgb(0, 0, 0)");

    const grain = page.getByRole("button", { name: /grain/i });
    await expect(grain).toHaveAttribute("aria-pressed", "true");
    await grain.click();
    await expect(grain).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("link", { name: "Releases", exact: true }).click();
    await expect(page.locator("#releases")).toBeInViewport();

    await page.goto("/products/countdown");
    await expect(page.getByRole("heading", { level: 1, name: "Countdown" })).toBeVisible();
    await expect(page.getByText("Coming soon").first()).toBeVisible();
    await expect(page.getByText("There is nothing to open or buy yet.")).toBeVisible();

    await page.goto("/products/closepath");
    await expect(page.getByRole("heading", { name: /Never lose a deal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start free trial" }).first()).toBeVisible();

    const missing = await page.goto("/products/not-a-release");
    expect(missing?.status()).toBe(404);
  });

  test("mobile layout keeps the headline, portal, and releases on screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);

    await expect(page.locator(".hud-portal")).toBeVisible();
    await expect(page.getByRole("link", { name: /Releases/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Closepath/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Countdown/i })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);

    await page.locator("#releases").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Releases" })).toBeVisible();
  });
});

test.describe("studio homepage with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("headline and releases stay visible without the intro", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const opacity = await heading.evaluate((element) => getComputedStyle(element).opacity);
    expect(Number(opacity)).toBeGreaterThan(0.9);
    await expect(page.getByRole("link", { name: /Countdown/i })).toBeVisible();
    await expect(page.locator(".hud-portal svg")).toBeVisible();
  });
});

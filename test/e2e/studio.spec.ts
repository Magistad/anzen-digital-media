import { expect, test } from "@playwright/test";

test.describe("studio homepage", () => {
  test("reads as a studio and keeps projects equal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Strange little things people actually use" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Closepath", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Closepath/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);

    const projects = page.getByRole("link", { name: /^Projects/i });
    expect(await projects.count()).toBeGreaterThan(0);
    const projectCount = await projects.count();
    for (let index = 0; index < projectCount; index += 1) {
      await expect(projects.nth(index)).toHaveAttribute("href", "/projects");
    }

    await expect(page.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
      "href",
      "mailto:contact@anzendigitalmedia.com",
    );
    await expect(page.getByRole("link", { name: /Reach out/i })).toHaveAttribute(
      "href",
      "mailto:contact@anzendigitalmedia.com",
    );

    const mail = page.getByRole("link", { name: "contact@anzendigitalmedia.com" });
    expect(await mail.count()).toBeGreaterThan(0);
    await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(page.getByRole("link", { name: "Refunds" })).toHaveAttribute("href", "/refunds");

    const hero = page.locator(".hud-hero");
    await expect(hero).toBeVisible();
    const background = await hero.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).toBe("rgb(0, 0, 0)");

    const grain = page.getByRole("button", { name: /grain/i });
    await grain.click();
    await expect(grain).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".hud-sweep")).toBeHidden();

    await page.getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

    const cards = page.locator(".project-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute("href", "/products/closepath");
    await expect(cards.nth(0)).toContainText("Live");
    await expect(cards.nth(1)).toHaveAttribute("href", "/products/countdown");
    await expect(cards.nth(1)).toContainText("Coming soon");

    await cards.nth(1).click();
    await expect(page.getByRole("heading", { level: 1, name: "Countdown" })).toBeVisible();
    await expect(page.getByText("There is nothing to open or buy yet.")).toBeVisible();

    await page.goto("/projects");
    await cards.nth(0).click();
    await expect(page.getByRole("heading", { name: /Never lose a deal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start free trial" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

    await page.goto("/releases");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

    const missing = await page.goto("/products/not-a-release");
    expect(missing?.status()).toBe(404);
  });

  test("mobile layout keeps the HUD and the project grid on screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    await expect(page.getByRole("link", { name: /Projects/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Reach out/i })).toBeVisible();

    const homeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(homeOverflow).toBe(false);

    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Closepath/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Countdown/i })).toBeVisible();
    const gridOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(gridOverflow).toBe(false);
  });
});

test.describe("studio homepage with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("headline and project cards stay visible without the intro", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const opacity = await heading.evaluate((element) => getComputedStyle(element).opacity);
    expect(Number(opacity)).toBeGreaterThan(0.9);
    await page.goto("/projects");
    await expect(page.locator(".project-card")).toHaveCount(2);
  });
});

import { expect, test } from "@playwright/test";

const EMAIL = "contact@anzendigitalmedia.com";

test.describe("studio homepage", () => {
  test("keeps one path to projects and one path to the form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "We make cool shit" })).toBeVisible();
    await expect(page.locator(".hud-portal-name")).toContainText("Anzen");
    await expect(page.locator(".hud-portal-name")).toContainText("Digital");
    await expect(page.locator(".hud-portal-name")).toContainText("Media");
    await expect(page.getByText("Independent studio")).toHaveCount(0);
    await expect(page.getByText(EMAIL)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Closepath/i })).toHaveCount(0);

    const projects = page.getByRole("link", { name: /^Projects/i });
    await expect(projects).toHaveCount(1);
    await expect(projects).toHaveAttribute("href", "/projects");

    const contact = page.getByRole("link", { name: /^Contact/i });
    await expect(contact).toHaveCount(1);
    await expect(contact).toHaveAttribute("href", "/contact");

    await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(page.getByRole("link", { name: "Refunds" })).toHaveAttribute("href", "/refunds");

    const grain = page.getByRole("button", { name: /grain/i });
    await grain.click();
    await expect(grain).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".hud-sweep")).toBeHidden();

    await page.goto("/contact");
    await expect(page.getByText(EMAIL)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Studio" })).toHaveAttribute("href", "/");
    const form = page.locator("form[name='contact']");
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
    await expect(form.locator("input[name='name']")).toBeVisible();
    await expect(form.locator("input[name='email']")).toBeVisible();
    await expect(form.locator("textarea[name='message']")).toBeVisible();
    await expect(form.locator("input[name='bot-field']")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();

    await page.goto("/contact?sent=1");
    await expect(page.getByRole("status")).toHaveText("Message sent. We will read it.");
    await expect(page.getByText(EMAIL)).toHaveCount(0);

    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    await expect(page.getByText(EMAIL)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
    const home = page.getByRole("link", { name: "Studio" });
    await expect(home).toHaveCount(1);
    await expect(home).toHaveAttribute("href", "/");

    const cards = page.locator(".project-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toHaveAttribute("href", "/products/closepath");
    await expect(cards.nth(0)).toContainText("Live");
    await expect(cards.nth(1)).toHaveAttribute("href", "/products/countdown");
    await expect(cards.nth(1)).toContainText("Coming soon");

    await cards.nth(1).click();
    await expect(page.getByRole("heading", { level: 1, name: "Countdown" })).toBeVisible();

    await page.goto("/projects");
    await cards.nth(0).click();
    await expect(page.getByRole("heading", { name: /Never lose a deal/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start free trial" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByText(EMAIL).first()).toBeVisible();

    await page.goto("/releases");
    await expect(page).toHaveURL(/\/projects$/);
  });

  test("mobile layout shows projects and contact once", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1, name: "We make cool shit" });
    await expect(heading).toBeVisible();
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    await expect(page.getByRole("link", { name: /^Projects/i })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /^Contact/i })).toHaveCount(1);
    await expect(page.getByText(EMAIL)).toHaveCount(0);

    const homeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(homeOverflow).toBe(false);

    await page.goto("/projects");
    await expect(page.getByRole("link", { name: "Studio" })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Closepath/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Countdown/i })).toBeVisible();
    const gridOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(gridOverflow).toBe(false);

    await page.goto("/contact");
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
    const formOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(formOverflow).toBe(false);
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

import { expect, test } from "@playwright/test";

test("projects card opens Vegas Right Now on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  const card = page.getByRole("link", { name: /Vegas Right Now/i });
  await expect(card).toHaveAttribute("href", "/products/vegas");
  await card.click();
  await expect(page).toHaveURL(/\/products\/vegas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Vegas Right Now" })).toBeVisible();
  const banner = page.getByRole("banner");
  await expect(banner).not.toContainText("contact@anzendigitalmedia.com");
  await expect(banner.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");

  const questions = page.locator("#vegas-questions").getByRole("heading", { level: 3 });
  await expect(questions).toHaveCount(15);

  const waitlist = page.locator("form[name='vegas-waitlist']");
  await expect(waitlist).toBeVisible();
  await expect(waitlist).toHaveAttribute("data-netlify", "true");
  await expect(waitlist).toHaveAttribute("data-netlify-honeypot", "bot-field");
  await expect(waitlist.locator("input[name='bot-field']")).toHaveCount(1);
  await expect(waitlist.locator("input[name='email']")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Vegas locals and visitors community/i })).toBeVisible();

  const ask = page.locator("form[name='vegas-ask-a-local']");
  await expect(ask).toBeVisible();
  await expect(ask.locator("input[name='bot-field']")).toHaveCount(1);
  await expect(ask.locator("textarea[name='question']")).toBeVisible();

  const tip = page.locator("form[name='vegas-local-tip']");
  await expect(tip).toBeVisible();
  await expect(tip.locator("input[name='bot-field']")).toHaveCount(1);
  await expect(tip.locator("textarea[name='tip']")).toBeVisible();
  await expect(tip.locator("input[name='area']")).toBeVisible();

  await expect(page.getByText(/No community answers yet/i)).toBeVisible();
  await expect(page.getByText("Some links may earn us a commission at no extra cost to you.").first()).toBeVisible();
  await expect(page.getByText("This is not a live incident feed.")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Tonight and This Week" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Know Before You Go" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From Locals" })).toBeVisible();
  const hubOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hubOverflow).toBe(false);

  for (const [path, heading] of [
    ["/products/vegas/sports", "Sports"],
    ["/products/vegas/shows", "Shows"],
    ["/products/vegas/nightlife", "Nightlife"],
    ["/products/vegas/conventions", "Conventions"],
    ["/products/vegas/events", "Events"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "This week" })).toBeVisible();
    await expect(page.getByText("Some links may earn us a commission at no extra cost to you.").first()).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text.includes("\u2014")).toBe(false);
    expect(text.toLowerCase().includes("real-time")).toBe(false);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  }
});

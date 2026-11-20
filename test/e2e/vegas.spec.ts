import { expect, test } from "@playwright/test";

test("projects card opens Vegas Right Now on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  const card = page.getByRole("link", { name: /Vegas Right Now/i });
  await expect(card).toHaveAttribute("href", "/products/vegas");
  await card.click();
  await expect(page).toHaveURL(/\/products\/vegas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Vegas Right Now" })).toBeVisible();

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
  await expect(page.getByText("Some links may earn us a commission at no extra cost to you.")).toBeVisible();
  await expect(page.getByText("This is not a live incident feed.")).toBeVisible();

  const text = await page.locator("main").innerText();
  expect(text.includes("\u2014")).toBe(false);
  expect(text.toLowerCase().includes("real-time")).toBe(false);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
});

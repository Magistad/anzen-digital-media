import { rm } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD, TEST_SESSION_ID } from "../constants";
import { e2eDataDir } from "../e2e-store";

test.beforeEach(async () => {
  await rm(e2eDataDir(), { recursive: true, force: true });
});

async function buyerJourney(page: Page) {
  await page.route("https://checkout.stripe.com/**", (route) => route.abort());
  await page.goto("/products/closepath");
  const trial = page.getByRole("button", { name: "Start free trial" }).first();
  await expect(trial).toBeVisible();

  const checkout = page.waitForRequest((request) => request.url().startsWith("https://checkout.stripe.com/"));
  await trial.click();
  const request = await checkout;
  expect(request.url()).toContain(TEST_SESSION_ID);

  await page.goto(`/products/closepath/success?session_id=${TEST_SESSION_ID}`);
  await expect(page.getByRole("heading", { name: "Open Closepath." })).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel("Confirm password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Open Closepath" }).click();
  await page.waitForURL(/\/closepath$/);
  await expect(page.getByRole("heading", { name: "This morning" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/closepath\/sign-in/);
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/closepath$/);
  await expect(page.getByRole("heading", { name: "This morning" })).toBeVisible();

  await page.getByRole("button", { name: "Files" }).click();
  await page.getByRole("button", { name: "Add a file" }).click();
  await page.getByLabel("Address").fill("18 Test Street");
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Address")).toHaveValue("18 Test Street");
}

test("a buyer starts checkout, opens the book, signs in, and writes a file", async ({ page }) => {
  await buyerJourney(page);
  await rm(e2eDataDir(), { recursive: true, force: true });
  await buyerJourney(page);
});

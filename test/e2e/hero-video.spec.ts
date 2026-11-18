import { devices, expect, test, type Page } from "@playwright/test";

async function videoAdvances(page: Page, source: RegExp) {
  const video = page.locator("video.hero-media-video");
  await expect(video).toHaveCount(1);
  await expect(page.getByRole("button", { name: /background/i })).toBeVisible();
  await page.waitForFunction(
    (pattern) => {
      const node = document.querySelector("video.hero-media-video");
      if (!(node instanceof HTMLVideoElement)) return false;
      return node.readyState >= 2 && pattern.test(node.currentSrc);
    },
    source,
    { timeout: 20_000 },
  );
  const start = await video.evaluate((node) => (node as HTMLVideoElement).currentTime);
  await page.waitForFunction(
    (from) => {
      const node = document.querySelector("video.hero-media-video");
      return node instanceof HTMLVideoElement && node.currentTime > from + 0.15;
    },
    start,
    { timeout: 8_000 },
  );
}

test("desktop hero plays the wide loop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await videoAdvances(page, /\/brand\/hero-loop\.(webm|mp4)(?:\?|$)/);
  const box = await page.locator("video.hero-media-video").boundingBox();
  expect(box && box.width).toBeGreaterThan(800);
});

test.describe("reduced motion still plays the hero", () => {
  test.use({ reducedMotion: "reduce" });

  test("desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await videoAdvances(page, /\/brand\/hero-loop\.(webm|mp4)(?:\?|$)/);
  });

  test("Pixel 7", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto("/");
    await videoAdvances(page, /\/brand\/hero-loop-phone\.(webm|mp4)(?:\?|$)/);
    await context.close();
  });
});

test("Pixel 7 hero plays the vertical loop", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  await page.goto("/");
  await videoAdvances(page, /\/brand\/hero-loop-phone\.(webm|mp4)(?:\?|$)/);
  const box = await page.locator("video.hero-media-video").boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.height).toBeGreaterThan(box.width);
  await context.close();
});

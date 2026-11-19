import { inflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { devices, expect, test, type Browser, type Page } from "@playwright/test";

const BASE = "http://127.0.0.1:3210";

type Motion = "reduce" | "no-preference";

function paeth(left: number, up: number, upLeft: number) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function decodePng(buffer: Buffer) {
  if (buffer.toString("ascii", 1, 4) !== "PNG") throw new Error("screenshot is not a png");
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idat: Buffer[] = [];
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[10] !== 0) throw new Error("unsupported png");
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : 0;
  if (!channels || !width || !height) throw new Error(`unsupported png color ${colorType}`);
  const inflated = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let input = 0;
  for (let y = 0; y < height; y++) {
    const filter = inflated[input++];
    const row = inflated.subarray(input, input + stride);
    input += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      let value = row[x];
      if (filter === 1) value = (value + left) & 255;
      else if (filter === 2) value = (value + up) & 255;
      else if (filter === 3) value = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) value = (value + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error(`unsupported png filter ${filter}`);
      pixels[y * stride + x] = value;
    }
  }
  return { width, height, channels, pixels };
}

function changedPixelRatio(first: Buffer, second: Buffer) {
  const a = decodePng(first);
  const b = decodePng(second);
  if (a.width !== b.width || a.height !== b.height || a.channels !== b.channels) {
    throw new Error("hero screenshots differ in size");
  }
  let changed = 0;
  const total = a.width * a.height;
  for (let pixel = 0; pixel < total; pixel++) {
    const start = pixel * a.channels;
    const delta = Math.max(
      Math.abs(a.pixels[start] - b.pixels[start]),
      Math.abs(a.pixels[start + 1] - b.pixels[start + 1]),
      Math.abs(a.pixels[start + 2] - b.pixels[start + 2]),
    );
    if (delta > 18) changed += 1;
  }
  return changed / total;
}

async function expectVisiblePlayingVideo(page: Page, source: RegExp, shotName: string) {
  const video = page.locator("video.hero-media-video");
  await expect(video).toHaveCount(1);
  await expect(page.getByRole("button", { name: /background/i })).toBeVisible();
  await page.waitForFunction(
    (pattern) => {
      const hero = document.querySelector("section.hud-hero");
      const node = document.querySelector("video.hero-media-video");
      const still = document.querySelector(".hero-media-still");
      if (!(hero instanceof HTMLElement) || !(node instanceof HTMLVideoElement) || !(still instanceof Element)) {
        return false;
      }
      const videoStyle = getComputedStyle(node);
      const stillStyle = getComputedStyle(still);
      const videoZ = Number.parseFloat(videoStyle.zIndex);
      const stillZ = Number.parseFloat(stillStyle.zIndex);
      const stillHidden =
        stillStyle.display === "none" ||
        stillStyle.visibility === "hidden" ||
        Number.parseFloat(stillStyle.opacity) === 0 ||
        (Number.isFinite(videoZ) && Number.isFinite(stillZ) && videoZ > stillZ && videoStyle.opacity === "1");
      return (
        hero.dataset.video === "ready" &&
        videoStyle.opacity === "1" &&
        stillHidden &&
        !node.paused &&
        node.readyState >= 2 &&
        pattern.test(node.currentSrc)
      );
    },
    source,
    { timeout: 20_000 },
  );

  const media = page.locator(".hero-media");
  const first = await media.screenshot({ animations: "disabled" });
  await page.waitForTimeout(3_000);
  const second = await media.screenshot({ animations: "disabled" });
  const ratio = changedPixelRatio(first, second);
  console.log(`${shotName} pixel diff ${(ratio * 100).toFixed(2)}%`);
  expect(ratio).toBeGreaterThan(0.004);

  try {
    await mkdir("/opt/cursor/artifacts", { recursive: true });
    await writeFile(`/opt/cursor/artifacts/${shotName}-a.png`, first);
    await writeFile(`/opt/cursor/artifacts/${shotName}-b.png`, second);
  } catch {
    // Artifact copies are for the local report. CI only needs the assertions above.
  }
}

async function openHero(browser: Browser, motion: Motion, phone: boolean) {
  const context = await browser.newContext({
    ...(phone ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }),
    reducedMotion: motion,
    baseURL: BASE,
  });
  const page = await context.newPage();
  await page.goto("/");
  return { context, page };
}

const cases: Array<{ name: string; motion: Motion; phone: boolean; source: RegExp }> = [
  {
    name: "desktop-1440-no-preference",
    motion: "no-preference",
    phone: false,
    source: /\/brand\/hero-loop\.(webm|mp4)(?:\?|$)/,
  },
  {
    name: "desktop-1440-reduce",
    motion: "reduce",
    phone: false,
    source: /\/brand\/hero-loop\.(webm|mp4)(?:\?|$)/,
  },
  {
    name: "pixel7-no-preference",
    motion: "no-preference",
    phone: true,
    source: /\/brand\/hero-loop-phone\.(webm|mp4)(?:\?|$)/,
  },
  {
    name: "pixel7-reduce",
    motion: "reduce",
    phone: true,
    source: /\/brand\/hero-loop-phone\.(webm|mp4)(?:\?|$)/,
  },
];

for (const item of cases) {
  test(`hero video is visible and moving: ${item.name}`, async ({ browser }) => {
    test.setTimeout(45_000);
    const { context, page } = await openHero(browser, item.motion, item.phone);
    try {
      await expectVisiblePlayingVideo(page, item.source, item.name);
      const box = await page.locator("video.hero-media-video").boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;
      if (item.phone) expect(box.height).toBeGreaterThan(box.width);
      else expect(box.width).toBeGreaterThan(800);
    } finally {
      await context.close();
    }
  });
}

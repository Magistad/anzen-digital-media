import { defineConfig } from "@playwright/test";

const smoke = process.env.SMOKE_ONLY === "1";
const live = process.env.SMOKE_BASE_URL ?? "https://anzendigitalmedia.com";

export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  projects: smoke
    ? [{ name: "smoke", testDir: "test/smoke" }]
    : [{ name: "e2e", testDir: "test/e2e" }],
  use: {
    baseURL: smoke ? live : "http://127.0.0.1:3210",
    trace: "retain-on-failure",
  },
  webServer: smoke
    ? undefined
    : {
        command: "npx tsx test/e2e-server.ts",
        url: "http://127.0.0.1:3210/products/closepath",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

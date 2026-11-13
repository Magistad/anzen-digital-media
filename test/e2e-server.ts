import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import {
  TEST_PRICE_ID,
  TEST_SESSION_SECRET,
  TEST_STRIPE_KEY,
  TEST_WEBHOOK_SECRET,
} from "./constants";
import { e2eDataDir } from "./e2e-store";
import { startStripeMock } from "./stripe-mock";

const NETLIFY_ENV = [
  "NETLIFY",
  "NETLIFY_BLOBS_CONTEXT",
  "NETLIFY_SITE_ID",
  "NETLIFY_AUTH_TOKEN",
] as const;

async function main() {
  const mock = await startStripeMock(12111);
  const dataDir = e2eDataDir();
  await rm(dataDir, { recursive: true, force: true });

  const env = { ...process.env };
  for (const name of NETLIFY_ENV) delete env[name];
  const next = spawn(
    path.join(process.cwd(), "node_modules", ".bin", "next"),
    ["start", "--hostname", "127.0.0.1", "--port", "3210"],
    {
      stdio: "inherit",
      env: {
        ...env,
        CLOSEPATH_DATA_DIR: dataDir,
        STRIPE_SECRET_KEY: TEST_STRIPE_KEY,
        STRIPE_PRICE_ID: TEST_PRICE_ID,
        STRIPE_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
        STRIPE_API_HOST: "127.0.0.1",
        STRIPE_API_PORT: String(mock.port),
        CLOSEPATH_SESSION_SECRET: TEST_SESSION_SECRET,
      },
    },
  );

  let closing = false;
  async function shutdown(code: number) {
    if (closing) return;
    closing = true;
    next.kill("SIGTERM");
    await mock.close().catch(() => undefined);
    await rm(dataDir, { recursive: true, force: true });
    process.exit(code);
  }

  process.on("SIGTERM", () => {
    void shutdown(0);
  });
  process.on("SIGINT", () => {
    void shutdown(0);
  });
  next.on("exit", (code) => {
    void shutdown(code ?? 0);
  });
}

void main().catch(() => {
  process.exit(1);
});

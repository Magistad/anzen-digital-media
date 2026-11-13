import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import {
  TEST_PRICE_ID,
  TEST_SESSION_SECRET,
  TEST_STRIPE_KEY,
  TEST_WEBHOOK_SECRET,
} from "./constants";
import { startStripeMock } from "./stripe-mock";

async function main() {
  const mock = await startStripeMock(12111);
  await rm(path.join(process.cwd(), ".data", "closepath"), { recursive: true, force: true });

  const next = spawn(
    path.join(process.cwd(), "node_modules", ".bin", "next"),
    ["start", "--hostname", "127.0.0.1", "--port", "3210"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        STRIPE_SECRET_KEY: TEST_STRIPE_KEY,
        STRIPE_PRICE_ID: TEST_PRICE_ID,
        STRIPE_WEBHOOK_SECRET: TEST_WEBHOOK_SECRET,
        STRIPE_API_HOST: "127.0.0.1",
        STRIPE_API_PORT: String(mock.port),
        CLOSEPATH_SESSION_SECRET: TEST_SESSION_SECRET,
      },
    },
  );

  function stop(signal: NodeJS.Signals) {
    next.kill(signal);
    void mock.close();
  }

  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));
  next.on("exit", (code) => {
    void mock.close().finally(() => process.exit(code ?? 0));
  });
}

void main().catch(() => {
  process.exit(1);
});

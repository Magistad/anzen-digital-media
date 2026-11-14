import os from "node:os";
import path from "node:path";

/** Temporary books for Playwright. Never the developer directory `.data/closepath`. */
export function e2eDataDir(): string {
  return path.join(os.tmpdir(), "closepath-playwright");
}

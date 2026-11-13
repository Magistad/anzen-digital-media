import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { getClosepathBinaryStore, getClosepathStore } from "./closepath-store";

const KEYS = ["NETLIFY", "NETLIFY_BLOBS_CONTEXT", "NETLIFY_SITE_ID", "NETLIFY_AUTH_TOKEN", "CLOSEPATH_DATA_DIR"] as const;

test("an isolated data directory ignores Netlify and the developer book directory", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "closepath-store-"));
  const previous = new Map<string, string | undefined>();
  for (const key of KEYS) previous.set(key, process.env[key]);
  process.env.NETLIFY = "true";
  process.env.NETLIFY_BLOBS_CONTEXT = "production";
  process.env.NETLIFY_SITE_ID = "site_test_not_real";
  process.env.NETLIFY_AUTH_TOKEN = "token_test_not_real";
  process.env.CLOSEPATH_DATA_DIR = dir;
  try {
    const key = "account:isolated@example.com";
    await getClosepathStore().set(key, "{\"email\":\"isolated@example.com\"}");
    const filename = Buffer.from(key, "utf8").toString("base64url");
    const stored = await readFile(path.join(dir, "closepath", filename), "utf8");
    assert.equal(stored.includes("isolated@example.com"), true);
    await assert.rejects(readFile(path.join(process.cwd(), ".data", "closepath", filename)));

    await getClosepathBinaryStore().set("photo:1", {
      data: Uint8Array.from([1, 2, 3]),
      contentType: "image/png",
      filename: "note.png",
    });
    const photo = await getClosepathBinaryStore().get("photo:1");
    assert.equal(photo?.filename, "note.png");
    assert.deepEqual(await getClosepathBinaryStore().list("photo:"), ["photo:1"]);
  } finally {
    for (const key of KEYS) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(dir, { recursive: true, force: true });
  }
});

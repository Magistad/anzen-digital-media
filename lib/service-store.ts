import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { getStore } from "@netlify/blobs";
import { readEnv } from "./env";
import type { KeyValueStore } from "./closepath-store";

const STORE_NAME = "service-orders";

let testStore: KeyValueStore | null = null;
let diskStore: KeyValueStore | null = null;

/** Tests inject a memory store so they never touch Netlify or the disk. */
export function setServiceStore(store: KeyValueStore | null): void {
  testStore = store;
}

function dataRoot(): string {
  return readEnv("CLOSEPATH_DATA_DIR") ?? path.join(process.cwd(), ".data");
}

function diskPath(key: string): string {
  const safe = Buffer.from(key, "utf8").toString("base64url");
  return path.join(dataRoot(), STORE_NAME, safe);
}

function isNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function onNetlify(): boolean {
  return process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
}

function createDiskStore(): KeyValueStore {
  return {
    async get(key) {
      try {
        return await readFile(diskPath(key), "utf8");
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    async set(key, value) {
      const file = diskPath(key);
      await mkdir(path.dirname(file), { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      await writeFile(temporary, value, "utf8");
      await rename(temporary, file);
    },
    async delete(key) {
      await rm(diskPath(key), { force: true });
    },
  };
}

function netlifyStore(): KeyValueStore {
  const siteID = process.env.NETLIFY_SITE_ID?.trim();
  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();
  const store =
    siteID && token
      ? getStore({ name: STORE_NAME, siteID, token, consistency: "strong" })
      : getStore({ name: STORE_NAME, consistency: "strong" });
  return {
    async get(key) {
      const value = await store.get(key, { consistency: "strong", type: "text" });
      return value ?? null;
    },
    async set(key, value) {
      await store.set(key, value);
    },
    async delete(key) {
      await store.delete(key);
    },
  };
}

/** Orders live in a Netlify Blobs store named service-orders. Local dev uses .data. */
export function getServiceStore(): KeyValueStore {
  if (testStore) return testStore;
  if (readEnv("CLOSEPATH_DATA_DIR")) {
    diskStore ??= createDiskStore();
    return diskStore;
  }
  if (diskStore) return diskStore;
  try {
    return netlifyStore();
  } catch (error) {
    if (onNetlify()) throw error;
    diskStore = createDiskStore();
    return diskStore;
  }
}

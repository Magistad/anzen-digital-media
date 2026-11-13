import { mkdir, readdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { getStore } from "@netlify/blobs";
import { readEnv } from "./env";

export type KeyValueStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

const STORE_NAME = "closepath";

let testStore: KeyValueStore | null = null;
let diskStore: KeyValueStore | null = null;

/** Tests inject a memory store so they never touch Netlify or the disk. */
export function setClosepathStore(store: KeyValueStore | null): void {
  testStore = store;
}

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    async get(key) {
      return map.get(key) ?? null;
    },
    async set(key, value) {
      map.set(key, value);
    },
    async delete(key) {
      map.delete(key);
    },
  };
}

/**
 * When set, books stay in this directory and Netlify is not used.
 * End-to-end tests set it so a run cannot touch a developer’s `.data` books
 * or a live blob store configured in the environment.
 */
function dataRoot(): string {
  return readEnv("CLOSEPATH_DATA_DIR") ?? path.join(process.cwd(), ".data");
}

function diskPath(key: string): string {
  const safe = Buffer.from(key, "utf8").toString("base64url");
  return path.join(dataRoot(), STORE_NAME, safe);
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

function isNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function onNetlify(): boolean {
  return process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
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

export function getClosepathStore(): KeyValueStore {
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

export type BinaryObject = {
  data: Uint8Array;
  contentType: string;
  filename: string;
};

export type BinaryStore = {
  get(key: string): Promise<BinaryObject | null>;
  set(key: string, value: BinaryObject): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
};

let testBinary: BinaryStore | null = null;
let diskBinary: BinaryStore | null = null;

export function setClosepathBinaryStore(store: BinaryStore | null): void {
  testBinary = store;
}

export function memoryBinaryStore(): BinaryStore {
  const map = new Map<string, BinaryObject>();
  return {
    async get(key) {
      const value = map.get(key);
      return value ? { data: new Uint8Array(value.data), contentType: value.contentType, filename: value.filename } : null;
    },
    async set(key, value) {
      map.set(key, { data: new Uint8Array(value.data), contentType: value.contentType, filename: value.filename });
    },
    async delete(key) {
      map.delete(key);
    },
    async list(prefix) {
      return [...map.keys()].filter((key) => key.startsWith(prefix));
    },
  };
}

function binaryDiskPath(key: string): string {
  const safe = Buffer.from(key, "utf8").toString("base64url");
  return path.join(dataRoot(), `${STORE_NAME}-files`, safe);
}

function createDiskBinaryStore(): BinaryStore {
  return {
    async get(key) {
      try {
        const data = await readFile(binaryDiskPath(key));
        const meta = JSON.parse(await readFile(`${binaryDiskPath(key)}.meta`, "utf8")) as { contentType?: unknown; filename?: unknown };
        return {
          data,
          contentType: typeof meta.contentType === "string" ? meta.contentType : "application/octet-stream",
          filename: typeof meta.filename === "string" ? meta.filename : "file",
        };
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    async set(key, value) {
      const file = binaryDiskPath(key);
      await mkdir(path.dirname(file), { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      await writeFile(temporary, value.data);
      await rename(temporary, file);
      await writeFile(`${file}.meta`, JSON.stringify({ contentType: value.contentType, filename: value.filename }), "utf8");
    },
    async delete(key) {
      await rm(binaryDiskPath(key), { force: true });
      await rm(`${binaryDiskPath(key)}.meta`, { force: true });
    },
    async list(prefix) {
      const dir = path.join(dataRoot(), `${STORE_NAME}-files`);
      let names: string[];
      try {
        names = await readdir(dir);
      } catch (error) {
        if (isNotFound(error)) return [];
        throw error;
      }
      const keys: string[] = [];
      for (const name of names) {
        if (name.endsWith(".meta") || name.endsWith(".tmp")) continue;
        try {
          const key = Buffer.from(name, "base64url").toString("utf8");
          if (key.startsWith(prefix)) keys.push(key);
        } catch {
          continue;
        }
      }
      return keys;
    },
  };
}

function bytesToArrayBuffer(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

function netlifyBinaryStore(): BinaryStore {
  const siteID = process.env.NETLIFY_SITE_ID?.trim();
  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();
  const store =
    siteID && token
      ? getStore({ name: STORE_NAME, siteID, token, consistency: "strong" })
      : getStore({ name: STORE_NAME, consistency: "strong" });
  return {
    async get(key) {
      const result = await store.getWithMetadata(key, { type: "arrayBuffer", consistency: "strong" });
      if (!result?.data) return null;
      const contentType = result.metadata.contentType;
      const filename = result.metadata.filename;
      return {
        data: new Uint8Array(result.data),
        contentType: typeof contentType === "string" ? contentType : "application/octet-stream",
        filename: typeof filename === "string" ? filename : "file",
      };
    },
    async set(key, value) {
      await store.set(key, bytesToArrayBuffer(value.data), {
        metadata: { contentType: value.contentType, filename: value.filename },
      });
    },
    async delete(key) {
      await store.delete(key);
    },
    async list(prefix) {
      const result = await store.list({ prefix });
      return result.blobs.map((blob) => blob.key);
    },
  };
}

export function getClosepathBinaryStore(): BinaryStore {
  if (testBinary) return testBinary;
  if (readEnv("CLOSEPATH_DATA_DIR")) {
    diskBinary ??= createDiskBinaryStore();
    return diskBinary;
  }
  if (diskBinary) return diskBinary;
  try {
    return netlifyBinaryStore();
  } catch (error) {
    if (onNetlify()) throw error;
    diskBinary = createDiskBinaryStore();
    return diskBinary;
  }
}

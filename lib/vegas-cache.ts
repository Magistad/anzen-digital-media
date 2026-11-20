type Entry = { expires: number; value: unknown };

const store = new Map<string, Entry>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>, now = Date.now()): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await load();
  store.set(key, { expires: now + ttlMs, value });
  return value;
}

export function clearVegasCache(): void {
  store.clear();
}

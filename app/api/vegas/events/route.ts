import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";
import { applyVegasEvent, coerceEventCounts, parseVegasEvent } from "../../../../lib/vegas-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORE = "vegas-events";
const KEY = "counts";

function onNetlify(): boolean {
  return process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
}

async function persist(event: ReturnType<typeof parseVegasEvent>): Promise<boolean> {
  if (!event || !onNetlify()) return false;
  const store = getStore({ name: STORE, consistency: "strong" });
  const raw = await store.get(KEY, { consistency: "strong", type: "text" });
  const current = coerceEventCounts(raw ? (JSON.parse(raw) as unknown) : null);
  await store.setJSON(KEY, applyVegasEvent(current, event));
  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON event." }, { status: 400 });
  }
  const event = parseVegasEvent(body);
  if (!event) return NextResponse.json({ error: "That event is not counted." }, { status: 400 });
  try {
    const stored = await persist(event);
    return NextResponse.json({ ok: true, stored }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: true, stored: false }, { headers: { "Cache-Control": "no-store" } });
  }
}

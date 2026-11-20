import { NextResponse } from "next/server";
import { loadConditions } from "../../../../lib/vegas-conditions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await loadConditions(fetch);
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}

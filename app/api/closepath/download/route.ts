import { NextResponse } from "next/server";
import { closepathDownloadAccess } from "../../../../lib/closepath-access";
import { getClosepathWorkbook } from "../../../../lib/closepath-workbook";
import { isStripeConfigured } from "../../../../lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Checkout coming soon." }, { status: 503 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id") ?? undefined;
  const access = await closepathDownloadAccess(sessionId);
  if (access.state !== "paid") {
    return NextResponse.json({ error: "Payment required." }, { status: 403 });
  }

  const file = await getClosepathWorkbook();
  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Closepath.xlsx"',
      "Content-Length": String(file.length),
      "Cache-Control": "private, no-store",
    },
  });
}

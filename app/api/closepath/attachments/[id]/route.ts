import { NextResponse } from "next/server";
import { accountAccess } from "../../../../../lib/closepath-access";
import { contentDisposition, deleteAttachmentBlob, readAttachmentBlob } from "../../../../../lib/closepath-attachments";
import { sessionFromRequest } from "../../../../../lib/closepath-response";
import { sameOrigin } from "../../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ATTACHMENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function openEmail(req: Request, checkOrigin: boolean): Promise<{ email: string } | NextResponse> {
  if (checkOrigin && !sameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const session = sessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const access = await accountAccess(session.email);
  if (access.state === "ended") return NextResponse.json({ error: "This subscription isn’t active." }, { status: 403 });
  if (access.state !== "open") {
    return NextResponse.json({ error: "Closepath can’t confirm this subscription right now." }, { status: 503 });
  }
  return session;
}

export async function GET(req: Request, context: { params: { id: string } }) {
  const opened = await openEmail(req, false);
  if (opened instanceof NextResponse) return opened;
  const id = context.params.id ?? "";
  if (!ATTACHMENT_ID.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    const blob = await readAttachmentBlob(opened.email, id);
    if (!blob) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const download = new URL(req.url).searchParams.get("download") === "1";
    const body = blob.data.buffer.slice(blob.data.byteOffset, blob.data.byteOffset + blob.data.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": blob.contentType,
        "Content-Disposition": contentDisposition(download ? "attachment" : "inline", blob.filename),
        "Content-Length": String(blob.data.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Closepath attachment read failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "That file didn’t open." }, { status: 503 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const opened = await openEmail(req, true);
  if (opened instanceof NextResponse) return opened;
  const id = context.params.id ?? "";
  if (!ATTACHMENT_ID.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await deleteAttachmentBlob(opened.email, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Closepath attachment delete failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "That file didn’t delete." }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { accountAccess } from "../../../../lib/closepath-access";
import { loadWorkspace } from "../../../../lib/closepath-account";
import {
  ATTACHMENT_ACCOUNT_CAP,
  attachmentName,
  countAttachmentBlobs,
  countAttachments,
  sniffAttachment,
  writeAttachmentBlob,
} from "../../../../lib/closepath-attachments";
import { LIMITS, type DealAttachment } from "../../../../lib/closepath-model";
import { sessionFromRequest } from "../../../../lib/closepath-response";
import { sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE_ID = /^[A-Za-z0-9_-]{8,80}$/;

async function openEmail(req: Request): Promise<{ email: string } | NextResponse> {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const session = sessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const access = await accountAccess(session.email);
  if (access.state === "ended") return NextResponse.json({ error: "This subscription isn’t active." }, { status: 403 });
  if (access.state !== "open") {
    return NextResponse.json({ error: "Closepath can’t confirm this subscription right now." }, { status: 503 });
  }
  return session;
}

export async function POST(req: Request) {
  const opened = await openEmail(req);
  if (opened instanceof NextResponse) return opened;
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > LIMITS.attachmentBytes + 50_000) {
    return NextResponse.json({ error: "Use a file under 4.5 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "That file didn’t come through." }, { status: 400 });
  }
  const fileId = form.get("fileId");
  const upload = form.get("file");
  if (typeof fileId !== "string" || !FILE_ID.test(fileId)) {
    return NextResponse.json({ error: "That file isn’t on this book." }, { status: 400 });
  }
  if (!(upload instanceof File)) return NextResponse.json({ error: "Choose a photo or a PDF." }, { status: 400 });
  if (upload.size < 1 || upload.size > LIMITS.attachmentBytes) {
    return NextResponse.json({ error: "Use a file under 4.5 MB." }, { status: 413 });
  }

  try {
    const workspace = await loadWorkspace(opened.email);
    if (!workspace.files.some((file) => file.id === fileId)) {
      return NextResponse.json({ error: "Save this file, then add the photo." }, { status: 409 });
    }
    if (countAttachments(workspace, fileId) >= LIMITS.attachments) {
      return NextResponse.json({ error: "This file already has 20 attachments." }, { status: 409 });
    }
    if ((await countAttachmentBlobs(opened.email)) >= ATTACHMENT_ACCOUNT_CAP) {
      return NextResponse.json({ error: "This book is full of attachments." }, { status: 409 });
    }
    const bytes = new Uint8Array(await upload.arrayBuffer());
    if (bytes.byteLength > LIMITS.attachmentBytes) {
      return NextResponse.json({ error: "Use a file under 4.5 MB." }, { status: 413 });
    }
    const sniffed = sniffAttachment(bytes);
    if (!sniffed) return NextResponse.json({ error: "Use a photo or a PDF." }, { status: 415 });
    const attachment: DealAttachment = {
      id: crypto.randomUUID(),
      name: attachmentName(upload.name || "file", sniffed.ext),
      contentType: sniffed.contentType,
      size: bytes.byteLength,
      createdAt: new Date().toISOString(),
    };
    await writeAttachmentBlob(opened.email, attachment.id, {
      data: bytes,
      contentType: attachment.contentType,
      filename: attachment.name,
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Closepath attachment upload failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "That file didn’t save." }, { status: 503 });
  }
}

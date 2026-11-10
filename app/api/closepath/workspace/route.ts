import { NextResponse } from "next/server";
import { accountAccess } from "../../../../lib/closepath-access";
import { loadWorkspace, saveWorkspace } from "../../../../lib/closepath-account";
import { deleteUnreferencedAttachments } from "../../../../lib/closepath-attachments";
import { sanitizeWorkspace } from "../../../../lib/closepath-model";
import { sessionFromRequest } from "../../../../lib/closepath-response";
import { sameOrigin } from "../../../../lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const session = sessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const access = await accountAccess(session.email);
  if (access.state === "ended") {
    return NextResponse.json({ error: "This subscription isn’t active." }, { status: 403 });
  }
  if (access.state !== "open") {
    return NextResponse.json({ error: "Closepath can’t confirm this subscription right now." }, { status: 503 });
  }

  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > 900_000) return NextResponse.json({ error: "Book is too large." }, { status: 413 });
  const raw = await req.text();
  if (raw.length > 900_000) return NextResponse.json({ error: "Book is too large." }, { status: 413 });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Unreadable book." }, { status: 400 });
  }
  const workspace = sanitizeWorkspace(parsed);
  if (!workspace) return NextResponse.json({ error: "Book could not be saved." }, { status: 400 });

  let previous;
  try {
    previous = await loadWorkspace(session.email);
    await saveWorkspace(session.email, workspace);
  } catch (error) {
    console.error("Closepath save failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Book could not be saved." }, { status: 503 });
  }
  try {
    await deleteUnreferencedAttachments(session.email, previous, workspace);
  } catch (error) {
    console.error("Closepath attachment cleanup failed", error instanceof Error ? error.message : "unknown");
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { loadWorkspace } from "./closepath-account";
import { accountAccess } from "./closepath-access";
import { readSession, sessionCookie, tokenFromRequest, clearSessionCookie } from "./closepath-auth";
import { parseIsoDate, todayIso } from "./closepath-model";
import { projectWorkspace } from "./closepath-project";
import { requestOrigin } from "./request-origin";
import { closepathWorkbook } from "./closepath-workbook";

export function redirectTo(req: Request, path: string, status = 303): NextResponse {
  return NextResponse.redirect(new URL(path, requestOrigin(req)), status);
}

function cookieSecure(req: Request): boolean {
  return requestOrigin(req).startsWith("https://");
}

export function withSession(res: NextResponse, token: string, req: Request): NextResponse {
  const cookie = sessionCookie(token, cookieSecure(req));
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

export function withoutSession(res: NextResponse, req: Request): NextResponse {
  const cookie = clearSessionCookie(cookieSecure(req));
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

export function sessionFromRequest(req: Request): { email: string } | null {
  return readSession(tokenFromRequest(req));
}

function exportToday(requested: string | null): string {
  const server = todayIso();
  if (!requested || !parseIsoDate(requested)) return server;
  const serverDate = Date.parse(`${server}T00:00:00Z`);
  const asked = Date.parse(`${requested}T00:00:00Z`);
  if (!Number.isFinite(serverDate) || Math.abs(asked - serverDate) > 86_400_000 * 2) return server;
  return requested;
}

export async function exportBook(req: Request): Promise<NextResponse> {
  const session = sessionFromRequest(req);
  if (!session) return redirectTo(req, "/closepath/sign-in");
  const access = await accountAccess(session.email);
  if (access.state !== "open") return redirectTo(req, "/closepath");
  const today = exportToday(new URL(req.url).searchParams.get("today"));
  const workspace = await loadWorkspace(session.email);
  const file = await closepathWorkbook(projectWorkspace(workspace, today));
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

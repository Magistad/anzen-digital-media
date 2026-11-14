import { TEST_ORIGIN } from "../constants";

const HOST = "127.0.0.1:3210";

export function formRequest(path: string, body: Record<string, string> = {}, origin = TEST_ORIGIN): Request {
  return new Request(`${TEST_ORIGIN}${path}`, {
    method: "POST",
    headers: {
      host: HOST,
      origin,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
}

export function cookieHeader(response: Response): string {
  const cookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie") ?? ""];
  return cookies
    .map((cookie) => cookie.split(";")[0]?.trim() ?? "")
    .filter(Boolean)
    .join("; ");
}

export function withCookie(req: Request, cookie: string): Request {
  const headers = new Headers(req.headers);
  headers.set("cookie", cookie);
  return new Request(req, { headers });
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nativeShellRedirectPath } from "./lib/native-shell";

export function middleware(request: NextRequest) {
  const path = nativeShellRedirectPath(request.nextUrl.pathname, request.headers.get("user-agent"));
  if (!path) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url, 303);
}

export const config = {
  matcher: ["/", "/products/closepath", "/products/closepath/", "/api/checkout", "/api/closepath/billing"],
};

function firstHeader(value: string | null): string {
  return value?.split(",")[0]?.trim() ?? "";
}

function isHost(value: string): boolean {
  return /^[a-z0-9.-]+(?::\d+)?$/i.test(value);
}

/** Public origin for this request, so Checkout can return to Netlify, preview, or local. */
export function requestOrigin(req: Request): string {
  const host =
    firstHeader(req.headers.get("x-forwarded-host")) ||
    firstHeader(req.headers.get("host"));

  if (isHost(host)) {
    const forwarded = firstHeader(req.headers.get("x-forwarded-proto")).toLowerCase();
    const hostname = host.split(":")[0]?.toLowerCase() ?? "";
    const proto =
      forwarded === "http" || forwarded === "https"
        ? forwarded
        : hostname === "localhost" || hostname === "127.0.0.1"
          ? "http"
          : "https";
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

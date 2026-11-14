/** Token appended by the Closepath iOS and Android shells. Mobile browsers do not send it. */
export const NATIVE_SHELL_MARK = "ClosepathNative/1";

export type NativePlatform = "ios" | "android";

const SHELL = /ClosepathNative\/1 \((ios|android)\)/;

export function nativePlatformFromUserAgent(ua: string | null | undefined): NativePlatform | null {
  if (!ua) return null;
  const match = SHELL.exec(ua);
  if (match?.[1] === "ios" || match?.[1] === "android") return match[1];
  return null;
}

/**
 * The iOS app cannot show Stripe checkout, prices, or upgrade links
 * (App Store guidelines 3.1.1 and 3.1.3). Google Play’s payments policy
 * requires Play Billing for a digital subscription sold in the app, so the
 * Android shell is sign-in only as well. A normal browser is never matched.
 */
export function nativeShellHidesStoreBilling(platform: NativePlatform | null): boolean {
  return platform !== null;
}

/** Path to send a native shell, or null when the request should continue. */
export function nativeShellRedirectPath(pathname: string, ua: string | null | undefined): string | null {
  if (!nativeShellHidesStoreBilling(nativePlatformFromUserAgent(ua))) return null;
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (path === "/" || path === "/products/closepath" || path === "/api/checkout" || path === "/api/closepath/billing") {
    return "/closepath/sign-in";
  }
  return null;
}

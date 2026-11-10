import assert from "node:assert/strict";
import test from "node:test";
import { POST as billing } from "../app/api/closepath/billing/route";
import { POST as checkout } from "../app/api/checkout/route";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling, nativeShellRedirectPath } from "./native-shell";

const IOS = "Mozilla/5.0 ClosepathNative/1 (ios)";
const ANDROID = "Mozilla/5.0 ClosepathNative/1 (android)";
const BROWSER = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";

test("a phone browser is not the native shell", () => {
  assert.equal(nativePlatformFromUserAgent(BROWSER), null);
  assert.equal(nativePlatformFromUserAgent(null), null);
  assert.equal(nativePlatformFromUserAgent("ClosepathNative/1"), null);
  assert.equal(nativeShellHidesStoreBilling(null), false);
  assert.equal(nativeShellRedirectPath("/products/closepath", BROWSER), null);
  assert.equal(nativeShellRedirectPath("/api/checkout", BROWSER), null);
});

test("the ios and android shells hide store billing", () => {
  assert.equal(nativePlatformFromUserAgent(IOS), "ios");
  assert.equal(nativePlatformFromUserAgent(ANDROID), "android");
  assert.equal(nativeShellHidesStoreBilling("ios"), true);
  assert.equal(nativeShellHidesStoreBilling("android"), true);
  for (const ua of [IOS, ANDROID]) {
    assert.equal(nativeShellRedirectPath("/", ua), "/closepath/sign-in");
    assert.equal(nativeShellRedirectPath("/products/closepath/", ua), "/closepath/sign-in");
    assert.equal(nativeShellRedirectPath("/api/checkout", ua), "/closepath/sign-in");
    assert.equal(nativeShellRedirectPath("/api/closepath/billing", ua), "/closepath/sign-in");
    assert.equal(nativeShellRedirectPath("/closepath", ua), null);
    assert.equal(nativeShellRedirectPath("/closepath/sign-in", ua), null);
    assert.equal(nativeShellRedirectPath("/privacy", ua), null);
    assert.equal(nativeShellRedirectPath("/products/closepath/success", ua), null);
  }
});

test("native shells cannot start Stripe checkout", async () => {
  for (const ua of [IOS, ANDROID]) {
    const res = await checkout(
      new Request("https://anzendigitalmedia.com/api/checkout", {
        method: "POST",
        headers: { "user-agent": ua, origin: "https://anzendigitalmedia.com" },
      }),
    );
    assert.equal(res.status, 303);
    assert.equal(new URL(res.headers.get("location") ?? "").pathname, "/closepath/sign-in");
  }
});

test("a browser checkout request is not sent to the app sign-in", async () => {
  const res = await checkout(
    new Request("https://anzendigitalmedia.com/api/checkout", {
      method: "POST",
      headers: { "user-agent": BROWSER, origin: "https://anzendigitalmedia.com" },
    }),
  );
  const location = res.headers.get("location") ?? "";
  assert.equal(res.status, 303);
  assert.equal(new URL(location).pathname === "/closepath/sign-in", false);
});

test("native shells cannot open the Stripe billing portal", async () => {
  const res = await billing(
    new Request("https://anzendigitalmedia.com/api/closepath/billing", {
      method: "POST",
      headers: { "user-agent": IOS, origin: "https://anzendigitalmedia.com" },
    }),
  );
  assert.equal(res.status, 303);
  assert.equal(new URL(res.headers.get("location") ?? "").pathname, "/closepath/sign-in");
});

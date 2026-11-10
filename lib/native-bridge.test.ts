import assert from "node:assert/strict";
import test from "node:test";
import { fileFromBase64, nativeCancelled } from "./native-bridge";

test("photo bytes round-trip from base64", () => {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const file = fileFromBase64(btoa(binary), "photo.jpg", "image/jpeg");
  assert.equal(file.name, "photo.jpg");
  assert.equal(file.type, "image/jpeg");
  assert.equal(file.size, 4);
});

test("a dismissed native sheet is not an error", () => {
  assert.equal(nativeCancelled(new Error("Share canceled")), true);
  assert.equal(nativeCancelled(new Error("pickFiles canceled.")), true);
  assert.equal(nativeCancelled(new Error("Calendar canceled")), true);
  assert.equal(nativeCancelled(new Error("No calendar app is available")), false);
});

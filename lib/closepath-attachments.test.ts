import assert from "node:assert/strict";
import test from "node:test";
import { attachmentName, sniffAttachment } from "./closepath-attachments";
import { emptyFile, sanitizeWorkspace } from "./closepath-model";

function bytes(signature: number[], length = 16): Uint8Array {
  const out = new Uint8Array(length);
  signature.forEach((value, index) => {
    out[index] = value;
  });
  return out;
}

test("photos and PDFs are recognized, and other files are not", () => {
  assert.equal(sniffAttachment(bytes([0xff, 0xd8, 0xff]))?.contentType, "image/jpeg");
  assert.equal(sniffAttachment(bytes([0x89, 0x50, 0x4e, 0x47]))?.contentType, "image/png");
  assert.equal(sniffAttachment(bytes([0x25, 0x50, 0x44, 0x46]))?.contentType, "application/pdf");
  assert.equal(sniffAttachment(bytes([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))?.ext, "webp");
  const heic = bytes([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
  assert.equal(sniffAttachment(heic)?.contentType, "image/heic");
  assert.equal(sniffAttachment(new TextEncoder().encode("<html>not a photo</html>")), null);
  assert.equal(sniffAttachment(bytes([0xff, 0xd8], 8)), null);
  assert.equal(attachmentName("../../Earnest check.jpg", "jpg"), "Earnest check.jpg");
  assert.equal(attachmentName("", "pdf"), "file.pdf");
});

test("the book keeps a real attachment and drops a bad one", () => {
  const file = emptyFile("file-live1");
  file.address = "10 Main Street";
  const kept = sanitizeWorkspace({
    files: [
      {
        ...file,
        attachments: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "check.jpg",
            contentType: "image/jpeg",
            size: 1200,
            createdAt: "2026-11-10T15:00:00.000Z",
          },
          { id: "not-an-id", name: "x.html", contentType: "text/html", size: 10, createdAt: "nope" },
        ],
      },
    ],
    leads: [],
    examplesLoaded: false,
    examplesDismissed: false,
  });
  assert.equal(kept?.files[0]?.attachments.length, 1);
  assert.equal(kept?.files[0]?.attachments[0]?.name, "check.jpg");
  const legacy = sanitizeWorkspace({
    files: [{ ...file, attachments: undefined }],
    leads: [],
    examplesLoaded: false,
    examplesDismissed: false,
  });
  assert.deepEqual(legacy?.files[0]?.attachments, []);
});

import { LIMITS, type DealAttachment, type Workspace } from "./closepath-model";
import { getClosepathBinaryStore, type BinaryStore } from "./closepath-store";

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"]);

export type SniffedFile = { contentType: DealAttachment["contentType"]; ext: string };

export function sniffAttachment(bytes: Uint8Array): SniffedFile | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { contentType: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { contentType: "image/png", ext: "png" };
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return { contentType: "image/gif", ext: "gif" };
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return { contentType: "application/pdf", ext: "pdf" };
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { contentType: "image/webp", ext: "webp" };
  }
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8] ?? 0, bytes[9] ?? 0, bytes[10] ?? 0, bytes[11] ?? 0);
    if (HEIC_BRANDS.has(brand)) return { contentType: "image/heic", ext: "heic" };
    if (brand === "avif" || brand === "avis") return { contentType: "image/avif", ext: "avif" };
  }
  return null;
}

export function attachmentName(original: string, ext: string): string {
  const base = (original.split(/[/\\]/).pop() ?? "").replace(/[^\w.\- ()]/g, "").trim();
  const stem = base.replace(/\.[A-Za-z0-9]{1,8}$/, "").replace(/^\.+/, "").slice(0, 60);
  return `${stem || "file"}.${ext}`;
}

export function attachmentKey(email: string, id: string): string {
  return `attachment:${email}:${id}`;
}

export function attachmentPrefix(email: string): string {
  return `attachment:${email}:`;
}

export function attachmentIds(workspace: Workspace): Set<string> {
  const ids = new Set<string>();
  for (const file of workspace.files) {
    for (const item of file.attachments) ids.add(item.id);
  }
  return ids;
}

export function countAttachments(workspace: Workspace, fileId: string): number {
  return workspace.files.find((file) => file.id === fileId)?.attachments.length ?? 0;
}

export function isPreviewableImage(contentType: string): boolean {
  return contentType === "image/jpeg" || contentType === "image/png" || contentType === "image/webp" || contentType === "image/gif" || contentType === "image/avif";
}

export function contentDisposition(kind: "inline" | "attachment", filename: string): string {
  const ascii = filename.replace(/[^\w.\- ()]/g, "_").replace(/"/g, "").slice(0, 80) || "file";
  return `${kind}; filename="${ascii}"`;
}

async function store(): Promise<BinaryStore> {
  return getClosepathBinaryStore();
}

export async function writeAttachmentBlob(email: string, id: string, value: { data: Uint8Array; contentType: string; filename: string }): Promise<void> {
  await (await store()).set(attachmentKey(email, id), value);
}

export async function readAttachmentBlob(email: string, id: string) {
  return (await store()).get(attachmentKey(email, id));
}

export async function deleteAttachmentBlob(email: string, id: string): Promise<void> {
  await (await store()).delete(attachmentKey(email, id));
}

export async function countAttachmentBlobs(email: string): Promise<number> {
  const keys = await (await store()).list(attachmentPrefix(email));
  return keys.length;
}

/** Drops bytes for attachments the book no longer names. */
export async function deleteUnreferencedAttachments(email: string, previous: Workspace, next: Workspace): Promise<void> {
  const keep = attachmentIds(next);
  const removed = [...attachmentIds(previous)].filter((id) => !keep.has(id));
  await Promise.all(removed.map((id) => deleteAttachmentBlob(email, id)));
}

export const ATTACHMENT_ACCOUNT_CAP = LIMITS.files * LIMITS.attachments;

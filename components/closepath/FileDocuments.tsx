"use client";

import { useState } from "react";
import { useNativeShell } from "../NativeShell";
import { nativeCancelled, nativePickPdf, nativePickPhoto, nativeTakePhoto } from "../../lib/native-bridge";
import { LIMITS, type DealAttachment, type DealFile } from "../../lib/closepath-model";

function previewable(contentType: string): boolean {
  return contentType === "image/jpeg" || contentType === "image/png" || contentType === "image/webp" || contentType === "image/gif" || contentType === "image/avif";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

function isAttachment(value: unknown): value is DealAttachment {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<DealAttachment>;
  return typeof row.id === "string" && typeof row.name === "string" && typeof row.contentType === "string" && typeof row.size === "number" && typeof row.createdAt === "string";
}

async function postFile(fileId: string, item: File): Promise<DealAttachment> {
  const send = () => {
    const body = new FormData();
    body.set("fileId", fileId);
    body.set("file", item);
    return fetch("/api/closepath/attachments", { method: "POST", body });
  };
  let res = await send();
  if (res.status === 409) {
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    res = await send();
  }
  const payload = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok || !isAttachment(payload)) {
    throw new Error(payload && "error" in payload && payload.error ? payload.error : "That file didn’t save.");
  }
  return payload;
}

export function FileDocuments({
  file,
  onAdd,
  onRemove,
}: {
  file: DealFile;
  onAdd: (attachment: DealAttachment) => void;
  onRemove: (id: string) => void;
}) {
  const shell = useNativeShell();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const full = file.attachments.length >= LIMITS.attachments;

  async function capture(kind: "camera" | "photo" | "pdf") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const item = kind === "camera" ? await nativeTakePhoto() : kind === "photo" ? await nativePickPhoto() : await nativePickPdf();
      if (item.size > LIMITS.attachmentBytes) {
        setError("Use a file under 4.5 MB.");
        return;
      }
      onAdd(await postFile(file.id, item));
    } catch (caught) {
      if (nativeCancelled(caught)) return;
      setError(caught instanceof Error ? caught.message : "That file didn’t save.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(list: FileList | null, input: HTMLInputElement) {
    const item = list?.[0];
    input.value = "";
    if (!item || busy) return;
    if (item.size > LIMITS.attachmentBytes) {
      setError("Use a file under 4.5 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onAdd(await postFile(file.id, item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That file didn’t save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/closepath/attachments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "That file didn’t delete.");
      }
      onRemove(id);
      setConfirming(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That file didn’t delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-[14px] text-paper/50">Photos and PDFs, up to 4.5 MB. 20 on a file.</p>
      {file.attachments.length ? (
        <ul className="mt-2 border-t border-paper/15">
          {file.attachments.map((item) => (
            <li key={item.id} className="border-b border-paper/12 py-3">
              {previewable(item.contentType) ? (
                <a href={`/api/closepath/attachments/${item.id}`} target="_blank" rel="noreferrer" className="block max-w-sm">
                  <img
                    src={`/api/closepath/attachments/${item.id}`}
                    alt={item.name}
                    className="max-h-56 max-w-full border border-paper/15"
                  />
                </a>
              ) : null}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14px]">
                <span className="min-w-0 break-all">{item.name}</span>
                <span className="text-paper/45">{formatSize(item.size)}</span>
                <a href={`/api/closepath/attachments/${item.id}`} target="_blank" rel="noreferrer" className="book-quiet text-paper">
                  View
                </a>
                <a href={`/api/closepath/attachments/${item.id}?download=1`} className="book-quiet text-paper">
                  Download
                </a>
                {confirming === item.id ? (
                  <>
                    <button type="button" className="book-quiet text-paper" disabled={busy} onClick={() => void remove(item.id)}>
                      Delete this file
                    </button>
                    <button type="button" className="book-quiet" onClick={() => setConfirming(null)}>
                      Keep it
                    </button>
                  </>
                ) : (
                  <button type="button" className="book-quiet" onClick={() => setConfirming(item.id)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[14px] text-paper/60">Nothing on this file yet.</p>
      )}
      {error ? (
        <p className="mt-2 text-[14px] text-paper/70" role="status">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {shell ? (
          <>
            <button type="button" className="book-action" disabled={full || busy} onClick={() => void capture("camera")}>
              {busy ? "Saving" : "Take a photo"}
            </button>
            <button type="button" className="book-action" disabled={full || busy} onClick={() => void capture("photo")}>
              Choose a photo
            </button>
            <button type="button" className="book-action" disabled={full || busy} onClick={() => void capture("pdf")}>
              Choose a PDF
            </button>
          </>
        ) : (
          <>
            <label className={`book-action ${full || busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
              {busy ? "Saving" : "Take a photo"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={full || busy}
                onChange={(event) => void upload(event.target.files, event.target)}
              />
            </label>
            <label className={`book-action ${full || busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
              Upload
              <input
                type="file"
                accept="image/*,application/pdf,.pdf,.heic,.heif"
                className="sr-only"
                disabled={full || busy}
                onChange={(event) => void upload(event.target.files, event.target)}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

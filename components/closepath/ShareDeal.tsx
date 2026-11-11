"use client";

import { useEffect, useState } from "react";
import { useNativeShell } from "../NativeShell";
import type { DealFile } from "../../lib/closepath-model";
import { nativeCancelled, nativeShareDeal } from "../../lib/native-bridge";
import { dealSummaryText, mailtoHref, shareSubject, smsHref } from "../../lib/closepath-share";

export function ShareDeal({ file }: { file: DealFile }) {
  const shell = useNativeShell();
  const [open, setOpen] = useState(false);
  const [webShare, setWebShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const text = dealSummaryText(file);
  const subject = shareSubject(file);
  const canShare = shell !== null || webShare;

  useEffect(() => {
    if (!shell) setWebShare(typeof navigator.share === "function");
  }, [shell]);

  async function share() {
    setError("");
    try {
      if (shell) {
        await nativeShareDeal(subject, text);
        return;
      }
      await navigator.share({ title: subject, text });
    } catch (caught) {
      if (nativeCancelled(caught)) return;
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError("Couldn’t open the share sheet.");
    }
  }

  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Couldn’t copy. Select the summary and copy it.");
    }
  }

  return (
    <div className="mt-2 max-w-xl">
      <button type="button" className="book-quiet text-paper" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        Share deal summary
      </button>
      {open ? (
        <div role="region" aria-label="Deal summary">
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap border border-paper/15 p-3 text-[14px] leading-snug text-paper/85 sm:max-h-96">
            {text}
          </pre>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {canShare ? (
              <button type="button" className="book-quiet text-paper" onClick={() => void share()}>
                Share
              </button>
            ) : null}
            <button type="button" className="book-quiet text-paper" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={smsHref(text)} className="book-quiet text-paper">
              Text message
            </a>
            <a href={mailtoHref(subject, text)} className="book-quiet text-paper">
              Email
            </a>
          </div>
          {error ? (
            <p className="mt-1 text-[13px] text-paper/70" role="status">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

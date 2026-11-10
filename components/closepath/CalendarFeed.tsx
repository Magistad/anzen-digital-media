"use client";

import { useState } from "react";
import { appleSubscribeUrl, googleSubscribeUrl, outlookSubscribeUrl } from "../../lib/closepath-calendar";

type FeedState = { enabled: boolean; url: string | null };

async function readFeed(res: Response): Promise<FeedState> {
  if (!res.ok) throw new Error("calendar");
  const body = (await res.json()) as { enabled?: boolean; url?: string | null };
  const url = typeof body.url === "string" && body.url ? body.url : null;
  return { enabled: Boolean(body.enabled && url), url };
}

export function CalendarFeed({ label = "Subscribe" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [feed, setFeed] = useState<FeedState | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<"rotate" | "revoke" | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/closepath/calendar", { cache: "no-store" });
      setFeed(await readFeed(res));
    } catch {
      setError("The calendar link didn’t load.");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    setConfirm(null);
    if (next) void load();
  }

  async function act(action: "enable" | "rotate" | "revoke") {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/closepath/calendar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setFeed(await readFeed(res));
      setConfirm(null);
      setCopied(false);
    } catch {
      setError("The calendar link didn’t save.");
    } finally {
      setPending(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setError("");
    } catch {
      setCopied(false);
      setError("Couldn’t copy. Select the link and copy it.");
    }
  }

  const url = feed?.url ?? null;

  return (
    <div className="max-w-xl">
      <button type="button" className="book-quiet text-paper" aria-expanded={open} onClick={toggle}>
        {label}
      </button>
      {open ? (
        <div role="region" aria-label="Calendar subscription" className="mt-2">
          <p className="max-w-xl text-[14px] leading-snug text-paper/65">
            A private link for this book. Apple, Google, and Outlook update when a date changes. Sample files and closed
            files stay off it. Google may take a day to pick up a change.
          </p>
          {loading ? <p className="mt-2 text-[14px] text-paper/50">Loading</p> : null}
          {error ? (
            <p className="mt-2 text-[14px] text-paper/70" role="status">
              {error}
            </p>
          ) : null}
          {!loading && feed && !feed.enabled ? (
            <button type="button" className="book-action mt-3" disabled={pending} onClick={() => void act("enable")}>
              {pending ? "Saving" : "Create a private link"}
            </button>
          ) : null}
          {url ? (
            <div className="mt-2">
              <label htmlFor="closepath-calendar-url" className="sr-only">
                Private calendar link
              </label>
              <input
                id="closepath-calendar-url"
                className="book-input text-[13px]"
                readOnly
                value={url}
                spellCheck={false}
                autoComplete="off"
                onFocus={(event) => event.currentTarget.select()}
              />
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <button type="button" className="book-quiet text-paper" onClick={() => void copy(url)}>
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a href={appleSubscribeUrl(url)} className="book-quiet text-paper">
                  Apple
                </a>
                <a href={googleSubscribeUrl(url)} target="_blank" rel="noreferrer" className="book-quiet text-paper">
                  Google
                </a>
                <a href={outlookSubscribeUrl(url)} target="_blank" rel="noreferrer" className="book-quiet text-paper">
                  Outlook
                </a>
                <a href="/api/closepath/calendar/book" className="book-quiet text-paper">
                  Download a copy
                </a>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-paper/50">
                Anyone with this link can see the property addresses and dates. Make a new link if it gets out.
              </p>
              {confirm === "rotate" ? (
                <div className="mt-2 flex flex-wrap gap-x-4">
                  <button type="button" className="book-quiet text-paper" disabled={pending} onClick={() => void act("rotate")}>
                    Replace the link
                  </button>
                  <button type="button" className="book-quiet" onClick={() => setConfirm(null)}>
                    Keep this link
                  </button>
                </div>
              ) : confirm === "revoke" ? (
                <div className="mt-2 flex flex-wrap gap-x-4">
                  <button type="button" className="book-quiet text-paper" disabled={pending} onClick={() => void act("revoke")}>
                    Stop the link
                  </button>
                  <button type="button" className="book-quiet" onClick={() => setConfirm(null)}>
                    Keep it
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-x-4">
                  <button type="button" className="book-quiet" onClick={() => setConfirm("rotate")}>
                    Make a new link
                  </button>
                  <button type="button" className="book-quiet" onClick={() => setConfirm("revoke")}>
                    Stop this link
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

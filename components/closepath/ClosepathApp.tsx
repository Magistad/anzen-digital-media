"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LIMITS,
  type DealFile,
  type LooseLead,
  type Workspace,
  type DealAttachment,
  emptyFile,
  emptyLead,
  emptyOffer,
  emptyShowing,
  fileFromLead,
  filesByAttention,
  morningLines,
  outcomeTotals,
  todayIso,
} from "../../lib/closepath-model";
import { sampleFiles } from "../../lib/closepath-samples";
import { CalendarFeed } from "./CalendarFeed";
import { FileList, type FileShow } from "./FileList";
import { FileView } from "./FileView";
import { LeadList } from "./LeadList";
import { MorningList } from "./MorningList";

const VIEWS = [
  { id: "morning", label: "Morning" },
  { id: "files", label: "Files" },
  { id: "leads", label: "Leads" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

function isView(value: string | null): value is ViewId {
  return value === "morning" || value === "files" || value === "leads";
}

function isShow(value: string | null): value is FileShow {
  return value === "all" || value === "open" || value === "closed" || value === "did-not-close";
}

function matchesShow(outcome: string, show: FileShow): boolean {
  if (show === "open") return outcome === "Open";
  if (show === "closed") return outcome === "Closed";
  if (show === "did-not-close") return outcome === "Did not close";
  return true;
}

export function ClosepathApp({
  initial,
  email,
  billingNote,
  canManageBilling = false,
}: {
  initial: Workspace;
  email: string;
  billingNote?: string;
  canManageBilling?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const fileId = params.get("file");
  const requested = params.get("view");
  const requestedShow = params.get("show");
  const view: ViewId = isView(requested) ? requested : "morning";
  const show: FileShow = isShow(requestedShow) ? requestedShow : "all";
  const [workspace, setWorkspace] = useState(initial);
  const [today, setToday] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [exportHref, setExportHref] = useState("/api/closepath/export");
  const latest = useRef(initial);
  const pending = useRef<Workspace | null>(null);
  const flight = useRef(false);
  const timer = useRef<number | null>(null);

  useLayoutEffect(() => {
    const iso = todayIso();
    setToday(iso);
    setExportHref(`/api/closepath/export?today=${iso}`);
  }, []);

  useEffect(() => {
    const flush = () => {
      const body = pending.current;
      if (!body) return;
      void fetch("/api/closepath/workspace", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      });
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  useEffect(() => {
    if (!fileId) return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [fileId]);

  async function drain() {
    if (flight.current) return;
    flight.current = true;
    setSaveState("saving");
    let failed = false;
    while (pending.current) {
      const body = pending.current;
      pending.current = null;
      try {
        const res = await fetch("/api/closepath/workspace", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          pending.current = body;
          failed = true;
          break;
        }
      } catch {
        pending.current = body;
        failed = true;
        break;
      }
    }
    flight.current = false;
    setSaveState(failed ? "error" : pending.current ? "saving" : "saved");
    if (pending.current && !failed) void drain();
  }

  function commit(recipe: (current: Workspace) => Workspace) {
    const next = recipe(latest.current);
    latest.current = next;
    setWorkspace(next);
    pending.current = next;
    setSaveState("saving");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void drain();
    }, 400);
  }

  function openFile(id: string) {
    router.push(`/closepath?file=${encodeURIComponent(id)}#dates`);
  }

  function go(next: ViewId, nextShow?: FileShow) {
    if (next === "morning") router.push("/closepath");
    else if (next === "leads") router.push("/closepath?view=leads");
    else if (nextShow && nextShow !== "all") router.push(`/closepath?view=files&show=${nextShow}`);
    else router.push("/closepath?view=files");
  }

  function setOutcome(id: string, outcome: "Open" | "Closed" | "Did not close") {
    commit((current) => ({
      ...current,
      files: current.files.map((item) => (item.id === id ? { ...item, outcome } : item)),
    }));
  }

  const file = fileId ? workspace.files.find((item) => item.id === fileId) : undefined;
  const ordered = today ? filesByAttention(workspace.files, today) : workspace.files;
  const visible = ordered.filter((item) => matchesShow(item.outcome, show));
  const lines = today ? morningLines(workspace.files, today) : morningLines(workspace.files, "2000-01-01");
  const totals = outcomeTotals(workspace.files);
  const hasExamples = workspace.files.some((item) => item.example) || workspace.leads.some((item) => item.example);
  const offerSamples = !workspace.examplesLoaded && !workspace.examplesDismissed;
  const active = file ? "files" : view;
  const title = view === "files" ? "Files" : view === "leads" ? "Leads" : "This morning";
  const blurb =
    view === "files"
      ? "One file per property. Open files are the live deals. Closed and did not close stay in the book."
      : view === "leads"
        ? "People who are not a file yet."
        : "Open this before your inbox. Anything inside three days gets done today.";

  return (
    <main id="content" className="pb-16 pt-20">
      <div className="frame">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:gap-x-6">
          <p className="min-w-0 max-w-full text-[13px] text-paper/50">
            Closepath
            <span className="book-email">{email}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0 text-[14px] sm:items-baseline sm:gap-x-4">
            <span className="text-paper/45">{saveState === "saving" ? "Saving" : saveState === "error" ? "Not saved" : "Saved"}</span>
            {saveState === "error" ? (
              <button type="button" className="book-quiet" onClick={() => void drain()}>
                Retry
              </button>
            ) : null}
            <a href={exportHref} className="book-tap text-paper/70 hover:text-paper">
              Export
            </a>
            {canManageBilling ? (
              <form action="/api/closepath/billing" method="post" className="inline-flex">
                <button type="submit" className="book-quiet">
                  Billing
                </button>
              </form>
            ) : null}
            <form action="/api/closepath/sign-out" method="post" className="inline-flex">
              <button type="submit" className="book-quiet">
                Sign out
              </button>
            </form>
          </div>
        </div>
        {billingNote ? (
          <p className="mt-2 text-[14px] text-paper/70" role="status">
            {billingNote}
          </p>
        ) : null}

        {file ? null : (
          <>
            <h1 className="mt-2 text-[1.7rem] font-semibold leading-none tracking-[-0.045em]">{title}</h1>
            <p className="mt-2 max-w-xl text-[14px] leading-snug text-paper/60">{blurb}</p>
          </>
        )}

        <nav aria-label="Book" className="book-nav mt-3 flex gap-5 border-b border-paper/15 text-[15px]">
          {VIEWS.map((item) => {
            const current = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => go(item.id)}
                className={`book-tab -mb-px border-b pb-1.5 ${current ? "border-paper text-paper" : "border-transparent text-paper/45 hover:text-paper"}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {offerSamples ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-paper/15 py-1 text-[14px] leading-snug sm:items-baseline sm:py-2">
            <p className="min-w-0 max-w-xl text-paper/70">
              Two sample files are ready: 1842 Maple Street and 910 Cedar Avenue. Not your clients. Fake 555 numbers and .test emails.
            </p>
            <span className="flex flex-wrap gap-x-4">
              <button
                type="button"
                className="book-quiet text-paper"
                onClick={() =>
                  commit((current) =>
                    current.examplesLoaded
                      ? current
                      : {
                          ...current,
                          files: [...current.files, ...sampleFiles()],
                          examplesLoaded: true,
                          examplesDismissed: true,
                        },
                  )
                }
              >
                Load samples
              </button>
              <button
                type="button"
                className="book-quiet"
                onClick={() => commit((current) => ({ ...current, examplesDismissed: true }))}
              >
                Dismiss
              </button>
            </span>
          </div>
        ) : null}

        {hasExamples ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[14px] sm:items-baseline">
            <p className="min-w-0 text-paper/50">Sample files are marked Example.</p>
            <button
              type="button"
              className="book-quiet"
              onClick={() => {
              const open = latest.current.files.find((item) => item.id === fileId);
              commit((current) => ({
                ...current,
                files: current.files.filter((item) => !item.example),
                leads: current.leads.filter((item) => !item.example),
                examplesLoaded: true,
                examplesDismissed: true,
              }));
              if (open?.example) router.push("/closepath?view=files");
            }}
            >
              Remove samples
            </button>
          </div>
        ) : null}

        {fileId && !file ? (
          <p className="mt-4 text-[15px] text-paper/70">That file isn’t in this book.</p>
        ) : null}

        {file ? (
          <FileView
            file={file}
            today={today}
            onChange={(next) => commit((current) => ({ ...current, files: current.files.map((item) => (item.id === next.id ? next : item)) }))}
            onAddShowing={() => {
              if (file.showings.length >= LIMITS.showings) return;
              commit((current) => ({
                ...current,
                files: current.files.map((item) =>
                  item.id === file.id ? { ...item, showings: [...item.showings, emptyShowing()] } : item,
                ),
              }));
            }}
            onAddOffer={() => {
              if (file.offers.length >= LIMITS.offers) return;
              commit((current) => ({
                ...current,
                files: current.files.map((item) =>
                  item.id === file.id ? { ...item, offers: [...item.offers, emptyOffer()] } : item,
                ),
              }));
            }}
            onAddAttachment={(attachment: DealAttachment) => {
              commit((current) => ({
                ...current,
                files: current.files.map((item) =>
                  item.id === file.id && !item.attachments.some((row) => row.id === attachment.id)
                    ? { ...item, attachments: [...item.attachments, attachment] }
                    : item,
                ),
              }));
            }}
            onRemoveAttachment={(attachmentId) => {
              commit((current) => ({
                ...current,
                files: current.files.map((item) =>
                  item.id === file.id
                    ? { ...item, attachments: item.attachments.filter((row) => row.id !== attachmentId) }
                    : item,
                ),
              }));
            }}
            onRemove={() => {
              commit((current) => ({ ...current, files: current.files.filter((item) => item.id !== file.id) }));
              router.push("/closepath?view=files");
            }}
          />
        ) : null}

        {!file && view === "morning" ? (
          <>
            <div className="mt-3">
              <CalendarFeed label="Subscribe to these dates" />
            </div>
            <MorningList
            lines={lines}
            closedCount={totals.closed}
            didNotCloseCount={totals.didNotClose}
            today={today}
            onOpen={openFile}
            onReview={() => go("files")}
            onAdd={() => {
              if (latest.current.files.length >= LIMITS.files) return;
              const created = emptyFile();
              commit((current) => ({ ...current, files: [...current.files, created] }));
              router.push(`/closepath?file=${created.id}#dates`);
            }}
          />
          </>
        ) : null}

        {!file && view === "files" ? (
          <FileList
            files={visible}
            book={ordered}
            show={show}
            today={today}
            onOpen={openFile}
            onShow={(next) => go("files", next)}
            onReopen={(id) => setOutcome(id, "Open")}
            onAdd={() => {
              if (latest.current.files.length >= LIMITS.files) return;
              const created = emptyFile();
              commit((current) => ({ ...current, files: [...current.files, created] }));
              router.push(`/closepath?file=${created.id}`);
            }}
          />
        ) : null}

        {!file && view === "leads" ? (
          <LeadList
            leads={workspace.leads}
            onChange={(lead: LooseLead) =>
              commit((current) => ({
                ...current,
                leads: current.leads.map((item) => (item.id === lead.id ? lead : item)),
              }))
            }
            onAdd={() => {
              if (latest.current.leads.length >= LIMITS.leads) return;
              const created = emptyLead();
              commit((current) => ({ ...current, leads: [...current.leads, created] }));
            }}
            onRemove={(id) =>
              commit((current) => ({ ...current, leads: current.leads.filter((item) => item.id !== id) }))
            }
            onStartFile={(id) => {
              const lead = latest.current.leads.find((item) => item.id === id);
              if (!lead) return;
              const created: DealFile = fileFromLead(lead);
              commit((current) => ({
                ...current,
                leads: current.leads.filter((item) => item.id !== id),
                files: [...current.files, created],
              }));
              router.push(`/closepath?file=${created.id}#dates`);
            }}
          />
        ) : null}
      </div>
    </main>
  );
}

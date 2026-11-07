"use client";

import type { ReactNode } from "react";
import {
  type DealFile,
  type MorningLine,
  dayPrimary,
  daySecondary,
  formatDate,
} from "../../lib/closepath-model";

function When({ line, today }: { line: MorningLine; today: string | null }) {
  if (!today) {
    return <span className="block min-w-0 text-[14px] tabular-nums text-paper/70">{formatDate(line.date)}</span>;
  }
  const tone = line.urgency === "past" ? "when-past" : line.urgency === "soon" ? "when-soon" : "";
  const secondary = daySecondary(line.days);
  return (
    <span className="block min-w-0">
      <span className={tone}>
        <span className="text-[15px] font-semibold tabular-nums tracking-[-0.03em]">{dayPrimary(line.days)}</span>
        {secondary ? <span className={`ml-1 text-[12px] ${tone || "text-paper/50"}`}>{secondary}</span> : null}
      </span>
      <span className="block text-[12px] text-paper/45">{formatDate(line.date)}</span>
    </span>
  );
}

function Line({
  line,
  today,
  onOpen,
}: {
  line: MorningLine;
  today: string | null;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(line.fileId)}
      className="grid w-full min-h-11 min-w-0 grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-x-3 border-b border-paper/12 py-2.5 text-left active:bg-paper/[0.04] sm:min-h-0 sm:grid-cols-[6.75rem_11rem_minmax(0,1fr)] sm:items-baseline sm:py-1.5 sm:hover:bg-paper/[0.04]"
    >
      <When line={line} today={today} />
      <span className="hidden text-[14px] sm:block">{line.label}</span>
      <span className="min-w-0">
        <span className="block text-[15px] leading-snug tracking-[-0.02em] sm:truncate">
          {line.address || "No address yet"}
          {line.example ? <span className="ml-2 text-[12px] text-paper/40">Example</span> : null}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-paper/70 sm:hidden">{line.label}</span>
        <span className="block text-[13px] leading-snug text-paper/55 sm:truncate">
          {line.client || "No client"}
          {line.side ? ` · ${line.side}` : ""}
        </span>
      </span>
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="text-[12px] text-paper/45">{title}</h2>
      <div className="mt-1 border-t border-paper/15">{children}</div>
    </section>
  );
}

export function MorningList({
  lines,
  funded,
  today,
  onOpen,
  onAdd,
}: {
  lines: MorningLine[];
  funded: DealFile[];
  today: string | null;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  if (!lines.length && !funded.length) {
    return (
      <div className="mt-4">
        <p className="max-w-xl text-[15px] leading-snug text-paper/70">
          No dates on the books. When a contract is ratified, write the deadlines the same day.
        </p>
        <button type="button" className="book-action mt-4" onClick={onAdd}>
          Add a file
        </button>
      </div>
    );
  }

  if (!today) {
    return (
      <div className="mt-3 border-t border-paper/15">
        {lines.map((line) => (
          <Line key={`${line.fileId}-${line.field}`} line={line} today={today} onOpen={onOpen} />
        ))}
      </div>
    );
  }

  const urgent = lines.filter((line) => line.urgency === "past" || line.urgency === "soon");
  const later = lines.filter((line) => line.urgency === "later");

  return (
    <div>
      {urgent.length ? (
        <Group title="Do these today">
          {urgent.map((line) => (
            <Line key={`${line.fileId}-${line.field}`} line={line} today={today} onOpen={onOpen} />
          ))}
        </Group>
      ) : (
        <p className="mt-4 text-[15px] text-paper/70">Nothing inside three days.</p>
      )}
      {later.length ? (
        <Group title="Later">
          {later.map((line) => (
            <Line key={`${line.fileId}-${line.field}`} line={line} today={today} onOpen={onOpen} />
          ))}
        </Group>
      ) : null}
      {funded.length ? (
        <Group title="Funded">
          {funded.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => onOpen(file.id)}
              className="grid w-full min-h-11 min-w-0 grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-x-3 border-b border-paper/12 py-2.5 text-left active:bg-paper/[0.04] sm:min-h-0 sm:items-baseline sm:py-1.5 sm:hover:bg-paper/[0.04]"
            >
              <span className="text-[14px] text-paper/50">Funded</span>
              <span className="min-w-0 sm:truncate">
                <span className="block text-[15px] leading-snug tracking-[-0.02em] sm:inline">
                  {file.address || "No address yet"}
                </span>
                <span className="block text-[13px] leading-snug text-paper/55 sm:ml-2 sm:inline">{file.client}</span>
              </span>
            </button>
          ))}
        </Group>
      ) : null}
    </div>
  );
}

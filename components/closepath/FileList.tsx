"use client";

import {
  type DealFile,
  commissionFigures,
  formatMoneyAuto,
  nextWatch,
  outcomeTotals,
} from "../../lib/closepath-model";

export const FILE_SHOWS = ["all", "open", "closed", "did-not-close"] as const;
export type FileShow = (typeof FILE_SHOWS)[number];

const FILTERS: { id: FileShow; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "did-not-close", label: "Did not close" },
];

function attention(file: DealFile, today: string | null): { when: string; tone: string; what: string; net: string } {
  const { net } = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
  const netLabel = formatMoneyAuto(net);
  if (file.outcome !== "Open") return { when: "—", tone: "text-paper/40", what: "—", net: netLabel };
  if (!today) return { when: "", tone: "text-paper/50", what: "", net: netLabel };
  const next = nextWatch(file, today);
  if (!next) return { when: "—", tone: "text-paper/40", what: "No date", net: netLabel };
  const tone = next.days < 0 ? "when-past" : next.days <= 3 ? "when-soon" : "text-paper";
  const when =
    next.days < 0
      ? `${Math.abs(next.days)} past`
      : next.days === 0
        ? "Today"
        : next.days === 1
          ? "Tomorrow"
          : `${next.days} days`;
  return { when, tone, what: next.label, net: netLabel };
}

function emptyCopy(show: FileShow, bookEmpty: boolean): string {
  if (bookEmpty) return "No files yet. A file is one property, from the first conversation through close.";
  if (show === "open") return "No open files.";
  if (show === "closed") return "No closed files.";
  if (show === "did-not-close") return "No files that did not close.";
  return "No files yet. A file is one property, from the first conversation through close.";
}

function OutcomeCell({
  file,
  onReopen,
}: {
  file: DealFile;
  onReopen: (id: string) => void;
}) {
  return (
    <span>
      {file.outcome}
      {file.outcome !== "Open" ? (
        <button type="button" className="book-quiet ml-3" onClick={() => onReopen(file.id)} aria-label={`Reopen ${file.address || "this file"}`}>
          Reopen
        </button>
      ) : null}
    </span>
  );
}

export function FileList({
  files,
  book,
  show,
  today,
  onOpen,
  onAdd,
  onShow,
  onReopen,
}: {
  files: DealFile[];
  book: DealFile[];
  show: FileShow;
  today: string | null;
  onOpen: (id: string) => void;
  onAdd: () => void;
  onShow: (show: FileShow) => void;
  onReopen: (id: string) => void;
}) {
  const totals = outcomeTotals(book);
  const netLabel = totals.net === null ? "—" : formatMoneyAuto(totals.net);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-x-5 text-[14px]" role="group" aria-label="File outcome">
        {FILTERS.map((item) => {
          const current = show === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={current}
              onClick={() => onShow(item.id)}
              className={`inline-flex min-h-11 items-center border-b sm:min-h-0 sm:pb-1 ${current ? "border-paper text-paper" : "border-transparent text-paper/45 hover:text-paper"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {book.length ? (
        <p className="mt-2 text-[14px] text-paper/70">
          <span className="tabular-nums text-paper">{totals.closed}</span> closed
          <span className="mx-2 text-paper/30">·</span>
          <span className="tabular-nums text-paper">{totals.didNotClose}</span> did not close
          <span className="mx-2 text-paper/30">·</span>
          <span className="tabular-nums text-paper">{netLabel}</span> net on closed
        </p>
      ) : null}
      {files.length ? (
        <>
          <div className="hidden lg:block">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-paper/15 text-[12px] text-paper/45">
                  <th className="py-1.5 font-normal">Address</th>
                  <th className="py-1.5 font-normal">Client</th>
                  <th className="py-1.5 font-normal">Side</th>
                  <th className="py-1.5 font-normal">Status</th>
                  <th className="py-1.5 font-normal">Outcome</th>
                  <th className="py-1.5 font-normal">Next</th>
                  <th className="py-1.5 font-normal">When</th>
                  <th className="py-1.5 text-right font-normal">Net</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const mark = attention(file, today);
                  return (
                    <tr key={file.id} className="border-b border-paper/10 hover:bg-paper/[0.04]">
                      <td className="py-1.5 pr-3">
                        <button type="button" onClick={() => onOpen(file.id)} className="text-left tracking-[-0.02em]">
                          {file.address || "No address yet"}
                          {file.example ? <span className="ml-2 text-[12px] text-paper/40">Example</span> : null}
                        </button>
                      </td>
                      <td className="py-1.5 pr-3 text-paper/80">{file.client}</td>
                      <td className="py-1.5 pr-3 text-paper/70">{file.side}</td>
                      <td className="py-1.5 pr-3 text-paper/70">{file.status}</td>
                      <td className="py-1.5 pr-3 text-paper/70">
                        <OutcomeCell file={file} onReopen={onReopen} />
                      </td>
                      <td className="py-1.5 pr-3">{mark.what}</td>
                      <td className={`py-1.5 pr-3 tabular-nums ${mark.tone}`}>{mark.when}</td>
                      <td className="py-1.5 text-right tabular-nums">{mark.net}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="border-t border-paper/15 lg:hidden">
            {files.map((file) => {
              const mark = attention(file, today);
              const detail = [
                file.client || "No client",
                file.outcome !== "Open" ? file.outcome : "",
                file.status,
                mark.what && mark.what !== "—" ? mark.what : "",
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={file.id} className="border-b border-paper/12">
                  <div className="flex min-h-11 items-start justify-between gap-3 py-2.5">
                    <button type="button" onClick={() => onOpen(file.id)} className="min-w-0 flex-1 text-left active:bg-paper/[0.04]">
                      <span className="block text-[15px] leading-snug tracking-[-0.02em]">
                        {file.address || "No address yet"}
                        {file.example ? <span className="ml-2 text-[12px] text-paper/40">Example</span> : null}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-paper/55">{detail}</span>
                    </button>
                    <span className="shrink-0 pt-0.5 text-right">
                      <span className={`block text-[14px] font-semibold tabular-nums ${mark.tone}`}>{mark.when}</span>
                      {file.outcome !== "Open" ? (
                        <button type="button" className="book-quiet mt-1" onClick={() => onReopen(file.id)} aria-label={`Reopen ${file.address || "this file"}`}>
                          Reopen
                        </button>
                      ) : null}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="mt-3 max-w-xl text-[15px] leading-snug text-paper/70">{emptyCopy(show, book.length === 0)}</p>
      )}
      <button type="button" className="book-action mt-4" onClick={onAdd}>
        Add a file
      </button>
    </div>
  );
}

"use client";

import {
  type DealFile,
  commissionFigures,
  formatMoneyAuto,
  nextWatch,
} from "../../lib/closepath-model";

function attention(file: DealFile, today: string | null): { when: string; tone: string; what: string; net: string } {
  const { net } = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
  const netLabel = formatMoneyAuto(net);
  if (file.funded === "Yes") return { when: "Funded", tone: "text-paper/50", what: "Funded", net: netLabel };
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

export function FileList({
  files,
  today,
  onOpen,
  onAdd,
}: {
  files: DealFile[];
  today: string | null;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mt-3">
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
              return (
                <li key={file.id} className="border-b border-paper/12">
                  <button type="button" onClick={() => onOpen(file.id)} className="flex min-h-11 w-full items-start justify-between gap-3 py-2.5 text-left active:bg-paper/[0.04]">
                    <span className="min-w-0">
                      <span className="block text-[15px] leading-snug tracking-[-0.02em]">
                        {file.address || "No address yet"}
                        {file.example ? <span className="ml-2 text-[12px] text-paper/40">Example</span> : null}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-paper/55">
                        {[file.client || "No client", file.status, mark.what].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className={`shrink-0 pt-0.5 text-right text-[14px] font-semibold tabular-nums ${mark.tone}`}>{mark.when}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="max-w-xl text-[15px] leading-snug text-paper/70">
          No files yet. A file is one property, from the first conversation to a funded commission.
        </p>
      )}
      <button type="button" className="book-action mt-4" onClick={onAdd}>
        Add a file
      </button>
    </div>
  );
}

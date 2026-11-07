"use client";

import { type LooseLead, LEAD_STATUSES, LIMITS, SIDES, formatDate } from "../../lib/closepath-model";
import { DateField, SelectField, TextField } from "./Fields";

export function LeadList({
  leads,
  onChange,
  onAdd,
  onRemove,
  onStartFile,
}: {
  leads: LooseLead[];
  onChange: (lead: LooseLead) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onStartFile: (id: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="max-w-xl text-[14px] leading-snug text-paper/60">
        People who are not a file yet. A file starts when there is a property.
      </p>
      {leads.length ? (
        <ul className="mt-2 border-t border-paper/15">
          {leads.map((lead) => (
            <li key={lead.id} className="border-b border-paper/12 py-2">
              {lead.example ? <p className="text-[12px] text-paper/40">Example</p> : null}
              <div className="grid min-w-0 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-4">
                <TextField id={`${lead.id}-name`} label="Name" value={lead.name} onChange={(name) => onChange({ ...lead, name })} />
                <TextField id={`${lead.id}-phone`} label="Phone" type="tel" maxLength={LIMITS.phone} value={lead.phone} onChange={(phone) => onChange({ ...lead, phone })} />
                <TextField id={`${lead.id}-email`} label="Email" type="email" maxLength={LIMITS.email} value={lead.email} onChange={(email) => onChange({ ...lead, email })} />
                <TextField id={`${lead.id}-source`} label="Source" value={lead.source} onChange={(source) => onChange({ ...lead, source })} />
                <SelectField id={`${lead.id}-side`} label="Side" value={lead.side} options={SIDES} onChange={(side) => onChange({ ...lead, side: side as LooseLead["side"] })} />
                <TextField id={`${lead.id}-search`} label="Property or search" value={lead.propertyOrSearch} onChange={(propertyOrSearch) => onChange({ ...lead, propertyOrSearch })} />
                <DateField id={`${lead.id}-first`} label="First contact" value={lead.firstContact} onChange={(firstContact) => onChange({ ...lead, firstContact })} />
                <DateField id={`${lead.id}-next`} label="Next follow-up" value={lead.nextFollowUp} onChange={(nextFollowUp) => onChange({ ...lead, nextFollowUp })} />
                <SelectField id={`${lead.id}-status`} label="Status" value={lead.status} options={LEAD_STATUSES} onChange={(status) => onChange({ ...lead, status: status as LooseLead["status"] })} />
              </div>
              <div className="mt-1 flex flex-col items-start sm:mt-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4 sm:gap-y-1">
                <button type="button" className="book-quiet max-w-full whitespace-normal text-left" onClick={() => onStartFile(lead.id)}>
                  Start a file{lead.nextFollowUp ? ` · next ${formatDate(lead.nextFollowUp)}` : ""}
                </button>
                <button type="button" className="book-quiet" onClick={() => onRemove(lead.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-paper/70">No loose leads.</p>
      )}
      <button type="button" className="book-action mt-4" onClick={onAdd}>
        Add a lead
      </button>
    </div>
  );
}

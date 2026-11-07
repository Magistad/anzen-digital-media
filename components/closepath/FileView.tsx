"use client";

import { useState, type ReactNode } from "react";
import {
  COMMISSION_STATUSES,
  DEAL_STATUSES,
  DATE_FIELDS,
  FILE_OUTCOMES,
  LEAD_STATUSES,
  LIMITS,
  OFFER_STATUSES,
  SHOWING_RESULTS,
  SIDES,
  YES_NO,
  type DealFile,
  type FileOutcome,
  type Offer,
  type Showing,
  commissionFigures,
  dayPrimary,
  daySecondary,
  daysUntil,
  fileSummary,
  formatMoney,
  formatMoneyAuto,
  urgency,
} from "../../lib/closepath-model";
import { AreaField, DateField, MoneyField, PercentField, SelectField, TextField } from "./Fields";

function DayState({ iso, today, quiet }: { iso: string | null; today: string | null; quiet?: boolean }) {
  if (!iso) return <span className="text-[13px] text-paper/40">Not written</span>;
  if (!today || quiet) return null;
  const days = daysUntil(iso, today);
  if (days === null) return null;
  const level = urgency(days);
  const tone = level === "past" ? "when-past" : level === "soon" ? "when-soon" : "text-paper/70";
  const secondary = daySecondary(days);
  return (
    <span className={`text-[14px] tabular-nums sm:text-[13px] ${tone}`}>
      <span className="font-semibold">{dayPrimary(days)}</span>
      {secondary ? <span className="ml-1">{secondary}</span> : null}
    </span>
  );
}

function ShowingRow({
  showing,
  onChange,
  onRemove,
}: {
  showing: Showing;
  onChange: (showing: Showing) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-b border-paper/12 py-3 sm:py-2">
      <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-4">
        <DateField id={`${showing.id}-date`} label="Date" value={showing.date} onChange={(date) => onChange({ ...showing, date })} />
        <TextField id={`${showing.id}-time`} label="Time" value={showing.time} maxLength={40} onChange={(time) => onChange({ ...showing, time })} />
        <SelectField id={`${showing.id}-confirmed`} label="Confirmed" value={showing.confirmed} options={YES_NO} onChange={(confirmed) => onChange({ ...showing, confirmed: confirmed as Showing["confirmed"] })} />
        <SelectField id={`${showing.id}-result`} label="Result" value={showing.result} options={SHOWING_RESULTS} onChange={(result) => onChange({ ...showing, result: result as Showing["result"] })} />
        <TextField id={`${showing.id}-feedback`} label="Feedback" value={showing.feedback} maxLength={LIMITS.notes} onChange={(feedback) => onChange({ ...showing, feedback })} />
        <TextField id={`${showing.id}-next`} label="Next step" value={showing.nextStep} maxLength={LIMITS.notes} onChange={(nextStep) => onChange({ ...showing, nextStep })} />
      </div>
      <button type="button" className="book-quiet mt-1" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function OfferRow({
  offer,
  onChange,
  onRemove,
}: {
  offer: Offer;
  onChange: (offer: Offer) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-b border-paper/12 py-3 sm:py-2">
      <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-4">
        <DateField id={`${offer.id}-date`} label="Date" value={offer.date} onChange={(date) => onChange({ ...offer, date })} />
        <MoneyField id={`${offer.id}-list`} label="List price" value={offer.listPrice} onChange={(listPrice) => onChange({ ...offer, listPrice })} />
        <MoneyField id={`${offer.id}-price`} label="Offer price" value={offer.offerPrice} onChange={(offerPrice) => onChange({ ...offer, offerPrice })} />
        <MoneyField id={`${offer.id}-earnest`} label="Earnest money" value={offer.earnestMoney} onChange={(earnestMoney) => onChange({ ...offer, earnestMoney })} />
        <MoneyField id={`${offer.id}-concessions`} label="Concessions" value={offer.concessions} onChange={(concessions) => onChange({ ...offer, concessions })} />
        <SelectField id={`${offer.id}-status`} label="Status" value={offer.status} options={OFFER_STATUSES} onChange={(status) => onChange({ ...offer, status: status as Offer["status"] })} />
        <DateField id={`${offer.id}-expires`} label="Expires" value={offer.expires} onChange={(expires) => onChange({ ...offer, expires })} />
        <TextField id={`${offer.id}-notes`} label="Notes" value={offer.notes} maxLength={LIMITS.notes} onChange={(notes) => onChange({ ...offer, notes })} />
      </div>
      <button type="button" className="book-quiet mt-1" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function DateLine({ label, state, children }: { label: string; state?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-paper/10 py-2 sm:grid-cols-[9.25rem_minmax(0,12rem)_auto] sm:items-center sm:py-1">
      <span className="min-w-0 text-[14px] leading-snug">{label}</span>
      <span className="shrink-0 text-right sm:col-start-3">{state}</span>
      <div className="col-span-2 min-w-0 pt-1 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:pt-0">{children}</div>
    </div>
  );
}

const FILE_JUMPS = [
  ["dates", "Dates"],
  ["client", "Client"],
  ["showings", "Showings"],
  ["offers", "Offers"],
  ["commission", "Commission"],
] as const;

function OutcomeActions({
  outcome,
  onOutcome,
}: {
  outcome: FileOutcome;
  onOutcome: (outcome: FileOutcome) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[14px]">
      <span className="text-paper/45">Outcome</span>
      <span>{outcome}</span>
      {FILE_OUTCOMES.filter((item) => item !== outcome).map((item) => (
        <button key={item} type="button" className="book-quiet text-paper" onClick={() => onOutcome(item)}>
          {item === "Closed" ? "Mark closed" : item === "Open" ? "Reopen" : "Did not close"}
        </button>
      ))}
    </div>
  );
}

function Section({ id, title, detail, children }: { id?: string; title: string; detail?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 lg:scroll-mt-24">
      <h2 className="text-[12px] text-paper/45">{title}</h2>
      {detail ? <p className="mt-1 max-w-xl text-[14px] leading-snug text-paper/60">{detail}</p> : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function FileView({
  file,
  today,
  onChange,
  onAddShowing,
  onAddOffer,
  onRemove,
}: {
  file: DealFile;
  today: string | null;
  onChange: (file: DealFile) => void;
  onAddShowing: () => void;
  onAddOffer: () => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const figures = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
  const summaryToday = today ?? "1970-01-01";

  return (
    <div className="mt-3">
      <label htmlFor={`${file.id}-address`} className="sr-only">
        Address
      </label>
      <input
        id={`${file.id}-address`}
        className="w-full min-w-0 max-w-full bg-transparent text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-paper placeholder:text-paper/30 sm:text-[1.7rem] sm:leading-none sm:tracking-[-0.045em]"
        value={file.address}
        placeholder="Street address"
        maxLength={LIMITS.text}
        autoComplete="off"
        onChange={(event) => onChange({ ...file, address: event.target.value })}
      />
      <p className="mt-2 text-[14px] leading-snug text-paper/65">
        {file.example ? <span className="text-paper/45">Example. Not a client. </span> : null}
        {today ? fileSummary(file, today) : fileSummary(file, summaryToday)}
      </p>
      <OutcomeActions outcome={file.outcome} onOutcome={(outcome) => onChange({ ...file, outcome })} />

      <nav aria-label="In this file" className="mt-3 flex flex-wrap border-b border-paper/15 text-[14px] lg:hidden">
        {FILE_JUMPS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center pr-4 text-paper/75">
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-3 grid min-w-0 gap-y-5 lg:grid-cols-2 lg:gap-x-10">
        <div className="order-2 min-w-0 lg:order-none lg:col-span-2 lg:row-start-1">
          <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 sm:gap-y-2 lg:grid-cols-4">
            <SelectField id={`${file.id}-side`} label="Side" value={file.side} options={SIDES} onChange={(side) => onChange({ ...file, side: side as DealFile["side"] })} />
            <SelectField id={`${file.id}-status`} label="Status" value={file.status} options={DEAL_STATUSES} onChange={(status) => onChange({ ...file, status: status as DealFile["status"] })} />
            <TextField id={`${file.id}-client`} label="Client" value={file.client} onChange={(client) => onChange({ ...file, client })} />
            <MoneyField id={`${file.id}-list`} label="List price" value={file.listPrice} onChange={(listPrice) => onChange({ ...file, listPrice })} />
            <MoneyField id={`${file.id}-contract`} label="Contract price" value={file.contractPrice} onChange={(contractPrice) => onChange({ ...file, contractPrice })} />
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
        <Section id="dates" title="Critical dates" detail="Write these the day the contract is ratified.">
          <div className="border-t border-paper/15">
            <DateLine label="Contract">
              <DateField id={`${file.id}-contract-date`} label="Contract date" bare value={file.contractDate} onChange={(contractDate) => onChange({ ...file, contractDate })} />
            </DateLine>
            {DATE_FIELDS.map((field) => (
              <DateLine
                key={field.key}
                label={field.label}
                state={<DayState iso={file[field.key]} today={today} quiet={file.outcome !== "Open"} />}
              >
                <DateField
                  id={`${file.id}-${field.key}`}
                  label={field.label}
                  bare
                  value={file[field.key]}
                  onChange={(value) => onChange({ ...file, [field.key]: value })}
                />
              </DateLine>
            ))}
          </div>
          <div className="mt-2">
            <AreaField id={`${file.id}-date-notes`} label="Date notes" value={file.dateNotes} onChange={(dateNotes) => onChange({ ...file, dateNotes })} />
          </div>
        </Section>
        </div>

        <div className="order-6 min-w-0 lg:order-none lg:col-start-2 lg:row-start-2">
        <Section id="commission" title="Commission" detail="Sale price times your rate, then your split. Mark it paid only when the money is in your account.">
          {file.salePrice === null && file.contractPrice !== null ? (
            <button type="button" className="book-quiet mb-2" onClick={() => onChange({ ...file, salePrice: file.contractPrice })}>
              Use contract price {formatMoney(file.contractPrice)}
            </button>
          ) : null}
          <div className="grid min-w-0 gap-x-3 gap-y-3 sm:grid-cols-3 sm:gap-y-2">
            <MoneyField id={`${file.id}-sale`} label="Sale price" value={file.salePrice} onChange={(salePrice) => onChange({ ...file, salePrice })} />
            <PercentField id={`${file.id}-rate`} label="Rate (%)" value={file.ratePercent} onChange={(ratePercent) => onChange({ ...file, ratePercent })} />
            <PercentField id={`${file.id}-split`} label="Your split (%)" value={file.splitPercent} onChange={(splitPercent) => onChange({ ...file, splitPercent })} />
          </div>
          <div className="mt-3 grid min-w-0 grid-cols-2 gap-x-4 border-t border-paper/15 py-2">
            <div>
              <div className="text-[12px] text-paper/45">Gross</div>
              <div className="text-[1.35rem] font-semibold tabular-nums tracking-[-0.03em]">
                {figures.gross === null ? "—" : formatMoneyAuto(figures.gross)}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-paper/45">Your net</div>
              <div className="text-[1.35rem] font-semibold tabular-nums tracking-[-0.03em]">
                {figures.net === null ? "—" : formatMoneyAuto(figures.net)}
              </div>
            </div>
          </div>
          <div className="grid min-w-0 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-2">
            <SelectField id={`${file.id}-commission-status`} label="Status" value={file.commissionStatus} options={COMMISSION_STATUSES} onChange={(commissionStatus) => onChange({ ...file, commissionStatus: commissionStatus as DealFile["commissionStatus"] })} />
            <DateField id={`${file.id}-paid`} label="Paid date" value={file.paidDate} onChange={(paidDate) => onChange({ ...file, paidDate })} />
          </div>
          <div className="mt-2">
            <AreaField id={`${file.id}-commission-notes`} label="Commission notes" value={file.commissionNotes} onChange={(commissionNotes) => onChange({ ...file, commissionNotes })} />
          </div>
        </Section>
        </div>

        <div className="order-4 min-w-0 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-3">
        <Section id="showings" title="Showings" detail="One row every time you open a door.">
          <div className="border-t border-paper/15">
            {file.showings.map((showing) => (
              <ShowingRow
                key={showing.id}
                showing={showing}
                onChange={(next) => onChange({ ...file, showings: file.showings.map((row) => (row.id === showing.id ? next : row)) })}
                onRemove={() => onChange({ ...file, showings: file.showings.filter((row) => row.id !== showing.id) })}
              />
            ))}
          </div>
          <button type="button" className="book-action mt-3" onClick={onAddShowing}>
            Add a showing
          </button>
        </Section>
        </div>

        <div className="order-5 min-w-0 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-4">
        <Section id="offers" title="Offers" detail="Price, earnest money, and whether the offer is still alive.">
          <div className="border-t border-paper/15">
            {file.offers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onChange={(next) => onChange({ ...file, offers: file.offers.map((row) => (row.id === offer.id ? next : row)) })}
                onRemove={() => onChange({ ...file, offers: file.offers.filter((row) => row.id !== offer.id) })}
              />
            ))}
          </div>
          <button type="button" className="book-action mt-3" onClick={onAddOffer}>
            Add an offer
          </button>
        </Section>
        </div>

        <div className="order-3 min-w-0 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-5">
        <Section id="client" title="Client" detail="Where they came from, and the next time you will contact them.">
          <div className="grid min-w-0 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-4">
            <TextField id={`${file.id}-phone`} label="Phone" type="tel" maxLength={LIMITS.phone} value={file.phone} onChange={(phone) => onChange({ ...file, phone })} />
            <TextField id={`${file.id}-email`} label="Email" type="email" maxLength={LIMITS.email} value={file.email} onChange={(email) => onChange({ ...file, email })} />
            <TextField id={`${file.id}-source`} label="Source" value={file.source} onChange={(source) => onChange({ ...file, source })} />
            <TextField id={`${file.id}-search`} label="Property or search" value={file.propertyOrSearch} onChange={(propertyOrSearch) => onChange({ ...file, propertyOrSearch })} />
            <DateField id={`${file.id}-first`} label="First contact" value={file.firstContact} onChange={(firstContact) => onChange({ ...file, firstContact })} />
            <DateField id={`${file.id}-follow`} label="Next follow-up" value={file.nextFollowUp} onChange={(nextFollowUp) => onChange({ ...file, nextFollowUp })} />
            <SelectField id={`${file.id}-lead-status`} label="Lead status" value={file.leadStatus} options={LEAD_STATUSES} onChange={(leadStatus) => onChange({ ...file, leadStatus: leadStatus as DealFile["leadStatus"] })} />
          </div>
          <div className="mt-3 grid min-w-0 gap-3 sm:mt-2 lg:grid-cols-2">
            <AreaField id={`${file.id}-lead-notes`} label="Client notes" value={file.leadNotes} onChange={(leadNotes) => onChange({ ...file, leadNotes })} />
            <AreaField id={`${file.id}-notes`} label="File notes" value={file.notes} onChange={(notes) => onChange({ ...file, notes })} />
          </div>
        </Section>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 border-t border-paper/15 pt-1 sm:items-baseline sm:pt-3">
        {confirming ? (
          <>
            <button type="button" className="book-quiet" onClick={onRemove}>
              Remove this file
            </button>
            <button type="button" className="book-quiet" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className="book-quiet" onClick={() => setConfirming(true)}>
            Remove this file
          </button>
        )}
      </div>
    </div>
  );
}

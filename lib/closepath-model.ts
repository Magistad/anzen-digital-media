export const SIDES = ["Listing", "Buyer"] as const;
/** Where the transaction is. Close result is `outcome`, not another status. */
export const DEAL_STATUSES = [
  "Prospect",
  "Showing",
  "Offer out",
  "Under contract",
  "Clear to close",
] as const;
/** Open while the file is live. Closed means the deal funded. Did not close means it fell through. */
export const FILE_OUTCOMES = ["Open", "Closed", "Did not close"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Nurture", "Appointment set", "Active", "Cold"] as const;
export const SHOWING_RESULTS = ["Scheduled", "Completed", "No-show", "Cancelled"] as const;
export const YES_NO = ["Yes", "No"] as const;
export const OFFER_STATUSES = ["Draft", "Submitted", "Counter", "Accepted", "Rejected", "Expired"] as const;
export const COMMISSION_STATUSES = ["Expected", "On statement", "Funded", "Paid"] as const;

export const LIMITS = {
  files: 100,
  leads: 200,
  showings: 80,
  offers: 40,
  text: 240,
  notes: 2000,
  email: 200,
  phone: 40,
} as const;

export type Side = (typeof SIDES)[number];
export type DealStatus = (typeof DEAL_STATUSES)[number];
export type FileOutcome = (typeof FILE_OUTCOMES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ShowingResult = (typeof SHOWING_RESULTS)[number];
export type YesNo = (typeof YES_NO)[number];
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export type Showing = {
  id: string;
  date: string | null;
  time: string;
  confirmed: YesNo | "";
  result: ShowingResult | "";
  feedback: string;
  nextStep: string;
};

export type Offer = {
  id: string;
  date: string | null;
  listPrice: number | null;
  offerPrice: number | null;
  earnestMoney: number | null;
  concessions: number | null;
  status: OfferStatus | "";
  expires: string | null;
  notes: string;
};

/** One property. Dates, showings, offers, and commission hang off this file. */
export type DealFile = {
  id: string;
  address: string;
  side: Side | "";
  client: string;
  phone: string;
  email: string;
  source: string;
  status: DealStatus | "";
  outcome: FileOutcome;
  listPrice: number | null;
  contractPrice: number | null;
  notes: string;
  example?: boolean;
  propertyOrSearch: string;
  firstContact: string | null;
  nextFollowUp: string | null;
  leadStatus: LeadStatus | "";
  leadNotes: string;
  contractDate: string | null;
  inspectionDeadline: string | null;
  appraisalDeadline: string | null;
  loanContingency: string | null;
  closeDate: string | null;
  dateNotes: string;
  showings: Showing[];
  offers: Offer[];
  salePrice: number | null;
  ratePercent: number | null;
  splitPercent: number | null;
  paidDate: string | null;
  commissionStatus: CommissionStatus | "";
  commissionNotes: string;
};

/** A person who is not a file yet. A file starts when there is a property. */
export type LooseLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  side: Side | "";
  propertyOrSearch: string;
  firstContact: string | null;
  nextFollowUp: string | null;
  status: LeadStatus | "";
  notes: string;
  example?: boolean;
};

export type Workspace = {
  files: DealFile[];
  leads: LooseLead[];
  examplesLoaded: boolean;
  examplesDismissed: boolean;
};

export const DATE_FIELDS = [
  { key: "inspectionDeadline", label: "Inspection deadline" },
  { key: "appraisalDeadline", label: "Appraisal deadline" },
  { key: "loanContingency", label: "Loan contingency" },
  { key: "closeDate", label: "Close date" },
] as const;

export type DateFieldKey = (typeof DATE_FIELDS)[number]["key"];

export type Urgency = "past" | "soon" | "later" | "none";

export function newId(): string {
  return crypto.randomUUID();
}

export function emptyWorkspace(): Workspace {
  return { files: [], leads: [], examplesLoaded: false, examplesDismissed: false };
}

export function emptyShowing(id = newId()): Showing {
  return { id, date: null, time: "", confirmed: "", result: "", feedback: "", nextStep: "" };
}

export function emptyOffer(id = newId()): Offer {
  return {
    id,
    date: null,
    listPrice: null,
    offerPrice: null,
    earnestMoney: null,
    concessions: null,
    status: "",
    expires: null,
    notes: "",
  };
}

export function emptyFile(id = newId()): DealFile {
  return {
    id,
    address: "",
    side: "",
    client: "",
    phone: "",
    email: "",
    source: "",
    status: "",
    outcome: "Open",
    listPrice: null,
    contractPrice: null,
    notes: "",
    propertyOrSearch: "",
    firstContact: null,
    nextFollowUp: null,
    leadStatus: "",
    leadNotes: "",
    contractDate: null,
    inspectionDeadline: null,
    appraisalDeadline: null,
    loanContingency: null,
    closeDate: null,
    dateNotes: "",
    showings: [],
    offers: [],
    salePrice: null,
    ratePercent: null,
    splitPercent: null,
    paidDate: null,
    commissionStatus: "",
    commissionNotes: "",
  };
}

export function emptyLead(id = newId()): LooseLead {
  return {
    id,
    name: "",
    phone: "",
    email: "",
    source: "",
    side: "",
    propertyOrSearch: "",
    firstContact: null,
    nextFollowUp: null,
    status: "",
    notes: "",
  };
}

export function fileFromLead(lead: LooseLead): DealFile {
  const file = emptyFile();
  file.client = lead.name;
  file.phone = lead.phone;
  file.email = lead.email;
  file.source = lead.source;
  file.side = lead.side;
  file.propertyOrSearch = lead.propertyOrSearch;
  file.firstContact = lead.firstContact;
  file.nextFollowUp = lead.nextFollowUp;
  file.leadStatus = lead.status;
  file.leadNotes = lead.notes;
  file.example = lead.example;
  if (lead.side === "Listing") file.address = lead.propertyOrSearch;
  return file;
}

export function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysUntil(iso: string | null, today: string): number | null {
  if (!iso) return null;
  const target = parseIsoDate(iso);
  const from = parseIsoDate(today);
  if (!target || !from) return null;
  const a = Date.UTC(target.y, target.m - 1, target.d);
  const b = Date.UTC(from.y, from.m - 1, from.d);
  return Math.round((a - b) / 86_400_000);
}

export function urgency(days: number | null): Urgency {
  if (days === null) return "none";
  if (days < 0) return "past";
  if (days <= 3) return "soon";
  return "later";
}

export function dayPrimary(days: number): string {
  if (days < 0) return String(Math.abs(days));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return String(days);
}

export function daySecondary(days: number): string {
  if (days < 0) return Math.abs(days) === 1 ? "day past" : "days past";
  if (days === 0 || days === 1) return "";
  return "days";
}

export function formatDate(iso: string | null): string {
  const parsed = iso ? parseIsoDate(iso) : null;
  if (!parsed) return "";
  const date = new Date(parsed.y, parsed.m - 1, parsed.d);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function formatMoney(value: number | null, cents = false): string {
  if (value === null || !Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value);
}

export function formatMoneyAuto(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "";
  const cents = Math.abs(value - Math.round(value)) > 0.001;
  return formatMoney(value, cents);
}

export function commissionFigures(
  salePrice: number | null,
  ratePercent: number | null,
  splitPercent: number | null,
): { gross: number | null; net: number | null } {
  if (salePrice === null || ratePercent === null) return { gross: null, net: null };
  const gross = Math.round(salePrice * (ratePercent / 100) * 100) / 100;
  if (splitPercent === null) return { gross, net: null };
  const net = Math.round(gross * (splitPercent / 100) * 100) / 100;
  return { gross, net };
}

export type WatchedDate = { date: string; label: string; days: number; key: DateFieldKey };

export function watchedDates(file: DealFile, today: string): WatchedDate[] {
  const rows: WatchedDate[] = [];
  for (const field of DATE_FIELDS) {
    const date = file[field.key];
    const days = daysUntil(date, today);
    if (!date || days === null) continue;
    rows.push({ date, label: field.label, days, key: field.key });
  }
  rows.sort((a, b) => a.days - b.days || a.label.localeCompare(b.label));
  return rows;
}

/** Soonest date still ahead. If every date is past, the most overdue one. */
export function nextWatch(file: DealFile, today: string): WatchedDate | null {
  const rows = watchedDates(file, today);
  if (!rows.length) return null;
  const ahead = rows.find((row) => row.days >= 0);
  return ahead ?? rows[0] ?? null;
}

export function filesByAttention(files: DealFile[], today: string): DealFile[] {
  const rank = (file: DealFile) => {
    if (file.outcome === "Closed") return 20_000;
    if (file.outcome === "Did not close") return 30_000;
    const next = nextWatch(file, today);
    if (!next) return 10_000;
    return next.days;
  };
  return [...files].sort((a, b) => rank(a) - rank(b) || a.address.localeCompare(b.address));
}

export type OutcomeTotals = {
  closed: number;
  didNotClose: number;
  /** Net commission on Closed files. Null when none of those files has a calculable net. */
  net: number | null;
};

/** Counts for the lookback. Net is sale price × rate × split, and only Closed files contribute. */
export function outcomeTotals(files: DealFile[]): OutcomeTotals {
  let closed = 0;
  let didNotClose = 0;
  let net = 0;
  let hasNet = false;
  for (const file of files) {
    if (file.outcome === "Did not close") {
      didNotClose += 1;
      continue;
    }
    if (file.outcome !== "Closed") continue;
    closed += 1;
    const figures = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
    if (figures.net !== null) {
      net += figures.net;
      hasNet = true;
    }
  }
  return {
    closed,
    didNotClose,
    net: hasNet ? Math.round(net * 100) / 100 : null,
  };
}

export type MorningLine = {
  fileId: string;
  field: DateFieldKey;
  label: string;
  address: string;
  client: string;
  side: Side | "";
  date: string;
  days: number;
  urgency: Urgency;
  example: boolean;
};

export function morningLines(files: DealFile[], today: string): MorningLine[] {
  const lines: MorningLine[] = [];
  for (const file of files) {
    if (file.outcome !== "Open") continue;
    for (const row of watchedDates(file, today)) {
      lines.push({
        fileId: file.id,
        field: row.key,
        label: row.label,
        address: file.address,
        client: file.client,
        side: file.side,
        date: row.date,
        days: row.days,
        urgency: urgency(row.days),
        example: Boolean(file.example),
      });
    }
  }
  lines.sort((a, b) => a.days - b.days || a.address.localeCompare(b.address) || a.label.localeCompare(b.label));
  return lines;
}

export function fileSummary(file: DealFile, today: string): string {
  const parts: string[] = [];
  if (file.outcome !== "Open") parts.push(file.outcome);
  if (file.nextFollowUp && daysUntil(file.nextFollowUp, today) !== null) {
    parts.push(`Next contact ${formatDate(file.nextFollowUp)}`);
  } else {
    parts.push("No next contact");
  }
  parts.push(file.showings.length === 1 ? "1 showing" : `${file.showings.length} showings`);
  const live = [...file.offers].reverse().find((offer) => offer.status === "Accepted") ?? file.offers.at(-1);
  if (!live) parts.push("No offer");
  else if (live.status) parts.push(`Offer ${live.status.toLowerCase()}`);
  else parts.push(file.offers.length === 1 ? "1 offer" : `${file.offers.length} offers`);
  const { net } = commissionFigures(file.salePrice, file.ratePercent, file.splitPercent);
  if (net !== null) {
    const money = formatMoneyAuto(net);
    parts.push(file.commissionStatus === "Paid" ? `Net ${money} paid` : `Net ${money}`);
  }
  return parts.join(" · ");
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

function oneOf<T extends string>(value: unknown, options: readonly T[]): T | "" {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : "";
}

function money(value: unknown): number | null {
  let next = value;
  if (typeof next === "string") {
    const cleaned = next.replace(/[$,\s]/g, "");
    if (!cleaned) return null;
    next = Number(cleaned);
  }
  if (typeof next !== "number" || !Number.isFinite(next)) return null;
  if (next < 0 || next > 1_000_000_000) return null;
  return Math.round(next * 100) / 100;
}

function percent(value: unknown): number | null {
  const next = money(value);
  if (next === null || next > 100) return null;
  return next;
}

function iso(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return parseIsoDate(value) ? value : null;
}

function idOf(value: unknown): string {
  if (typeof value === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(value)) return value;
  return newId();
}

function flag(value: unknown): boolean {
  return value === true;
}

function sanitizeShowing(value: unknown): Showing | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    id: idOf(row.id),
    date: iso(row.date),
    time: text(row.time, 40),
    confirmed: oneOf(row.confirmed, YES_NO),
    result: oneOf(row.result, SHOWING_RESULTS),
    feedback: text(row.feedback, LIMITS.notes),
    nextStep: text(row.nextStep, LIMITS.notes),
  };
}

function sanitizeOffer(value: unknown): Offer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    id: idOf(row.id),
    date: iso(row.date),
    listPrice: money(row.listPrice),
    offerPrice: money(row.offerPrice),
    earnestMoney: money(row.earnestMoney),
    concessions: money(row.concessions),
    status: oneOf(row.status, OFFER_STATUSES),
    expires: iso(row.expires),
    notes: text(row.notes, LIMITS.notes),
  };
}

/** Older books stored the close on status ("Closed", "Funded", "Fell through") or funded = Yes. */
function outcomeFromLegacy(row: Record<string, unknown>): FileOutcome {
  const explicit = oneOf(row.outcome, FILE_OUTCOMES);
  if (explicit) return explicit;
  const status = typeof row.status === "string" ? row.status.trim() : "";
  if (status === "Fell through") return "Did not close";
  if (status === "Closed" || status === "Funded" || row.funded === "Yes") return "Closed";
  return "Open";
}

function sanitizeFile(value: unknown): DealFile | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const showings = Array.isArray(row.showings) ? row.showings.flatMap((item) => {
    const next = sanitizeShowing(item);
    return next ? [next] : [];
  }) : [];
  const offers = Array.isArray(row.offers) ? row.offers.flatMap((item) => {
    const next = sanitizeOffer(item);
    return next ? [next] : [];
  }) : [];
  if (showings.length > LIMITS.showings || offers.length > LIMITS.offers) return null;
  const file = emptyFile(idOf(row.id));
  return {
    ...file,
    address: text(row.address, LIMITS.text),
    side: oneOf(row.side, SIDES),
    client: text(row.client, LIMITS.text),
    phone: text(row.phone, LIMITS.phone),
    email: text(row.email, LIMITS.email),
    source: text(row.source, LIMITS.text),
    status: oneOf(row.status, DEAL_STATUSES),
    outcome: outcomeFromLegacy(row),
    listPrice: money(row.listPrice),
    contractPrice: money(row.contractPrice),
    notes: text(row.notes, LIMITS.notes),
    example: flag(row.example) || undefined,
    propertyOrSearch: text(row.propertyOrSearch, LIMITS.text),
    firstContact: iso(row.firstContact),
    nextFollowUp: iso(row.nextFollowUp),
    leadStatus: oneOf(row.leadStatus, LEAD_STATUSES),
    leadNotes: text(row.leadNotes, LIMITS.notes),
    contractDate: iso(row.contractDate),
    inspectionDeadline: iso(row.inspectionDeadline),
    appraisalDeadline: iso(row.appraisalDeadline),
    loanContingency: iso(row.loanContingency),
    closeDate: iso(row.closeDate),
    dateNotes: text(row.dateNotes, LIMITS.notes),
    showings,
    offers,
    salePrice: money(row.salePrice),
    ratePercent: percent(row.ratePercent),
    splitPercent: percent(row.splitPercent),
    paidDate: iso(row.paidDate),
    commissionStatus: oneOf(row.commissionStatus, COMMISSION_STATUSES),
    commissionNotes: text(row.commissionNotes, LIMITS.notes),
  };
}

function sanitizeLead(value: unknown): LooseLead | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  return {
    id: idOf(row.id),
    name: text(row.name, LIMITS.text),
    phone: text(row.phone, LIMITS.phone),
    email: text(row.email, LIMITS.email),
    source: text(row.source, LIMITS.text),
    side: oneOf(row.side, SIDES),
    propertyOrSearch: text(row.propertyOrSearch, LIMITS.text),
    firstContact: iso(row.firstContact),
    nextFollowUp: iso(row.nextFollowUp),
    status: oneOf(row.status, LEAD_STATUSES),
    notes: text(row.notes, LIMITS.notes),
    example: flag(row.example) || undefined,
  };
}

export function sanitizeWorkspace(input: unknown): Workspace | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  if (!Array.isArray(row.files) || !Array.isArray(row.leads)) return null;
  if (row.files.length > LIMITS.files || row.leads.length > LIMITS.leads) return null;
  const files: DealFile[] = [];
  for (const item of row.files) {
    const file = sanitizeFile(item);
    if (!file) return null;
    files.push(file);
  }
  const leads: LooseLead[] = [];
  for (const item of row.leads) {
    const lead = sanitizeLead(item);
    if (!lead) return null;
    leads.push(lead);
  }
  return {
    files,
    leads,
    examplesLoaded: row.examplesLoaded === true,
    examplesDismissed: row.examplesDismissed === true,
  };
}

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length > LIMITS.email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

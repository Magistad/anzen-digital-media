import {
  DATE_FIELDS,
  type DealFile,
  type Offer,
  type Showing,
  formatMoney,
  parseIsoDate,
} from "./closepath-model";

/** One all-day date an agent can drop on a phone or computer calendar. */
export type CalendarEvent = {
  key: string;
  uid: string;
  label: string;
  summary: string;
  description: string;
  location: string;
  /** Inclusive start, YYYY-MM-DD. The calendar end is the next day. */
  date: string;
};

const HOST = "anzendigitalmedia.com";

export function addIsoDays(iso: string, days: number): string | null {
  const parsed = parseIsoDate(iso);
  if (!parsed) return null;
  const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatCalendarDate(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return "";
  const date = new Date(parsed.y, parsed.m - 1, parsed.d);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function calendarFilename(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `closepath-${slug || "dates"}.ics`;
}

function clip(value: string, max: number): string {
  const clean = value.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function oneLine(value: string, max: number): string {
  return clip(value.replace(/\s+/g, " "), max);
}

function priceLine(file: DealFile): string {
  if (file.contractPrice !== null) return `Contract price: ${formatMoney(file.contractPrice)}`;
  if (file.listPrice !== null) return `List price: ${formatMoney(file.listPrice)}`;
  return "";
}

function datedEvent(file: DealFile, key: string, label: string, date: string, detail: string): CalendarEvent | null {
  if (!parseIsoDate(date)) return null;
  const address = file.address.trim();
  const summary = oneLine(`${label} · ${address || "No address yet"}`, 180);
  const description = clip(
    [
      address,
      !address && file.propertyOrSearch.trim() ? `Search: ${file.propertyOrSearch.trim()}` : "",
      [file.side, file.status, file.outcome !== "Open" ? file.outcome : ""].filter(Boolean).join(" · "),
      file.client.trim() ? `Client: ${file.client.trim()}` : "",
      priceLine(file),
      detail.trim(),
      "From Closepath",
    ]
      .filter(Boolean)
      .join("\n"),
    800,
  );
  return {
    key,
    uid: `closepath-${file.id}-${key.replace(/:/g, "-")}@${HOST}`,
    label,
    summary,
    description,
    location: address,
    date,
  };
}

function showingDetail(showing: Showing): string {
  const when = [showing.time.trim(), showing.result].filter(Boolean).join(" · ");
  const feedback = oneLine(showing.feedback, 140);
  return [when, feedback].filter(Boolean).join("\n");
}

function offerDetail(offer: Offer): string {
  return [
    offer.status,
    offer.offerPrice !== null ? `Offer ${formatMoney(offer.offerPrice)}` : "",
    offer.earnestMoney !== null ? `Earnest ${formatMoney(offer.earnestMoney)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Critical dates, the next follow-up, showings, and offer deadlines on one file. */
export function fileCalendarEvents(file: DealFile): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const dated: Array<[string, string, string | null]> = [
    ["contractDate", "Contract date", file.contractDate],
    ...DATE_FIELDS.map((field) => [field.key, field.label, file[field.key]] as [string, string, string | null]),
    ["nextFollowUp", "Next follow-up", file.nextFollowUp],
  ];
  for (const [key, label, date] of dated) {
    if (!date) continue;
    const event = datedEvent(file, key, label, date, "");
    if (event) events.push(event);
  }
  for (const showing of file.showings) {
    if (!showing.date) continue;
    const event = datedEvent(file, `showing:${showing.id}`, "Showing", showing.date, showingDetail(showing));
    if (event) events.push(event);
  }
  for (const offer of file.offers) {
    if (!offer.expires) continue;
    const event = datedEvent(file, `offer:${offer.id}`, "Offer expires", offer.expires, offerDetail(offer));
    if (event) events.push(event);
  }
  events.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label) || a.key.localeCompare(b.key));
  return events;
}

/** Live book only. Sample rows and closed files stay off a subscribed calendar. */
export function feedCalendarEvents(files: DealFile[]): CalendarEvent[] {
  return files
    .filter((file) => file.outcome === "Open" && !file.example)
    .flatMap((file) => fileCalendarEvents(file))
    .sort((a, b) => a.date.localeCompare(b.date) || a.summary.localeCompare(b.summary) || a.uid.localeCompare(b.uid));
}

function icsText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\r\n|\r|\n/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const chunks: string[] = [];
  let current = "";
  let budget = 75;
  for (const char of line) {
    const next = current + char;
    if (encoder.encode(next).length > budget && current) {
      chunks.push(current);
      current = char;
      budget = 74;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks.join("\r\n ");
}

function icsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

export function buildIcs(events: CalendarEvent[], options?: { calendarName?: string; stamp?: Date }): string {
  const stamp = options?.stamp ?? new Date();
  const name = options?.calendarName?.trim() || "Closepath";
  const sequence = String(Math.floor(stamp.getTime() / 1000));
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anzen Digital Media//Closepath//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${icsText(name)}`),
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const event of events) {
    const end = addIsoDays(event.date, 1);
    if (!end) continue;
    lines.push("BEGIN:VEVENT");
    lines.push(fold(`UID:${icsText(event.uid)}`));
    lines.push(`DTSTAMP:${icsUtc(stamp)}`);
    lines.push(`LAST-MODIFIED:${icsUtc(stamp)}`);
    lines.push(`SEQUENCE:${sequence}`);
    lines.push(`DTSTART;VALUE=DATE:${icsDate(event.date)}`);
    lines.push(`DTEND;VALUE=DATE:${icsDate(end)}`);
    lines.push(fold(`SUMMARY:${icsText(event.summary)}`));
    if (event.description) lines.push(fold(`DESCRIPTION:${icsText(event.description)}`));
    if (event.location) lines.push(fold(`LOCATION:${icsText(event.location)}`));
    lines.push("TRANSP:TRANSPARENT");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function googleEventUrl(event: CalendarEvent): string {
  const start = icsDate(event.date);
  const end = icsDate(addIsoDays(event.date, 1) ?? event.date);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${start}/${end}`,
    details: event.description,
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookEventUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    subject: event.summary,
    body: event.description,
    startdt: event.date,
    enddt: event.date,
    allday: "true",
  });
  if (event.location) params.set("location", event.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function appleEventHref(events: CalendarEvent[], calendarName = "Closepath"): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(events, { calendarName }))}`;
}

export function feedPublicUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/closepath/cal/${token}.ics`;
}

function webcal(url: string): string {
  return url.replace(/^https?:\/\//, "webcal://");
}

export function appleSubscribeUrl(feedUrl: string): string {
  return webcal(feedUrl);
}

export function googleSubscribeUrl(feedUrl: string): string {
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal(feedUrl))}`;
}

export function outlookSubscribeUrl(feedUrl: string): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addsubscription",
    url: webcal(feedUrl),
    name: "Closepath",
  });
  return `https://outlook.live.com/owa?${params.toString()}`;
}

/** Unfold a test calendar. Not used by the app. */
export function unfoldIcs(ics: string): string[] {
  const physical = ics.split(/\r\n/);
  const logical: string[] = [];
  for (const line of physical) {
    if (!line) continue;
    if (line.startsWith(" ") && logical.length) logical[logical.length - 1] += line.slice(1);
    else logical.push(line);
  }
  return logical;
}

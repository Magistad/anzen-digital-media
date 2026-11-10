import { formatCalendarDate } from "./closepath-calendar";
import { DATE_FIELDS, type DealFile, type Offer, type Showing, formatMoney } from "./closepath-model";

/** sms: and mailto: links stay short enough for a phone to open them. */
export const SHARE_LINK_MAX = 1500;

function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function shareSubject(file: DealFile): string {
  return file.address.trim() || "Closepath deal";
}

function dated(label: string, iso: string | null): string | null {
  if (!iso) return null;
  const formatted = formatCalendarDate(iso);
  return formatted ? `${label}: ${formatted}` : null;
}

function showingBlock(showing: Showing): string[] {
  const when = [showing.date ? formatCalendarDate(showing.date) : "", showing.time.trim(), showing.result].filter(Boolean).join(" · ");
  const feedback = clip(showing.feedback, 160);
  const next = clip(showing.nextStep, 160);
  return [when, feedback, next ? `Next: ${next}` : ""].filter(Boolean);
}

function offerBlock(offer: Offer): string[] {
  const when = [offer.date ? formatCalendarDate(offer.date) : "", offer.status].filter(Boolean).join(" · ");
  const money = [
    offer.offerPrice !== null ? `Offer ${formatMoney(offer.offerPrice)}` : "",
    offer.earnestMoney !== null ? `Earnest ${formatMoney(offer.earnestMoney)}` : "",
    offer.concessions ? `Concessions ${formatMoney(offer.concessions)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const notes = clip(offer.notes, 160);
  return [when, money, notes].filter(Boolean);
}

function blocks(title: string, rows: string[][]): string[] {
  const kept = rows.filter((row) => row.length);
  if (!kept.length) return [];
  const lines = ["", title];
  kept.forEach((row, index) => {
    if (index) lines.push("");
    lines.push(...row);
  });
  return lines;
}

/** Plain text for a text message, an email, or the phone share sheet. Nothing is sent from the server. */
export function dealSummaryText(file: DealFile): string {
  const lines: string[] = [file.address.trim() || "No address yet"];
  const status = [file.side, file.status, file.outcome !== "Open" ? file.outcome : ""].filter(Boolean).join(" · ");
  if (status) lines.push(status);
  if (file.client.trim()) lines.push(file.client.trim());

  const prices = [
    file.listPrice !== null ? `List price: ${formatMoney(file.listPrice)}` : "",
    file.contractPrice !== null ? `Contract price: ${formatMoney(file.contractPrice)}` : "",
  ].filter(Boolean);
  if (prices.length) lines.push("", ...prices);

  const dates = [
    dated("Contract", file.contractDate),
    ...DATE_FIELDS.map((field) => dated(field.label, file[field.key])),
    dated("Next follow-up", file.nextFollowUp),
  ].filter((line): line is string => Boolean(line));
  if (dates.length) {
    lines.push("", "Critical dates", ...dates);
    const note = clip(file.dateNotes, 240);
    if (note) lines.push(note);
  }

  lines.push(...blocks("Showings", file.showings.map(showingBlock)));
  lines.push(...blocks("Offers", file.offers.map(offerBlock)));
  lines.push("", "From Closepath");
  return lines.join("\n");
}

export function linkBody(text: string): string {
  if (text.length <= SHARE_LINK_MAX) return text;
  return `${text.slice(0, SHARE_LINK_MAX - 1).trimEnd()}…`;
}

export function smsHref(text: string): string {
  return `sms:?&body=${encodeURIComponent(linkBody(text))}`;
}

export function mailtoHref(subject: string, text: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(linkBody(text))}`;
}

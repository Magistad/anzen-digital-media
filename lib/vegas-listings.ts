import { PACIFIC_TIME_ZONE, formatPacificDate, pacificDate, pacificNoon } from "./vegas-dates";

export type Listing = {
  id: string;
  title: string;
  /** Source instant, unchanged. Null when the feed has a date only. */
  start: string | null;
  end: string | null;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  href: string;
  status: string | null;
};

export type ListingFeed = {
  ok: boolean;
  pending: boolean;
  sourceLabel: string;
  sourceUrl: string;
  fetchedAt: string | null;
  note: string;
  items: Listing[];
};

export type WeekWindow = { start: string; end: string };

/** Today through the next 6 days, as Pacific calendar dates. */
export function pacificWeek(now: Date = new Date()): WeekWindow {
  const start = pacificDate(now);
  const end = pacificDate(new Date(pacificNoon(start).getTime() + 6 * 24 * 60 * 60 * 1000));
  return { start, end };
}

export function overlapsWeek(start: string, end: string, week: WeekWindow): boolean {
  return start <= week.end && end >= week.start;
}

export function formatInstantPacific(iso: string, allDay = false): { date: string; time: string } | null {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return null;
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    dateStyle: "medium",
  }).format(instant);
  if (allDay) return { date, time: "All day" };
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    timeStyle: "short",
  }).format(instant);
  return { date, time };
}

export function pacificDayFromInstant(iso: string): string | null {
  const instant = new Date(iso);
  if (Number.isNaN(instant.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/**
 * Events that started before this week keep their published start and end.
 * The label says they are underway through the published end date.
 */
export function listingWhen(
  startIso: string,
  endIso: string | null | undefined,
  week: WeekWindow,
  allDay = false,
): { date: string; time: string } | null {
  const when = formatInstantPacific(startIso, allDay);
  if (!when) return null;
  if (!endIso) return when;
  const startDay = pacificDayFromInstant(startIso);
  const endDay = pacificDayFromInstant(endIso);
  const endWhen = formatInstantPacific(endIso, true);
  if (!startDay || !endDay || !endWhen || startDay === endDay) return when;
  if (startDay < week.start && endDay >= week.start) {
    return { date: `Now through ${endWhen.date}`, time: allDay ? "All day" : when.time };
  }
  return when;
}

export function dateOnlyListing(id: string, title: string, start: string, end: string, venue: string, href: string): Listing {
  const same = start === end;
  return {
    id,
    title,
    start: null,
    end: null,
    dateLabel: same ? formatPacificDate(start, "medium") : `${formatPacificDate(start, "medium")} to ${formatPacificDate(end, "medium")}`,
    timeLabel: "Time not listed",
    venue: venue || "Venue not listed",
    href,
    status: null,
  };
}

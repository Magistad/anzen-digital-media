import { cached } from "./vegas-cache";
import { listingWhen, pacificDayFromInstant, type Listing, type ListingFeed, type WeekWindow, pacificWeek } from "./vegas-listings";

export const VEGAS_CALENDAR_URL = "https://www.vegascalendar.org/wp-json/vegascal/v1/events";
export const VEGAS_CALENDAR_CREDIT = "Events from Vegas Calendar";
export const VEGAS_CALENDAR_CREDIT_URL = "https://www.vegascalendar.org/events/";
export const VEGAS_CALENDAR_TTL_MS = 10 * 60 * 1000;

type CalendarEvent = {
  id?: number;
  title?: string;
  url?: string;
  start?: string;
  end?: string;
  all_day?: boolean;
  status?: string;
  tickets_url?: string;
  venue?: { name?: string };
};

export function parseVegasCalendar(body: unknown, week: WeekWindow): Listing[] {
  if (!body || typeof body !== "object") return [];
  const data = (body as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  const items: Listing[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const event = raw as CalendarEvent;
    if (!event.title || !event.start) continue;
    const when = listingWhen(event.start, event.end, week, Boolean(event.all_day));
    if (!when) continue;
    const startDay = pacificDayFromInstant(event.start);
    const endDay = event.end ? pacificDayFromInstant(event.end) : startDay;
    if (!startDay || !endDay) continue;
    if (startDay > week.end || endDay < week.start) continue;
    const venueName = event.venue?.name?.trim() || "Venue not listed";
    items.push({
      id: String(event.id ?? event.url ?? event.title),
      title: event.title,
      start: event.start,
      end: event.end ?? null,
      dateLabel: when.date,
      timeLabel: when.time,
      venue: venueName,
      href: event.tickets_url || event.url || VEGAS_CALENDAR_CREDIT_URL,
      status: event.status && event.status !== "scheduled" ? event.status : null,
    });
  }
  return items;
}

export async function loadVegasCalendar(fetchImpl: typeof fetch = fetch, now = new Date()): Promise<ListingFeed> {
  const week = pacificWeek(now);
  const url = new URL(VEGAS_CALENDAR_URL);
  url.searchParams.set("start", week.start);
  url.searchParams.set("end", week.end);
  url.searchParams.set("per_page", "100");
  try {
    const body = await cached(`vegas-calendar:${week.start}`, VEGAS_CALENDAR_TTL_MS, async () => {
      const response = await fetchImpl(url, {
        cache: "no-store",
        headers: { Accept: "application/json", "User-Agent": "Anzen Digital Media (https://anzendigitalmedia.com)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      return response.json() as Promise<unknown>;
    });
    return {
      ok: true,
      pending: false,
      sourceLabel: VEGAS_CALENDAR_CREDIT,
      sourceUrl: VEGAS_CALENDAR_CREDIT_URL,
      fetchedAt: now.toISOString(),
      note: "Dates and venues are shown as published. They can change.",
      items: parseVegasCalendar(body, week),
    };
  } catch {
    return {
      ok: false,
      pending: false,
      sourceLabel: VEGAS_CALENDAR_CREDIT,
      sourceUrl: VEGAS_CALENDAR_CREDIT_URL,
      fetchedAt: null,
      note: "Event listings are unavailable right now.",
      items: [],
    };
  }
}

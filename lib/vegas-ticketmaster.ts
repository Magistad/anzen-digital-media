import { readEnv } from "./env";
import { cached } from "./vegas-cache";
import { formatInstantPacific, type Listing, type ListingFeed, type WeekWindow, pacificWeek } from "./vegas-listings";

export const TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
export const TICKETMASTER_TTL_MS = 2 * 60 * 60 * 1000;

export type TicketBucket = "sports" | "shows" | "nightlife";

const COMING_SOON =
  "Listings coming soon. The Ticketmaster feed is not connected yet.";

export function ticketmasterKey(env: Record<string, string | undefined> = process.env): string | undefined {
  return readEnvFrom(env, "TICKETMASTER_API_KEY");
}

function readEnvFrom(env: Record<string, string | undefined>, name: string): string | undefined {
  if (env === process.env) return readEnv(name);
  const value = env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function segmentName(event: Record<string, unknown>): string {
  const classes = event.classifications;
  if (!Array.isArray(classes) || !classes[0] || typeof classes[0] !== "object") return "";
  const segment = (classes[0] as { segment?: { name?: string } }).segment;
  return segment?.name ?? "";
}

function genreName(event: Record<string, unknown>): string {
  const classes = event.classifications;
  if (!Array.isArray(classes) || !classes[0] || typeof classes[0] !== "object") return "";
  const genre = (classes[0] as { genre?: { name?: string } }).genre;
  return genre?.name ?? "";
}

export function ticketBucket(event: Record<string, unknown>): TicketBucket {
  const genre = genreName(event).toLowerCase();
  if (/night|dance|club|electronic/.test(genre)) return "nightlife";
  if (segmentName(event).toLowerCase() === "sports") return "sports";
  return "shows";
}

export function parseTicketmaster(body: unknown, week: WeekWindow, bucket: TicketBucket): Listing[] {
  if (!body || typeof body !== "object") return [];
  const embedded = (body as { _embedded?: { events?: unknown } })._embedded;
  const events = embedded?.events;
  if (!Array.isArray(events)) return [];
  const items: Listing[] = [];
  for (const raw of events) {
    if (!raw || typeof raw !== "object") continue;
    const event = raw as Record<string, unknown>;
    if (ticketBucket(event) !== bucket) continue;
    const name = typeof event.name === "string" ? event.name.trim() : "";
    const href = typeof event.url === "string" ? event.url : "";
    if (!name || !href) continue;
    const dates = event.dates as { start?: { dateTime?: string; localDate?: string }; status?: { code?: string } } | undefined;
    const dateTime = dates?.start?.dateTime;
    const localDate = dates?.start?.localDate;
    const when = dateTime ? formatInstantPacific(dateTime) : null;
    const day = when?.date
      ? pacificDay(dateTime as string)
      : typeof localDate === "string"
        ? localDate
        : null;
    if (!day || day < week.start || day > week.end) continue;
    const venues = (event._embedded as { venues?: { name?: string; city?: { name?: string } }[] } | undefined)?.venues;
    const venue = venues?.[0];
    const state = (venue as { state?: { stateCode?: string } } | undefined)?.state?.stateCode;
    if (state && state !== "NV") continue;
    items.push({
      id: typeof event.id === "string" ? event.id : href,
      title: name,
      start: dateTime ?? null,
      end: null,
      dateLabel: when?.date ?? localDate ?? "Date not listed",
      timeLabel: when?.time ?? "Time not listed",
      venue: venue?.name?.trim() || "Venue not listed",
      href,
      status: dates?.status?.code && dates.status.code !== "onsale" ? dates.status.code : null,
    });
  }
  return items;
}

function pacificDay(iso: string): string | null {
  const when = formatInstantPacific(iso);
  if (!when) return null;
  const instant = new Date(iso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export async function loadTicketmaster(
  bucket: TicketBucket,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
  now = new Date(),
): Promise<ListingFeed> {
  const base = {
    sourceLabel: "Ticketmaster",
    sourceUrl: "https://www.ticketmaster.com/",
    pending: false,
  };
  const key = ticketmasterKey(env);
  if (!key) {
    return { ...base, ok: true, pending: true, fetchedAt: null, note: COMING_SOON, items: [] };
  }
  const week = pacificWeek(now);
  try {
    const payload = await cached(`ticketmaster:${week.start}`, TICKETMASTER_TTL_MS, async () => {
      const url = new URL(TICKETMASTER_URL);
      url.searchParams.set("apikey", key);
      url.searchParams.set("city", "Las Vegas");
      url.searchParams.set("stateCode", "NV");
      url.searchParams.set("countryCode", "US");
      url.searchParams.set("size", "100");
      url.searchParams.set("sort", "date,asc");
      url.searchParams.set("startDateTime", `${week.start}T00:00:00Z`);
      url.searchParams.set("endDateTime", `${week.end}T23:59:59Z`);
      const response = await fetchImpl(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`status ${response.status}`);
      return response.json() as Promise<unknown>;
    });
    return {
      ...base,
      ok: true,
      fetchedAt: now.toISOString(),
      note: "Listings from Ticketmaster. Times are Pacific.",
      items: parseTicketmaster(payload, week, bucket),
    };
  } catch {
    return {
      ...base,
      ok: false,
      fetchedAt: null,
      note: "Ticketmaster listings are unavailable right now.",
      items: [],
    };
  }
}

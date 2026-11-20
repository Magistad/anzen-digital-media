import { cached } from "./vegas-cache";
import { dateOnlyListing, overlapsWeek, type Listing, type ListingFeed, type WeekWindow, pacificWeek } from "./vegas-listings";

export const CONVENTION_FEED_URL = "https://lasvegasconventionguide.com/shows.json";
export const CONVENTION_FEED_TTL_MS = 24 * 60 * 60 * 1000;

type Show = {
  slug?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  venues?: { name?: string }[];
  official?: string;
  guide?: string;
};

export function parseConventionGuide(body: unknown, week: WeekWindow): { note: string; updated: string | null; items: Listing[] } {
  if (!body || typeof body !== "object") return { note: "", updated: null, items: [] };
  const record = body as { note?: unknown; updated?: unknown; shows?: unknown };
  const note = typeof record.note === "string" ? record.note : "Confirm dates with each show.";
  const updated = typeof record.updated === "string" ? record.updated : null;
  const shows = Array.isArray(record.shows) ? record.shows : [];
  const rows: Show[] = [];
  for (const raw of shows) {
    if (!raw || typeof raw !== "object") continue;
    const show = raw as Show;
    if (!show.name || !show.startDate || !show.endDate) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(show.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(show.endDate)) continue;
    if (!overlapsWeek(show.startDate, show.endDate, week)) continue;
    rows.push(show);
  }
  rows.sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));
  const items = rows.map((show) => {
    const venue = (show.venues ?? []).map((item) => item.name).filter(Boolean).join(", ");
    return dateOnlyListing(
      show.slug || show.name || "show",
      show.name || "Show",
      show.startDate || "",
      show.endDate || "",
      venue,
      show.official || show.guide || "https://lasvegasconventionguide.com/shows",
    );
  });
  return { note, updated, items };
}

export async function loadConventions(fetchImpl: typeof fetch = fetch, now = new Date()): Promise<ListingFeed> {
  const week = pacificWeek(now);
  try {
    const body = await cached(`conventions:${week.start}`, CONVENTION_FEED_TTL_MS, async () => {
      const response = await fetchImpl(CONVENTION_FEED_URL, {
        cache: "no-store",
        headers: { Accept: "application/json", "User-Agent": "Anzen Digital Media (https://anzendigitalmedia.com)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      return response.json() as Promise<unknown>;
    });
    const parsed = parseConventionGuide(body, week);
    return {
      ok: true,
      pending: false,
      sourceLabel: "Las Vegas Convention Guide",
      sourceUrl: "https://lasvegasconventionguide.com/shows",
      fetchedAt: now.toISOString(),
      note: parsed.note || "Confirm dates with each show.",
      items: parsed.items,
    };
  } catch {
    return {
      ok: false,
      pending: false,
      sourceLabel: "Las Vegas Convention Guide",
      sourceUrl: "https://lasvegasconventionguide.com/shows",
      fetchedAt: null,
      note: "Convention listings are unavailable right now. Confirm dates with each show.",
      items: [],
    };
  }
}

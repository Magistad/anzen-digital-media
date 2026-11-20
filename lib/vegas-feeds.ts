import { loadVegasCalendar } from "./vegas-calendar-feed";
import { loadConventions } from "./vegas-convention-feed";
import type { ListingFeed } from "./vegas-listings";
import type { VegasSectionSlug } from "./vegas-sections";
import { loadTicketmaster } from "./vegas-ticketmaster";

export type VegasFeeds = Record<VegasSectionSlug, ListingFeed>;

export async function loadVegasFeeds(fetchImpl: typeof fetch = fetch, now = new Date()): Promise<VegasFeeds> {
  const [sports, shows, nightlife, conventions, events] = await Promise.all([
    loadTicketmaster("sports", fetchImpl, process.env, now),
    loadTicketmaster("shows", fetchImpl, process.env, now),
    loadTicketmaster("nightlife", fetchImpl, process.env, now),
    loadConventions(fetchImpl, now),
    loadVegasCalendar(fetchImpl, now),
  ]);
  return {
    sports,
    shows,
    nightlife: nightlife.pending
      ? { ...nightlife, note: "Club calendars are linked on this page. Ticketmaster nightlife listings are not connected yet." }
      : nightlife,
    conventions,
    events,
  };
}

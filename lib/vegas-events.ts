/**
 * First-party counts for the Vegas Right Now demand test.
 * No cookies, no third-party script, no message body, no email.
 * Netlify Blobs store "vegas-events" holds the totals when the site is on
 * Netlify. Elsewhere the counter accepts the event and does not persist it.
 * Waitlist, question, and tip emails stay in Netlify Forms, not in this counter.
 */

export const VEGAS_EVENT_TYPES = ["view", "outbound", "waitlist", "ask", "tip"] as const;

export type VegasEventType = (typeof VEGAS_EVENT_TYPES)[number];

export type VegasEvent = {
  type: VegasEventType;
  target: string;
};

export type EventCounts = {
  views: number;
  waitlist: number;
  ask: number;
  tip: number;
  outboundTotal: number;
  outbound: Record<string, number>;
};

const OUTBOUND_KEY_LIMIT = 40;

export function emptyEventCounts(): EventCounts {
  return { views: 0, waitlist: 0, ask: 0, tip: 0, outboundTotal: 0, outbound: {} };
}

export function parseVegasEvent(input: unknown): VegasEvent | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as { type?: unknown; target?: unknown };
  if (typeof candidate.type !== "string" || !VEGAS_EVENT_TYPES.includes(candidate.type as VegasEventType)) {
    return null;
  }
  const type = candidate.type as VegasEventType;
  const target = typeof candidate.target === "string" ? candidate.target.trim().slice(0, 300) : "";
  if (type === "outbound") {
    try {
      const url = new URL(target);
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    } catch {
      return null;
    }
  }
  return { type, target };
}

export function applyVegasEvent(counts: EventCounts, event: VegasEvent): EventCounts {
  const next: EventCounts = { ...counts, outbound: { ...counts.outbound } };
  if (event.type === "view") next.views += 1;
  if (event.type === "waitlist") next.waitlist += 1;
  if (event.type === "ask") next.ask += 1;
  if (event.type === "tip") next.tip += 1;
  if (event.type === "outbound") {
    next.outboundTotal += 1;
    const known = Object.prototype.hasOwnProperty.call(next.outbound, event.target);
    if (known || Object.keys(next.outbound).length < OUTBOUND_KEY_LIMIT) {
      next.outbound[event.target] = (next.outbound[event.target] ?? 0) + 1;
    }
  }
  return next;
}

export function coerceEventCounts(value: unknown): EventCounts {
  const empty = emptyEventCounts();
  if (!value || typeof value !== "object") return empty;
  const record = value as Partial<EventCounts>;
  const outbound: Record<string, number> = {};
  if (record.outbound && typeof record.outbound === "object") {
    for (const [key, count] of Object.entries(record.outbound)) {
      if (typeof count === "number" && Number.isFinite(count)) outbound[key] = count;
    }
  }
  const numberOr = (item: unknown, fallback: number) =>
    typeof item === "number" && Number.isFinite(item) ? item : fallback;
  return {
    views: numberOr(record.views, 0),
    waitlist: numberOr(record.waitlist, 0),
    ask: numberOr(record.ask, 0),
    tip: numberOr(record.tip, 0),
    outboundTotal: numberOr(record.outboundTotal, 0),
    outbound,
  };
}

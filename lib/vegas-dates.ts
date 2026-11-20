/** Calendar dates for Vegas Right Now are America/Los_Angeles civil dates. */

export const PACIFIC_TIME_ZONE = "America/Los_Angeles";

/** YYYY-MM-DD for an instant, in Pacific time. */
export function pacificDate(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Noon on that Pacific calendar date, so formatting cannot slip to the day before. */
export function pacificNoon(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Expected a Pacific date, got ${iso}`);
  for (const offset of ["-08:00", "-07:00"]) {
    const instant = new Date(`${iso}T12:00:00${offset}`);
    if (!Number.isNaN(instant.getTime()) && pacificDate(instant) === iso) return instant;
  }
  throw new Error(`Could not place ${iso} in ${PACIFIC_TIME_ZONE}`);
}

export function formatPacificDate(iso: string, style: "long" | "medium" = "long"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PACIFIC_TIME_ZONE,
    dateStyle: style,
  }).format(pacificNoon(iso));
}

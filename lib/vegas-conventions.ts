/**
 * This week and the following weeks only. Crowd words are copied from
 * Vegas Convention Calendar, which publishes its own method and date.
 * Show rows are limited to organizer pages opened for this check.
 * Attendance figures are not copied.
 */

import { formatPacificDate } from "./vegas-dates";

export const CONVENTION_MODULE_CHECKED = "2026-11-19";

export const CONVENTION_CALENDAR = {
  label: "Vegas Convention Calendar",
  url: "https://vegasconventioncalendar.com/",
  checked: "2026-11-19",
} as const;

export type CrowdNote = {
  label: string;
  sourceLabel: string;
  sourceUrl: string;
  checked: string;
};

export type SourcedShow = {
  name: string;
  when: string;
  where: string;
  sourceUrl: string;
};

export type ConventionWeek = {
  id: string;
  weekOf: string;
  crowd: CrowdNote | null;
  shows: readonly SourcedShow[];
  note: string;
};

function crowd(label: string): CrowdNote {
  return {
    label,
    sourceLabel: CONVENTION_CALENDAR.label,
    sourceUrl: CONVENTION_CALENDAR.url,
    checked: CONVENTION_CALENDAR.checked,
  };
}

const reinvent: SourcedShow = {
  name: "AWS re:Invent",
  when: "November 30 to December 4, 2026",
  where: "Las Vegas",
  sourceUrl: "https://aws.amazon.com/events/reinvent/",
};

const mjbiz: SourcedShow = {
  name: "MJBizCon",
  when: "December 1 to December 4, 2026",
  where: "Las Vegas Convention Center",
  sourceUrl: "https://mjbizconference.com/",
};

const ldi: SourcedShow = {
  name: "LDI",
  when: "December 2 to December 8, 2026. Expo hall December 6 to 8.",
  where: "Las Vegas Convention Center West Hall",
  sourceUrl: "https://www.ldishow.com/",
};

const nfr: SourcedShow = {
  name: "Wrangler National Finals Rodeo",
  when: "December 3 to December 12, 2026",
  where: "Thomas and Mack Center",
  sourceUrl:
    "https://www.nfrexperience.com/news/opening-performances-announced-for-the-2026-national-finals-rodeo-in-las-vegas",
};

const ces: SourcedShow = {
  name: "CES",
  when: "Media days January 4 and 5, 2027. Show floor January 6 to 9, 2027.",
  where: "Las Vegas",
  sourceUrl: "https://www.ces.tech/plan-your-visit/dates-and-hours/",
};

export const CONVENTION_WEEKS: readonly ConventionWeek[] = [
  {
    id: "2026-11-16",
    weekOf: "2026-11-16",
    crowd: crowd("Packed"),
    shows: [],
    note: "Show names for this week are on the full calendar. This page does not repeat attendance figures.",
  },
  {
    id: "2026-11-23",
    weekOf: "2026-11-23",
    crowd: crowd("Quiet"),
    shows: [],
    note: "No show in the next few weeks was confirmed on an organizer site for this week.",
  },
  {
    id: "2026-11-30",
    weekOf: "2026-11-30",
    crowd: crowd("Packed"),
    shows: [reinvent, mjbiz, ldi, nfr],
    note: "re:Invent, MJBizCon, the start of LDI, and the start of the National Finals Rodeo overlap.",
  },
  {
    id: "2026-12-07",
    weekOf: "2026-12-07",
    crowd: crowd("Busy (leisure)"),
    shows: [ldi, nfr],
    note: "LDI’s expo hall runs through December 8. The rodeo runs through December 12.",
  },
  {
    id: "2026-12-14",
    weekOf: "2026-12-14",
    crowd: crowd("Quiet"),
    shows: [],
    note: "No show in this short list falls in this week.",
  },
  {
    id: "2026-12-21",
    weekOf: "2026-12-21",
    crowd: crowd("Quiet"),
    shows: [],
    note: "No show in this short list falls in this week.",
  },
  {
    id: "2026-12-28",
    weekOf: "2026-12-28",
    crowd: crowd("Peak (leisure)"),
    shows: [],
    note: "The calendar marks a leisure peak. This page does not add a separate event.",
  },
  {
    id: "2027-01-04",
    weekOf: "2027-01-04",
    crowd: crowd("Sold-out"),
    shows: [ces],
    note: "CES is the show confirmed on the organizer site for this week.",
  },
];

export function formatWeekOf(iso: string): string {
  return `Week of ${formatPacificDate(iso)}`;
}

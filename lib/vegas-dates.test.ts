import assert from "node:assert/strict";
import test from "node:test";
import { ATTRACTIONS_CHECKED } from "./vegas-attractions";
import { CONVENTION_CALENDAR, CONVENTION_MODULE_CHECKED, CONVENTION_WEEKS, formatWeekOf } from "./vegas-conventions";
import { formatPacificDate, pacificDate } from "./vegas-dates";
import { FEE_MODULE_CHECKED, RESORT_FEES, TAX_RATE_SOURCE, ZERO_RESORT_FEES } from "./vegas-fees";
import { QUESTIONS_CHECKED } from "./vegas-questions";

const CHECKED = [
  ["fee module", FEE_MODULE_CHECKED],
  ["tax rate", TAX_RATE_SOURCE.checked],
  ["conventions", CONVENTION_MODULE_CHECKED],
  ["convention calendar", CONVENTION_CALENDAR.checked],
  ["questions", QUESTIONS_CHECKED],
  ["attractions", ATTRACTIONS_CHECKED],
  ...RESORT_FEES.map((fee) => [`fee ${fee.id}`, fee.checked] as const),
  ...ZERO_RESORT_FEES.map((fee) => [`zero fee ${fee.id}`, fee.checked] as const),
  ...CONVENTION_WEEKS.flatMap((week) => (week.crowd ? [[`crowd ${week.id}`, week.crowd.checked] as const] : [])),
];

test("checked dates are Pacific calendar dates and not after today in Los Angeles", () => {
  const today = pacificDate();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  for (const [label, iso] of CHECKED) {
    assert.match(iso, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(iso <= today, `${label} ${iso} is after the Pacific date ${today}`);
  }
});

test("a UTC calendar date after midnight is still the previous Pacific date", () => {
  assert.equal(pacificDate(new Date("2026-11-20T00:30:00Z")), "2026-11-19");
  assert.equal(formatPacificDate("2026-11-19"), "November 19, 2026");
  assert.equal(formatPacificDate("2026-11-19", "medium"), "Nov 19, 2026");
  assert.equal(formatWeekOf("2026-11-16"), "Week of November 16, 2026");
});

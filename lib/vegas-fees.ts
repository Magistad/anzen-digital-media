/**
 * Short resort-fee module. Amounts are included only when a page opened for
 * this check stated them. Tax-included totals use the Clark County primary
 * gaming corridor rate and are labeled as such. They are not hotel quotes.
 */

export const FEE_MODULE_CHECKED = "2026-11-20";

/** Clark County Code 4.08.010, resort hotel in the primary gaming corridor, effective March 1, 2017. */
export const PRIMARY_GAMING_CORRIDOR_RATE = 0.1338;

export const TAX_RATE_SOURCE = {
  label: "Clark County Code 4.08.010",
  url: "https://library.municode.com/nv/clark_county/codes/code_of_ordinances?nodeId=TIT4RETA_CH4.08COTRLOTA",
  checked: FEE_MODULE_CHECKED,
} as const;

export const FEE_TRACKERS = [
  {
    label: "TheResortFee",
    url: "https://theresortfee.com/resort-fee",
  },
  {
    label: "Resort Fee Checker",
    url: "https://www.resortfeechecker.com/hotel_resort_fees_las_vegas_nv.html",
  },
] as const;

export type ResortFee = {
  id: string;
  hotel: string;
  area: "Strip";
  preTaxCents: number;
  /** Null when a with-tax total was not verified. */
  taxIncludedCents: number | null;
  included: string;
  sourceLabel: string;
  sourceUrl: string;
  checked: string;
};

export type ZeroResortFee = {
  id: string;
  hotel: string;
  sourceLabel: string;
  sourceUrl: string;
  checked: string;
};

const NINA = "https://ninalovesvegas.com/blog/las-vegas-resort-fees-2026";

const EXCALIBUR_BUNDLE =
  "Wi-Fi, local and domestic long-distance and toll-free calls, boarding-pass printing, digital newspapers, and fitness center access for guests 18 and older. The source describes this bundle from the hotel terms.";

export function taxIncludedCents(preTaxCents: number, rate = PRIMARY_GAMING_CORRIDOR_RATE): number {
  return Math.round(preTaxCents * (1 + rate));
}

function stripFee(row: Omit<ResortFee, "area" | "taxIncludedCents">): ResortFee {
  return {
    ...row,
    area: "Strip",
    taxIncludedCents: taxIncludedCents(row.preTaxCents),
  };
}

export const RESORT_FEES: readonly ResortFee[] = [
  stripFee({
    id: "venetian",
    hotel: "The Venetian Resort",
    preTaxCents: 5500,
    included:
      "Fitness access for 2 at Canyon Ranch, in-suite internet, boarding-pass printing, unlimited local and toll-free calls, and PressReader while on Venetian or Palazzo Wi-Fi. The same page mentions Palazzo. A separate Palazzo amount was not stated.",
    sourceLabel: "The Venetian Resort fee page",
    sourceUrl: "https://www.venetianlasvegas.com/resort/resort-fee.html",
    checked: "2026-11-20",
  }),
  stripFee({
    id: "wynn-encore",
    hotel: "Wynn Las Vegas and Encore",
    preTaxCents: 5500,
    included:
      "Self-parking for up to 2\u00a0vehicles, in-room Wi-Fi, bottled water refreshed daily, unlimited local and domestic long-distance and toll-free calls, fitness access for up to 2\u00a0people, and a digital newsstand. Tower Suites use the same daily amount on this page, with valet or self-parking.",
    sourceLabel: "Wynn and Encore resort information",
    sourceUrl: "https://www.wynnlasvegas.com/about-us/resort-information",
    checked: "2026-11-20",
  }),
  stripFee({
    id: "vdara",
    hotel: "Vdara",
    preTaxCents: 5500,
    included: "Wi-Fi, calls, Paramount+ with SHOWTIME, boarding passes, and digital newspapers, as described from the hotel terms.",
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "mgm-grand",
    hotel: "MGM Grand",
    preTaxCents: 5000,
    included: `${EXCALIBUR_BUNDLE} The source adds Paramount+ with SHOWTIME in the room for MGM Grand.`,
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "mandalay-bay",
    hotel: "Mandalay Bay",
    preTaxCents: 5000,
    included: `${EXCALIBUR_BUNDLE} The source describes Mandalay Bay as the same bundle as MGM Grand, including Paramount+ with SHOWTIME in the room.`,
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "park-mgm",
    hotel: "Park MGM",
    preTaxCents: 5000,
    included: `${EXCALIBUR_BUNDLE} The source describes Park MGM as the same bundle as MGM Grand, including Paramount+ with SHOWTIME in the room.`,
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "excalibur",
    hotel: "Excalibur",
    preTaxCents: 4500,
    included: EXCALIBUR_BUNDLE,
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "luxor",
    hotel: "Luxor",
    preTaxCents: 4500,
    included: `${EXCALIBUR_BUNDLE} The source describes Luxor as the same bundle as Excalibur.`,
    sourceLabel: "Nina Loves Vegas, from hotel terms",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "strat",
    hotel: "The STRAT",
    preTaxCents: 4995,
    included:
      "Discounted Tower entry, 20% off SkyJump, seasonal Swim and Social, 24-hour fitness, and calls, as described from the hotel FAQ.",
    sourceLabel: "Nina Loves Vegas, from the hotel FAQ",
    sourceUrl: NINA,
    checked: "2026-11-14",
  }),
  stripFee({
    id: "caesars-palace",
    hotel: "Caesars Palace",
    preTaxCents: 5495,
    included: "Not stated on the source page. The amount is from a checkout quote, not a fee explainer.",
    sourceLabel: "Nina Loves Vegas, official-site quote",
    sourceUrl: NINA,
    checked: "2026-11-10",
  }),
];

/** Kept empty until a hotel page that states $0 is opened. Do not fill this with secondhand names. */
export const ZERO_RESORT_FEES: readonly ZeroResortFee[] = [];

export function formatUsd(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatCheckedDate(iso: string, style: "long" | "medium" = "long"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    dateStyle: style,
  }).format(new Date(`${iso}T00:00:00Z`));
}

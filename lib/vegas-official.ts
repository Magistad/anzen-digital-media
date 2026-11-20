export type OfficialLink = { label: string; href: string; note?: string };

export const SPORTS_LINKS: readonly OfficialLink[] = [
  { label: "Raiders schedule", href: "https://www.raiders.com/schedule" },
  { label: "Golden Knights schedule", href: "https://www.nhl.com/goldenknights/schedule" },
  {
    label: "Aces site",
    href: "https://aces.wnba.com/",
    note: "The Aces are in the off-season here until a dated game is on the Ticketmaster feed.",
  },
  { label: "UFC events", href: "https://www.ufc.com/events" },
  { label: "Formula 1 Las Vegas", href: "https://www.f1lasvegasgp.com/" },
  { label: "Las Vegas Motor Speedway", href: "https://www.lvms.com/" },
  { label: "Allegiant Stadium calendar", href: "https://www.allegiantstadium.com/events" },
];

export const SHOW_LINKS: readonly OfficialLink[] = [
  { label: "Sphere", href: "https://www.thesphere.com/" },
  { label: "T-Mobile Arena calendar", href: "https://www.t-mobilearena.com/events" },
];

export const NIGHTLIFE_LINKS: readonly OfficialLink[] = [
  { label: "Hakkasan", href: "https://hakkasannightclub.com/" },
  { label: "Omnia", href: "https://omniaclubs.com/las-vegas/" },
  { label: "Zouk", href: "https://zoukgrouplv.com/" },
  { label: "XS", href: "https://xslasvegas.com/" },
  { label: "LIV", href: "https://www.livnightclub.com/las-vegas/" },
  { label: "Marquee", href: "https://marqueelasvegas.com/" },
  { label: "Tao", href: "https://taogroup.com/venues/tao-las-vegas" },
];

export const CONVENTION_LINKS: readonly OfficialLink[] = [
  { label: "Vegas Convention Calendar, this week", href: "https://vegasconventioncalendar.com/this-week/" },
  { label: "LVCVA destination calendar", href: "https://www.vegasmeansbusiness.com/destination-calendar/" },
  { label: "Las Vegas Convention Guide", href: "https://lasvegasconventionguide.com/shows" },
];

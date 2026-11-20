export const QUESTIONS_CHECKED = "2026-11-20";

export type CitedSource = {
  label: string;
  href: string;
};

export type VisitorQuestion = {
  id: string;
  question: string;
  answer: string;
  sources: readonly CitedSource[];
};

const ncei: CitedSource = {
  label: "NOAA 1991 to 2020 monthly normals, station USW00023169",
  href: "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00023169",
};

const nwsClimate: CitedSource = {
  label: "National Weather Service Las Vegas, 1991 to 2020 normals",
  href: "https://www.weather.gov/vef/1991-2020Normals",
};

const airportWaits: CitedSource = {
  label: "Harry Reid International Airport checkpoint waits",
  href: "https://www.harryreidairport.com/security-wait-times",
};

const airportHome: CitedSource = {
  label: "Harry Reid International Airport",
  href: "https://www.harryreidairport.com/",
};

const tsa: CitedSource = {
  label: "TSA",
  href: "https://www.tsa.gov/",
};

export const VISITOR_QUESTIONS: readonly VisitorQuestion[] = [
  {
    id: "stay",
    question: "Where should you stay?",
    answer:
      "The Strip puts many casinos, shows, and restaurants on one boulevard, and most of those resorts add a nightly resort fee. Downtown and Fremont pack hotels closer together, with a different pace. Some Downtown properties are adults only, so read the age rule before you book with children. Off-Strip rooms can cost less and still charge a fee, and you will want a ride back to the Strip. Compare the room, the fee, and the tax, not the nightly rate alone.",
    sources: [],
  },
  {
    id: "getting-around",
    question: "How do you get around?",
    answer:
      "Walking the Strip takes longer than the map suggests, because resort fronts and casino floors add distance. The Las Vegas Monorail publishes its own stations and fare. Do not assume it reaches the airport or Downtown. Check the map. RTC runs the Deuce bus on the Strip, and the fare is on the RTC site. Rideshare and taxis use signed pickups at the airport and at resorts. A rental car helps for Red Rock, Valley of Fire, and Hoover Dam. Parking is a separate question from the room rate. Wynn and Encore include self-parking for up to 2 vehicles in the resort fee on their resort page. Other hotels do not all do that.",
    sources: [
      { label: "Las Vegas Monorail", href: "https://www.lvmonorail.com/" },
      { label: "RTC of Southern Nevada", href: "https://www.rtcsnv.com/" },
      airportHome,
      {
        label: "Wynn and Encore resort information",
        href: "https://www.wynnlasvegas.com/about-us/resort-information",
      },
    ],
  },
  {
    id: "airport",
    question: "What should you know about the airport and TSA?",
    answer:
      "You fly into Harry Reid International Airport, LAS. Checkpoint waits are on the airport’s own site. This page does not estimate them. The airport says those waits move by the minute, and that you should arrive 2\u00a0hours before a domestic flight and 3\u00a0hours before an international flight. Do not use a short wait to leave the hotel late. FAA delay programs are in the conditions strip above. Packing questions belong to TSA.",
    sources: [airportWaits, airportHome, tsa],
  },
  {
    id: "resort-fees",
    question: "What is a resort fee?",
    answer:
      "It is a mandatory nightly charge on top of the room rate. Tax is usually added to the fee as well. What it buys differs by hotel, and a sale can waive it, so the table below is a short checked list, not a promise. Verify the line at booking. Fees change.",
    sources: [],
  },
  {
    id: "plan",
    question: "What does a 2 to 3 day plan look like?",
    answer:
      "Give one day to a single stretch of the Strip on foot, instead of trying to walk the whole boulevard. Give another day to Downtown, or to a single day trip, not both. On the day you fly out, open the airport’s checkpoint page and leave the long buffer the airport asks for. Add a show only if the tickets are already in hand.",
    sources: [airportWaits],
  },
  {
    id: "shows",
    question: "How do you pick a show?",
    answer:
      "Residencies and limited runs change. Use the venue’s calendar, including Sphere’s own site, rather than a list of shows printed on a guide. If a convention week is marked Sold-out or Packed above, book the show before you arrive. This page does not rank shows.",
    sources: [{ label: "Sphere", href: "https://www.thesphere.com/" }],
  },
  {
    id: "heat",
    question: "How hot is it, and which months are milder?",
    answer:
      "NOAA’s 1991 to 2020 monthly normals for the Harry Reid airport station put the average daily high at 104.5°F in July and 58.5°F in January. June, July, and August average about 99.4°F to 104.5°F. November through April are the months in that dataset with an average daily high under 80°F. Use the forecast at the top of this page for the week you travel. Normals are not a forecast.",
    sources: [ncei, nwsClimate],
  },
  {
    id: "conventions",
    question: "Why do convention weeks change hotel rates?",
    answer:
      "A large show fills rooms. Published rates usually rise when fewer rooms are left. This page does not estimate the increase. Use the week list above, then the full calendar, and check your dates before you book.",
    sources: [{ label: "Vegas Convention Calendar", href: "https://vegasconventioncalendar.com/" }],
  },
  {
    id: "safety",
    question: "What should you know about safety, including Fremont and late night?",
    answer:
      "Fremont Street is a busy pedestrian mall. Crowded tourist blocks are where petty theft and aggressive solicitation show up. Late at night, stay on lit, busy streets and use the resort’s rideshare pickup instead of a dark side street. This page does not score a block as safe. For an emergency, call 911. Non-emergency contacts are on the Las Vegas Metropolitan Police Department site.",
    sources: [{ label: "Las Vegas Metropolitan Police Department", href: "https://www.lvmpd.com/" }],
  },
  {
    id: "food",
    question: "How do food and tipping work?",
    answer:
      "Popular restaurants book up, so reserve before you count on a table. Tipping is customary for table service, bartenders, valet, and housekeeping. A large party often has an automatic gratuity already on the bill. Read the check before you add more. This page does not set a percentage.",
    sources: [],
  },
  {
    id: "day-trips",
    question: "Which day trips are the usual ones?",
    answer:
      "Hoover Dam, Red Rock Canyon, Valley of Fire, and Grand Canyon West are 4 different trips. Grand Canyon West is the Hualapai West Rim, not the National Park’s South Rim. Hours, entry fees, and whether you need a car are on each official site. Do not plan 2 of them on the same day.",
    sources: [
      { label: "Hoover Dam, Bureau of Reclamation", href: "https://www.usbr.gov/lc/hooverdam/" },
      { label: "Red Rock Canyon", href: "https://www.redrockcanyonlv.org/" },
      { label: "Valley of Fire, Nevada State Parks", href: "https://parks.nv.gov/parks/valley-of-fire" },
      { label: "Grand Canyon West", href: "https://grandcanyonwest.com/" },
    ],
  },
  {
    id: "family",
    question: "Is this a family trip or an adults trip?",
    answer:
      "Both exist, and they are not the same booking. Some pools, clubs, and shows are 21 and older. Some resorts market to families. Read the age rule on the hotel and on the ticket. A casino floor is not a place to leave children.",
    sources: [],
  },
  {
    id: "free",
    question: "What can you do without a ticket?",
    answer:
      "Walking the Strip and walking the Fremont Street pedestrian mall do not require a ticket. A show, an observation deck, and a museum are separate purchases. If a venue says a sidewalk viewing is free, use that page. This guide does not keep a list of free shows, because the lineup changes.",
    sources: [],
  },
  {
    id: "budget",
    question: "What does a trip actually cost?",
    answer:
      "The room rate is not the bill. Add the resort fee, tax, food, rides, and any show or day-trip ticket. This page does not publish a daily budget, because the total moves with the dates and with whether a big show is in town. Use the fee table and the official pages.",
    sources: [],
  },
  {
    id: "pack",
    question: "What should you pack?",
    answer:
      "Shoes you can walk in, sun protection, a water bottle, and a layer for cold indoor air. Summer normals at the airport station are very hot. December’s average daily low there is 39.6°F, and January’s is 40.5°F. Check the forecast for your dates before you pack a coat.",
    sources: [ncei],
  },
];

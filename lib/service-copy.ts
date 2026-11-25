import { STUDIO_EMAIL } from "./studio";

export const HUB = {
  title: "Anzen Digital Media",
  eyebrow: "Las Vegas, Nevada",
  lead:
    "Anzen Digital Media LLC is a media and services company. We publish four desks, Gaming, Business, Tech, and Money, and we sell three services you can buy online.",
  latestHeading: "Latest",
  latestLead: "One card from each desk. Same weight, same layout.",
  servicesHeading: "Services",
  servicesLead:
    "Pay with Stripe Checkout, send a short intake form, and we email the work within 48 hours. No calls. Anzen is not a law firm.",
  flow: "Stripe Checkout, then the intake form, then a confirmation email, then delivery by email within 48 hours.",
};

export type ServiceFaq = { question: string; answer: string };

export type ServicePageCopy = {
  slug: string;
  title: string;
  description: string;
  lead: string;
  receivesTitle: string;
  receives: readonly string[];
  limitsTitle: string;
  limits: readonly string[];
  steps: readonly string[];
  faqs: readonly ServiceFaq[];
};

export const SERVICE_PAGES: readonly ServicePageCopy[] = [
  {
    slug: "trademark-search-report",
    title: "Trademark Search Report",
    description:
      "Trademark search report from Anzen Digital Media LLC in Las Vegas. $99 for a name, $179 for a name and logo, and an optional $19 a month watch. Informational research, not legal advice.",
    lead:
      "A researched look at similar names, and optionally a logo, before you spend more on a brand. Fully online. The report arrives by email.",
    receivesTitle: "What you receive",
    receives: [
      "The name you asked us to check, and the logo too if you bought that option.",
      "Similar marks we found in the USPTO trademark database, with a link to each official record.",
      "The goods or services listed on those records, in the words the record uses.",
      "A plain note on which results look close and which look farther away.",
      "For Trademark Watch, an email when we see a newly filed mark that looks similar to the name you gave us.",
    ],
    limitsTitle: "What this is not",
    limits: [
      "Anzen Digital Media LLC is not a law firm.",
      "The report is informational research. It is not legal advice.",
      "It is not an opinion that your name or logo can or cannot be registered.",
      "It does not guarantee that no one else is using the name.",
      "A federal database search does not list every state registration or every unregistered use.",
      "We do not file a trademark application for you.",
      "Talk with a trademark attorney before you file, or before you treat a name as cleared.",
    ],
    steps: [
      "Pay on this page with Stripe Checkout. The card form is on Stripe, not on our site.",
      "Complete the intake form: the name, what you sell, and where to send the report. For a logo search, reply to the confirmation email with the logo file.",
      "We email a confirmation to that address.",
      "We email the report within 48 hours after the intake is complete. For a logo search, the 48 hours start when the logo file arrives.",
    ],
    faqs: [
      {
        question: "Is there a meeting?",
        answer: "No. The whole service is the checkout, the form, and email.",
      },
      {
        question: "Will you tell me if I can register the name?",
        answer:
          "No. The report shows what we found and how close it looks. A trademark attorney is the person who can advise you on filing.",
      },
      {
        question: "What does Trademark Watch do?",
        answer:
          "For $19 a month we email you when we see a newly filed mark that looks similar to the name you asked us to watch. It is a research alert, not a legal opinion. Cancel anytime by emailing us. Cancellation stops the next month.",
      },
    ],
  },
  {
    slug: "grant-match-report",
    title: "Grant Match Report",
    description:
      "Grant match report from Anzen Digital Media LLC. A $149 researched list of grants a business appears eligible for, with official links and deadlines. No applications and no percentage of any award.",
    lead:
      "A researched list of grant programs your business appears to fit, with the official link and the deadline we could verify. We email the list. We do not apply for you.",
    receivesTitle: "What you receive",
    receives: [
      "Programs whose published rules appear to fit the facts you give us.",
      "The official link for each program, not a copy of the rules pasted without a source.",
      "The deadline shown on that official page on the day we checked it.",
      "A short note on the eligibility point that made it look like a fit, and any point that might not.",
    ],
    limitsTitle: "What this is not",
    limits: [
      "We do not submit a grant application for you.",
      "We do not promise that you will win, qualify, or receive money.",
      "We do not take a percentage of any award.",
      "“Appears eligible” means the published rules look like a fit based on what you told us. The funder decides.",
      "Programs change. A deadline can move after we send the report. Use the official link before you apply.",
      "This is research, not legal, tax, or accounting advice.",
    ],
    steps: [
      "Pay $149 with Stripe Checkout.",
      "Complete the intake form: the business, where it operates, and what you would use funds for.",
      "We email a confirmation.",
      "We email the report within 48 hours after the intake is complete.",
    ],
    faqs: [
      {
        question: "Will you apply for the grants?",
        answer: "No. You apply yourself, on the official site, if you decide to.",
      },
      {
        question: "Do you take a cut if we win?",
        answer: "No. The fee is $149. There is no percentage of an award.",
      },
      {
        question: "Is a grant guaranteed?",
        answer: "No. A match is a reading of published rules. The funder decides who receives money.",
      },
    ],
  },
  {
    slug: "nevada-annual-compliance-kit",
    title: "Nevada Annual Compliance Kit",
    description:
      "Nevada annual compliance kit from Anzen Digital Media LLC. A $99 checklist and prefilled walkthrough you submit yourself in ORION. State fees are paid to Nevada, not to Anzen. Certificate of Existence guide is $79.",
    lead:
      "A guided kit for a Nevada entity’s annual list and state business license. You submit it yourself in your own ORION account. The state fees are paid by you to the State of Nevada, separate from our fee.",
    receivesTitle: "What you receive",
    receives: [
      "A checklist in the order the state portal asks for the information.",
      "A walkthrough filled with the entity details you give us, so you can type them into your own account.",
      "A note on the state fees. For many Nevada limited-liability companies the annual list is $150 and the state business license renewal is $200, $350 together. Other entity types can owe a different license fee. The amount in your portal is the amount you pay the state. It is not part of the $99.",
      "Optional: a Certificate of Existence ordering guide for $79. You place that order yourself. The state charges its own certificate fee, paid to the state, not included in the $79.",
    ],
    limitsTitle: "What this is not",
    limits: [
      "Anzen does not file the annual list or the state business license for you.",
      "Anzen does not sign, submit, or log in to your SilverFlume or ORION account.",
      "You submit the filing yourself. A done-for-you filing option is not available yet.",
      "Anzen does not order a Certificate of Existence for you.",
      "This kit is not legal, tax, or accounting advice.",
      "Confirm the due date and the fee in your own ORION account or on nvsos.gov before you pay the state.",
    ],
    steps: [
      "Pay $99 for the kit, or $79 for the certificate guide, with Stripe Checkout.",
      "Complete the intake form with the entity details.",
      "We email a confirmation.",
      "We email the kit or the guide within 48 hours after the intake is complete.",
      "You log in to your own Nevada account and submit. You pay the state fees there.",
    ],
    faqs: [
      {
        question: "Will Anzen file this for me?",
        answer:
          "No. You submit the annual list and the business license in your own account. Done-for-you filing is not available yet.",
      },
      {
        question: "Is the $350 included?",
        answer:
          "No. The $350 figure is the state annual list plus state business license for many LLCs, and you pay it to the State of Nevada. Our fee is $99 for the kit. Confirm the state amount in the portal, because other entity types can differ.",
      },
      {
        question: "Where do I file?",
        answer:
          "In your own account on ORION, the Nevada Secretary of State portal at orion.nv.gov. ORION replaced the older SilverFlume portal. If you still have a SilverFlume login, try that same login on ORION.",
      },
    ],
  },
];

export const SERVICE_INDEX = {
  title: "Services",
  description:
    "Online services from Anzen Digital Media LLC in Las Vegas: trademark search, grant match report, and a Nevada annual compliance kit. No calls.",
  lead: HUB.servicesLead,
};

export const FAQ_PAGE = {
  title: "Questions",
  description:
    "Questions about Anzen Digital Media services. No calls. Trademark search, grant match, and the Nevada annual compliance kit are delivered by email.",
  lead: "Short answers. The service page and the Refund Policy control if a line here is shorter than those.",
  items: [
    {
      question: "Is there a meeting?",
      answer: "No. None of these services use a phone call or a video meeting. Checkout, a form, and email are the whole path.",
    },
    {
      question: "How do I pay?",
      answer: `You pay with Stripe Checkout on the service page. The card form is on Stripe. Anzen does not store the card number. Questions go to ${STUDIO_EMAIL}.`,
    },
    {
      question: "When does the work arrive?",
      answer:
        "We email a confirmation after your intake form, then email the finished work within 48 hours of a complete intake. A logo search starts the clock when the logo file arrives.",
    },
    {
      question: "Are you a law firm?",
      answer:
        "No. Anzen Digital Media LLC is not a law firm. The trademark report, the grant list, and the Nevada kit are informational. They are not legal advice. Consider talking with a lawyer before you file a trademark or rely on a filing.",
    },
    {
      question: "Will you file my Nevada annual list?",
      answer:
        "No. You submit it yourself in your own ORION account. State fees are paid by you to the state. Done-for-you filing is not available yet.",
    },
    {
      question: "How do I cancel Trademark Watch?",
      answer: `Email ${STUDIO_EMAIL} from the address you used at checkout. Cancellation stops the next month. The Refund Policy describes when a charge is refunded.`,
    },
    {
      question: "How do refunds work?",
      answer:
        "See the Refund Policy. In short, ask before we email the deliverable, or if we miss the 48 hour window. State fees you pay to Nevada are not Anzen fees.",
    },
  ] as ServiceFaq[],
};

export function servicePage(slug: string): ServicePageCopy | undefined {
  return SERVICE_PAGES.find((page) => page.slug === slug);
}

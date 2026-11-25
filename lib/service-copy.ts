import { STUDIO_EMAIL } from "./studio";

export const HUB = {
  title: "Anzen Digital Media",
  eyebrow: "Las Vegas",
  description:
    "Javier Segura runs Anzen Digital Media LLC from Las Vegas. Four desks, plus a trademark search, a grant match, and a Nevada annual list kit.",
  lead:
    "I am Javier Segura. Anzen Digital Media LLC is my company, Hispanic-owned, registered in Nevada, and run from Las Vegas. I publish four desks. I also sell three research jobs you can pay for from the page.",
  latestHeading: "New on each desk",
  latestLead: "Gaming gets the same card as Business, Tech, and Money. I play as LUNCHBRK. The other desks are the company.",
  servicesHeading: "Services you can pay for",
  servicesLead:
    "Stripe takes the card. You send a short form. I email the work within 48 hours. I am not a lawyer.",
};

export type ServiceFaq = { question: string; answer: string };

export type ServicePageCopy = {
  slug: string;
  title: string;
  description: string;
  byline: string;
  lead: string;
  aside: string;
  flow: string;
  receivesTitle: string;
  receives: readonly string[];
  limitsTitle: string;
  limits: readonly string[];
  stepsTitle: string;
  steps: readonly string[];
  priceLine: string;
  faqTitle: string;
  faqs: readonly ServiceFaq[];
};

export const SERVICE_PAGES: readonly ServicePageCopy[] = [
  {
    slug: "trademark-search-report",
    title: "Trademark search report",
    description:
      "Javier Segura in Las Vegas reads USPTO records for a name ($99) or a name and logo ($179). Research, not legal advice. Emailed within 48 hours.",
    byline: "Javier Segura, Las Vegas",
    lead:
      "People ask me if a name is available because the .com was for sale. A domain is not a trademark record. I pull the USPTO hits, link each one, and tell you which goods look close to yours.",
    aside:
      "I am not a lawyer, and Anzen is not a law firm. If you want a person to say 'file it,' hire a trademark attorney. I stop at the records.",
    flow: "Pay on Stripe. Tell me the name and what you sell. I email the report within 48 hours.",
    receivesTitle: "What is in the $99 report",
    receives: [
      "The name you asked me to check. The logo too, if you paid $179 and sent the file.",
      "Similar marks I found in the USPTO database, each with a link to the official record.",
      "The goods or services line, copied from the record, plus a note on which ones sit near what you sell.",
      "On Trademark Watch ($19 a month), an email when I see a newly filed mark that looks like the name you gave me.",
    ],
    limitsTitle: "Where a database search stops",
    limits: [
      "The report is research you can read. It is not legal advice.",
      "I will not tell you the name can be registered. I will not tell you it cannot.",
      "I do not promise the name is unused. State registers and unregistered use sit outside a federal search.",
      "I do not file the application.",
    ],
    stepsTitle: "From the card charge to your inbox",
    steps: [
      "Pay on this page. The card form is on Stripe, not on my site.",
      "Send the name, what you sell, and the email for the report. For a logo, reply to the confirmation with the file. The 48 hours start when I have that file.",
      "I email a confirmation, then the report.",
    ],
    priceLine: "Name $99. Name and logo $179. Watch $19 a month until you cancel by email.",
    faqTitle: "Questions before you pay",
    faqs: [
      {
        question: "Is a trademark search report legal advice?",
        answer:
          "No. I read public USPTO records and write down what I see. A trademark attorney is the one who can advise you to file.",
      },
      {
        question: "Can you tell me if my name can be registered?",
        answer:
          "No. The report shows close records and the goods listed on them. Registration is a legal judgment, and I do not make it.",
      },
      {
        question: "What does the $19 trademark watch send me?",
        answer:
          "Once a month I email you if I see a new filing that looks similar to the name you asked me to watch. Cancel by writing contact@anzendigitalmedia.com. That stops the next charge.",
      },
    ],
  },
  {
    slug: "grant-match-report",
    title: "Small business grant match",
    description:
      "A $149 list of small-business grants that appear to fit, with official links and deadlines. Javier Segura does not apply and does not take a cut.",
    byline: "Javier Segura, Las Vegas",
    lead:
      "I read the eligibility page, copy the official link, and write down the deadline that was on it the day I looked. You get that list by email. You apply yourself, if you still want to.",
    aside:
      "If someone already told you the money is reserved, read the scam note on the Money desk before you pay anybody, including me.",
    flow: "Pay $149. Tell me the business. I email the list within 48 hours of the form.",
    receivesTitle: "What the $149 list includes",
    receives: [
      "Programs whose published rules look like a fit for the facts you send.",
      "The official link. I do not paste rules and hide the source.",
      "The deadline printed on that page the day I checked, and the eligibility line that made it look close.",
    ],
    limitsTitle: "What I will not do with a grant",
    limits: [
      "I do not submit the application.",
      "I do not promise you will win, qualify, or get paid.",
      "I do not take a percentage of an award. The fee is $149.",
      "“Appears eligible” means the published rules look like a fit from what you told me. The funder decides. Deadlines move. Open the official link before you apply.",
    ],
    stepsTitle: "After you pay",
    steps: [
      "Stripe charges $149.",
      "The form asks what the business does, where it operates, and what you would use the money for.",
      "I email a confirmation, then the list, within 48 hours of that form.",
    ],
    priceLine: "One price: $149.",
    faqTitle: "Ask this before you pay",
    faqs: [
      {
        question: "Do you submit the grant application?",
        answer: "No. You apply on the agency’s site if you decide the program is real.",
      },
      {
        question: "Do you take a percentage if I win a grant?",
        answer: "No. I am paid $149 for the list. There is no cut of an award.",
      },
      {
        question: "Are these grants guaranteed?",
        answer:
          "No. A match is my reading of a public page. Plenty of real programs still say no. Anyone who guarantees the award is selling a different product than this one.",
      },
    ],
  },
  {
    slug: "nevada-annual-compliance-kit",
    title: "Nevada annual list filing kit",
    description:
      "A $99 Nevada annual list filing kit. You submit it in your own ORION account. The state’s fee, often $350 for an LLC, is paid to Nevada.",
    byline: "Javier Segura, Las Vegas",
    lead:
      "Anzen is a Nevada LLC. I file my own annual list. This kit is the checklist and the walkthrough, filled with your entity’s details, so you can type them into ORION yourself.",
    aside:
      "I will not log in for you. Done-for-you filing is not available yet. The $350 figure, when it applies, is paid to the State of Nevada, not to me.",
    flow: "Pay $99 for the kit, or $79 if you only need the certificate steps. You still press submit in your own account.",
    receivesTitle: "What you get for $99",
    receives: [
      "A checklist in the order ORION asks the questions.",
      "Your entity name, number, and managers written into that walkthrough, from the form you send me.",
      "A fee note. For many Nevada LLCs the annual list is $150 and the state business license renewal is $200. That $350 is the state’s, and other entity types can owe a different license fee. The portal total is the one you pay.",
      "A separate $79 guide if you need to order a Certificate of Existence yourself. Nevada charges its own certificate fee at that checkout. I do not order it.",
    ],
    limitsTitle: "Your ORION password stays yours",
    limits: [
      "Anzen does not file the annual list or the state business license for you.",
      "I do not sign, submit, or log in to your SilverFlume or ORION account.",
      "This is not legal, tax, or accounting advice. Check the due date and the fee in ORION or on nvsos.gov before you pay the state.",
    ],
    stepsTitle: "You pay me, then you pay Nevada",
    steps: [
      "Pay $99, or $79 for the certificate guide.",
      "Send the entity details.",
      "I email the kit within 48 hours.",
      "You open your own account at orion.nv.gov and submit. The state fee is charged there.",
    ],
    priceLine: "Kit $99. Certificate of Existence guide $79. State fees are separate.",
    faqTitle: "Questions I get from Nevada owners",
    faqs: [
      {
        question: "Do you file my Nevada annual list?",
        answer:
          "No. You submit it in your own ORION account. Done-for-you filing is not available yet.",
      },
      {
        question: "Is the $350 state fee included in the $99?",
        answer:
          "No. For many LLCs the state wants $150 for the list and $200 for the business license. You pay that to Nevada. My fee is $99. Corporations and some other entities owe a different license fee, so read the amount in your portal.",
      },
      {
        question: "Do I still use SilverFlume?",
        answer:
          "Use ORION at orion.nv.gov. It replaced SilverFlume. If your old SilverFlume login still works, try it there. If it does not, the Secretary of State’s help page is the next stop, not me logging in.",
      },
    ],
  },
];

export const SERVICE_INDEX = {
  title: "Services",
  description:
    "Three research jobs from Javier Segura in Las Vegas: a trademark search report, a small-business grant match, and a Nevada annual list filing kit.",
  lead: "Pick one. The price is on the page. I email the work. There is no meeting.",
};

export const FAQ_PAGE = {
  title: "Questions",
  description:
    "Plain answers from Javier Segura about the trademark search, the grant match, and the Nevada annual list kit sold by Anzen Digital Media LLC.",
  lead: "The service page and the refund policy win if a short answer here leaves something out.",
  items: [
    {
      question: "Do I have to meet with you?",
      answer: `No. You pay on Stripe, send the form, and I email the work. Write ${STUDIO_EMAIL} if something breaks.`,
    },
    {
      question: "Who takes the card?",
      answer:
        "Stripe. The form is on checkout.stripe.com. I do not store the card number. I keep the checkout email and the form answers so I can do the job.",
    },
    {
      question: "When does the work show up?",
      answer:
        "Within 48 hours after the form is complete. A logo search waits until the file is in my inbox. Then the clock starts.",
    },
    {
      question: "Are you a law firm?",
      answer:
        "No. Anzen Digital Media LLC is not a law firm. I am not a lawyer. The trademark report, the grant list, and the Nevada kit are research and checklists. Talk to a lawyer before you file a trademark or bet the company on a filing.",
    },
    {
      question: "Will you file my Nevada annual list?",
      answer:
        "No. You file it in your own ORION account. State fees go to Nevada. Done-for-you filing is not available yet.",
    },
    {
      question: "How do I cancel Trademark Watch?",
      answer: `Email ${STUDIO_EMAIL} from the address on the subscription. Cancellation stops the next month. The refund page says when a charge comes back.`,
    },
    {
      question: "Can I get the fee back?",
      answer:
        "Read the refund page. Ask before I email the deliverable, or if I miss the 48 hours. Money you pay the State of Nevada is not mine to refund.",
    },
  ] satisfies ServiceFaq[],
};

export function servicePage(slug: string): ServicePageCopy | undefined {
  return SERVICE_PAGES.find((page) => page.slug === slug);
}

import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { readEnv } from "./env";

export const SERVICE_PRODUCT = "service";
export const SERVICE_TURNAROUND = "48 hours";

export type ServiceMode = "payment" | "subscription";

export type IntakeField = {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  required: boolean;
  maxLength: number;
  options?: readonly string[];
  help?: string;
};

export type ServiceOffer = {
  id: string;
  service: string;
  /** Env var that holds the Stripe Price id. Unset until the owner creates the price. */
  env: string;
  name: string;
  /** Short label on the buy button. */
  button: string;
  amountCents: number;
  mode: ServiceMode;
  cadence: "once" | "month";
  path: string;
  fields: readonly IntakeField[];
  acknowledge: string;
};

const trademarkBase: readonly IntakeField[] = [
  { name: "mark", label: "Name to search", type: "text", required: true, maxLength: 200 },
  {
    name: "goods",
    label: "What the business sells or does",
    type: "textarea",
    required: true,
    maxLength: 2000,
    help: "Plain words are enough. We use this to compare goods and services on the records we find.",
  },
  { name: "owner", label: "Who would own the mark", type: "text", required: true, maxLength: 200 },
];

const entityFields: readonly IntakeField[] = [
  { name: "entityName", label: "Entity name, as registered", type: "text", required: true, maxLength: 200 },
  {
    name: "entityNumber",
    label: "Nevada entity number, if you know it",
    type: "text",
    required: false,
    maxLength: 40,
  },
  {
    name: "entityType",
    label: "Entity type",
    type: "select",
    required: true,
    maxLength: 40,
    options: ["Limited-liability company", "Corporation", "Other"],
  },
];

export const SERVICE_OFFERS: readonly ServiceOffer[] = [
  {
    id: "trademark-name",
    service: "trademark-search-report",
    env: "STRIPE_PRICE_TRADEMARK_NAME",
    name: "Trademark Search Report, name",
    button: "Pay $99 for a name search",
    amountCents: 9900,
    mode: "payment",
    cadence: "once",
    path: "/services/trademark-search-report",
    fields: [
      ...trademarkBase,
      { name: "notes", label: "Anything else we should compare", type: "textarea", required: false, maxLength: 2000 },
    ],
    acknowledge:
      "I understand Anzen is not a law firm. This report is informational research, not legal advice, and it does not guarantee that a name can be registered.",
  },
  {
    id: "trademark-name-logo",
    service: "trademark-search-report",
    env: "STRIPE_PRICE_TRADEMARK_NAME_LOGO",
    name: "Trademark Search Report, name and logo",
    button: "Pay $179 for a name and logo search",
    amountCents: 17900,
    mode: "payment",
    cadence: "once",
    path: "/services/trademark-search-report",
    fields: [
      ...trademarkBase,
      {
        name: "logo",
        label: "Describe the logo",
        type: "textarea",
        required: true,
        maxLength: 2000,
        help: "Reply to the confirmation email with the logo file. We need the file before the 48 hours start.",
      },
    ],
    acknowledge:
      "I understand Anzen is not a law firm. This report is informational research, not legal advice, and it does not guarantee that a name or logo can be registered.",
  },
  {
    id: "trademark-watch",
    service: "trademark-search-report",
    env: "STRIPE_PRICE_TRADEMARK_WATCH",
    name: "Trademark Watch",
    button: "Start Trademark Watch at $19 a month",
    amountCents: 1900,
    mode: "subscription",
    cadence: "month",
    path: "/services/trademark-search-report",
    fields: [
      { name: "mark", label: "Name to watch", type: "text", required: true, maxLength: 200 },
      { name: "goods", label: "Goods or services to compare", type: "textarea", required: true, maxLength: 2000 },
      {
        name: "serial",
        label: "Serial or registration number, if you have one",
        type: "text",
        required: false,
        maxLength: 40,
      },
    ],
    acknowledge:
      "I understand Anzen is not a law firm. A watch alert is a research notice, not legal advice, and it is not a promise that a filing is or is not a problem.",
  },
  {
    id: "grant-match",
    service: "grant-match-report",
    env: "STRIPE_PRICE_GRANT_MATCH",
    name: "Grant Match Report",
    button: "Pay $149 for a grant match report",
    amountCents: 14900,
    mode: "payment",
    cadence: "once",
    path: "/services/grant-match-report",
    fields: [
      { name: "business", label: "Legal business name", type: "text", required: true, maxLength: 200 },
      {
        name: "entity",
        label: "Entity type",
        type: "select",
        required: true,
        maxLength: 40,
        options: ["Limited-liability company", "Corporation", "Nonprofit", "Sole proprietorship", "Other"],
      },
      { name: "state", label: "State where the business operates", type: "text", required: true, maxLength: 80 },
      { name: "activity", label: "What the business does", type: "textarea", required: true, maxLength: 2000 },
      { name: "years", label: "Years in operation", type: "text", required: true, maxLength: 40 },
      { name: "employees", label: "About how many employees", type: "text", required: true, maxLength: 40 },
      { name: "revenue", label: "About annual revenue", type: "text", required: true, maxLength: 80 },
      { name: "use", label: "What you would use grant money for", type: "textarea", required: true, maxLength: 2000 },
    ],
    acknowledge:
      "I understand this is a researched list with official links. Anzen does not apply for grants, does not promise an award, and does not take a percentage of any award.",
  },
  {
    id: "nevada-compliance",
    service: "nevada-annual-compliance-kit",
    env: "STRIPE_PRICE_NEVADA_COMPLIANCE",
    name: "Nevada Annual Compliance Kit",
    button: "Pay $99 for the compliance kit",
    amountCents: 9900,
    mode: "payment",
    cadence: "once",
    path: "/services/nevada-annual-compliance-kit",
    fields: [
      ...entityFields,
      {
        name: "formed",
        label: "Formation month and year, if you know it",
        type: "text",
        required: false,
        maxLength: 40,
      },
      {
        name: "need",
        label: "What you need the kit to cover",
        type: "select",
        required: true,
        maxLength: 80,
        options: [
          "Annual list and state business license",
          "Annual list only",
          "State business license only",
          "Not sure",
        ],
      },
    ],
    acknowledge:
      "I understand I will submit the filing myself in my own Nevada account. Anzen does not file it for me. State fees are paid by me to the state, separate from the $99.",
  },
  {
    id: "certificate-existence",
    service: "nevada-annual-compliance-kit",
    env: "STRIPE_PRICE_CERTIFICATE_EXISTENCE",
    name: "Certificate of Existence ordering guide",
    button: "Pay $79 for the certificate guide",
    amountCents: 7900,
    mode: "payment",
    cadence: "once",
    path: "/services/nevada-annual-compliance-kit",
    fields: [
      ...entityFields,
      {
        name: "purpose",
        label: "Who asked for the certificate, if anyone",
        type: "text",
        required: false,
        maxLength: 200,
      },
    ],
    acknowledge:
      "I understand Anzen does not order the certificate for me. I place the order in my own Nevada account, and any state fee is paid by me to the state.",
  },
];

const OFFER_BY_ID = new Map(SERVICE_OFFERS.map((offer) => [offer.id, offer]));

export function offerById(id: string): ServiceOffer | undefined {
  return OFFER_BY_ID.get(id);
}

export function offersForService(service: string): ServiceOffer[] {
  return SERVICE_OFFERS.filter((offer) => offer.service === service);
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
}

export function offerPriceLabel(offer: ServiceOffer): string {
  const amount = formatUsd(offer.amountCents);
  return offer.cadence === "month" ? `${amount} a month` : amount;
}

/** Real Stripe Price id from the environment. Placeholders and blanks do not count. */
export function servicePriceId(offer: ServiceOffer): string | null {
  const value = readEnv(offer.env);
  if (!value) return null;
  if (value.includes("REPLACE")) return null;
  return value;
}

export function serviceCheckoutReady(offer: ServiceOffer): boolean {
  return Boolean(readEnv("STRIPE_SECRET_KEY") && servicePriceId(offer));
}

type PriceCheck = {
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring: { interval: string; interval_count?: number | null } | null;
};

/** Checkout may start only when the Stripe Price matches this offer. */
export function isServicePrice(offer: ServiceOffer, price: PriceCheck): boolean {
  if (!price.active) return false;
  if (price.currency !== "usd") return false;
  if (price.unit_amount !== offer.amountCents) return false;
  if (offer.mode === "payment") return !price.recurring;
  return price.recurring?.interval === "month" && (price.recurring.interval_count ?? 1) === 1;
}

export function isServiceProduct(metadata: { product?: string | null } | null | undefined): boolean {
  return metadata?.product === SERVICE_PRODUCT;
}

export function isServiceSession(session: { metadata: { product?: string | null; offer?: string | null } | null }): boolean {
  return isServiceProduct(session.metadata) && Boolean(session.metadata?.offer && offerById(session.metadata.offer));
}

export function serviceCheckoutFields(
  offer: ServiceOffer,
  priceId: string,
  origin: string,
): Stripe.Checkout.SessionCreateParams {
  const shared: Stripe.Checkout.SessionCreateParams = {
    mode: offer.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/services/intake?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${offer.path}`,
    client_reference_id: offer.id,
    metadata: { product: SERVICE_PRODUCT, offer: offer.id, service: offer.service },
  };
  if (offer.mode === "subscription") {
    return {
      ...shared,
      subscription_data: {
        description: offer.name,
        metadata: { product: SERVICE_PRODUCT, offer: offer.id, service: offer.service },
      },
    };
  }
  return {
    ...shared,
    customer_creation: "always",
    payment_intent_data: {
      description: offer.name,
      metadata: { product: SERVICE_PRODUCT, offer: offer.id, service: offer.service },
    },
  };
}

export function serviceIntegrationIdentifier(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  let suffix = "";
  for (const byte of bytes) suffix += letters[byte % letters.length];
  return `service_hosted_${suffix}`;
}

export function paidServiceSession(session: Stripe.Checkout.Session): boolean {
  if (!isServiceSession(session)) return false;
  if (session.status !== "complete") return false;
  if (session.currency && session.currency !== "usd") return false;
  const offer = offerById(session.metadata?.offer ?? "");
  if (!offer) return false;
  if (session.mode !== offer.mode) return false;
  const total = session.amount_total;
  if (typeof total === "number" && total > 0 && total !== offer.amountCents) return false;
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}

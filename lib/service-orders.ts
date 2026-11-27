import type Stripe from "stripe";
import { offerById, paidServiceSession, type ServiceOffer } from "./services";
import { notifyServiceForm, sendServiceMail } from "./service-mail";
import { getServiceStore } from "./service-store";
import { STUDIO_EMAIL } from "./studio";

export type MailState = "not_sent" | "sent" | "pending_configuration" | "failed";

export type ServiceIntake = {
  submittedAt: string;
  deliveryEmail: string;
  answers: Record<string, string>;
};

export type ServiceOrder = {
  id: string;
  offerId: string;
  email: string;
  customerId: string | null;
  subscriptionId: string | null;
  paymentStatus: string;
  intake: ServiceIntake | null;
  paymentNotice: MailState;
  confirmation: MailState;
  operatorNotice: MailState;
  createdAt: string;
  updatedAt: string;
};

type PaymentRecord = {
  id: string;
  offerId: string;
  email: string;
  customerId: string | null;
  subscriptionId: string | null;
  paymentStatus: string;
  paymentNotice: MailState;
  createdAt: string;
  updatedAt: string;
};

type IntakeRecord = {
  intake: ServiceIntake;
  confirmation: MailState;
  operatorNotice: MailState;
  updatedAt: string;
};

function paymentKey(sessionId: string): string {
  return `pay:${sessionId}`;
}

function intakeKey(sessionId: string): string {
  return `intake:${sessionId}`;
}

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await getServiceStore().get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getServiceOrder(sessionId: string): Promise<ServiceOrder | null> {
  const payment = await readJson<PaymentRecord>(paymentKey(sessionId));
  const intake = await readJson<IntakeRecord>(intakeKey(sessionId));
  if (!payment && !intake) return null;
  return {
    id: payment?.id ?? sessionId,
    offerId: payment?.offerId ?? "",
    email: payment?.email ?? intake?.intake.deliveryEmail ?? "",
    customerId: payment?.customerId ?? null,
    subscriptionId: payment?.subscriptionId ?? null,
    paymentStatus: payment?.paymentStatus ?? "",
    intake: intake?.intake ?? null,
    paymentNotice: payment?.paymentNotice ?? "not_sent",
    confirmation: intake?.confirmation ?? "not_sent",
    operatorNotice: intake?.operatorNotice ?? "not_sent",
    createdAt: payment?.createdAt ?? intake?.updatedAt ?? new Date().toISOString(),
    updatedAt: intake?.updatedAt ?? payment?.updatedAt ?? new Date().toISOString(),
  };
}

async function savePayment(record: PaymentRecord): Promise<void> {
  await getServiceStore().set(paymentKey(record.id), JSON.stringify(record));
}

async function saveIntake(sessionId: string, record: IntakeRecord): Promise<void> {
  await getServiceStore().set(intakeKey(sessionId), JSON.stringify(record));
}

function stringId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function paymentReceivedMail(offer: ServiceOffer, intakeLink: string): { subject: string; text: string } {
  return {
    subject: `Payment received: ${offer.name}`,
    text: [
      `Javier at Anzen Digital Media received your payment for ${offer.name}.`,
      "",
      "Send the details on this form:",
      intakeLink,
      "",
      "I email a confirmation when the form is in, then the work within 48 hours. A logo file has to arrive before that clock starts.",
      "",
      "Javier Segura",
      "Anzen Digital Media LLC, Las Vegas",
      STUDIO_EMAIL,
    ].join("\n"),
  };
}

export function confirmationMail(
  offer: ServiceOffer,
  order: ServiceOrder,
): { subject: string; text: string } {
  const lines = [
    `I have the ${offer.name} form.`,
    "",
    `The finished work goes to ${order.intake?.deliveryEmail ?? order.email} within 48 hours.`,
    `Reference: ${order.id}`,
    "",
  ];
  if (offer.id === "trademark-name-logo") {
    lines.push("Reply with the logo file. I start the 48 hours when that file is here.", "");
  }
  lines.push(offer.acknowledge, "", "Javier Segura", "Anzen Digital Media LLC, Las Vegas", STUDIO_EMAIL);
  return { subject: `We have your order: ${offer.name}`, text: lines.join("\n") };
}

function intakeLink(session: Stripe.Checkout.Session): string {
  const success = session.success_url ?? "";
  try {
    const url = new URL(success);
    return `${url.origin}/services/intake?session_id=${encodeURIComponent(session.id)}`;
  } catch {
    return `https://anzendigitalmedia.com/services/intake?session_id=${encodeURIComponent(session.id)}`;
  }
}

function noticeSettled(state: MailState | undefined): boolean {
  return state === "sent" || state === "pending_configuration";
}

/** Record a paid Checkout session. Writes only the payment record, never the intake. */
export async function recordPaidServiceSession(session: Stripe.Checkout.Session): Promise<ServiceOrder | null> {
  if (!paidServiceSession(session)) return null;
  const offer = offerById(session.metadata?.offer ?? "");
  if (!offer) return null;
  const existing = await readJson<PaymentRecord>(paymentKey(session.id));
  const now = new Date().toISOString();
  const record: PaymentRecord = {
    id: session.id,
    offerId: offer.id,
    email: session.customer_details?.email ?? existing?.email ?? "",
    customerId: stringId(session.customer) ?? existing?.customerId ?? null,
    subscriptionId: stringId(session.subscription) ?? existing?.subscriptionId ?? null,
    paymentStatus: session.payment_status ?? existing?.paymentStatus ?? "paid",
    paymentNotice: existing?.paymentNotice ?? "not_sent",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (record.email && !noticeSettled(record.paymentNotice)) {
    const mail = paymentReceivedMail(offer, intakeLink(session));
    record.paymentNotice = await sendServiceMail({ to: record.email, ...mail });
  }

  await savePayment(record);
  const order = await getServiceOrder(session.id);
  if (record.paymentNotice === "failed") {
    throw new Error("Service payment email failed");
  }
  return order;
}

/** Send the intake confirmation again when the last try failed. Does not throw. */
export async function retryServiceConfirmation(sessionId: string): Promise<ServiceOrder | null> {
  const order = await getServiceOrder(sessionId);
  const offer = order ? offerById(order.offerId) : undefined;
  if (!order?.intake || !offer) return order;
  if (noticeSettled(order.confirmation) && noticeSettled(order.operatorNotice)) return order;
  return deliverIntakeMail(order, offer);
}

export type IntakeResult =
  | { ok: true; order: ServiceOrder }
  | { ok: false; error: "missing" | "email" | "acknowledge" };

export async function saveServiceIntake(
  session: Stripe.Checkout.Session,
  answers: Record<string, string>,
  deliveryEmail: string,
  acknowledged: boolean,
): Promise<IntakeResult> {
  if (!paidServiceSession(session)) return { ok: false, error: "missing" };
  const offer = offerById(session.metadata?.offer ?? "");
  if (!offer) return { ok: false, error: "missing" };
  if (!acknowledged) return { ok: false, error: "acknowledge" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail) || deliveryEmail.length > 200) {
    return { ok: false, error: "email" };
  }

  const cleaned: Record<string, string> = {};
  for (const field of offer.fields) {
    const value = (answers[field.name] ?? "").trim();
    if (field.required && !value) return { ok: false, error: "missing" };
    if (value.length > field.maxLength) return { ok: false, error: "missing" };
    if (field.type === "select" && value && field.options && !field.options.includes(value)) {
      return { ok: false, error: "missing" };
    }
    if (value) cleaned[field.name] = value;
  }

  let existing: ServiceOrder | null = null;
  try {
    existing = await recordPaidServiceSession(session);
  } catch {
    existing = await getServiceOrder(session.id);
  }
  if (!existing) return { ok: false, error: "missing" };
  if (existing.intake) {
    if (existing.confirmation === "failed" || existing.operatorNotice === "failed") {
      const retried = await deliverIntakeMail(existing, offer);
      return { ok: true, order: retried ?? existing };
    }
    return { ok: true, order: existing };
  }

  const now = new Date().toISOString();
  const order: ServiceOrder = {
    ...existing,
    intake: { submittedAt: now, deliveryEmail, answers: cleaned },
    confirmation: "not_sent",
    operatorNotice: "not_sent",
    updatedAt: now,
  };
  const saved = await deliverIntakeMail(order, offer);
  return { ok: true, order: saved ?? order };
}

async function deliverIntakeMail(order: ServiceOrder, offer: ServiceOffer): Promise<ServiceOrder | null> {
  if (!order.intake) return order;
  const now = new Date().toISOString();
  let confirmation = order.confirmation;
  let operatorNotice = order.operatorNotice ?? "not_sent";
  if (!noticeSettled(confirmation)) {
    const mail = confirmationMail(offer, order);
    confirmation = await sendServiceMail({ to: order.intake.deliveryEmail, ...mail });
    if (order.email && order.email.toLowerCase() !== order.intake.deliveryEmail.toLowerCase() && confirmation !== "failed") {
      await sendServiceMail({ to: order.email, ...mail });
    }
  }
  if (!noticeSettled(operatorNotice)) {
    operatorNotice = await sendServiceMail({
      to: STUDIO_EMAIL,
      subject: `New service order: ${offer.name}`,
      text: operatorText(offer, order),
    });
    if (operatorNotice !== "failed") {
      await notifyServiceForm({
        offer: offer.name,
        email: order.intake.deliveryEmail,
        reference: order.id,
        summary: operatorText(offer, order).slice(0, 4000),
      });
    }
  }
  await saveIntake(order.id, { intake: order.intake, confirmation, operatorNotice, updatedAt: now });
  return getServiceOrder(order.id);
}

function operatorText(offer: ServiceOffer, order: ServiceOrder): string {
  const lines = [
    `Offer: ${offer.name}`,
    `Reference: ${order.id}`,
    `Checkout email: ${order.email}`,
    `Delivery email: ${order.intake?.deliveryEmail ?? ""}`,
    "",
  ];
  for (const [name, value] of Object.entries(order.intake?.answers ?? {})) {
    lines.push(`${name}: ${value}`);
  }
  return lines.join("\n");
}

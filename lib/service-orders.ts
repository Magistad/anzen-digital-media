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
  createdAt: string;
  updatedAt: string;
};

function keyFor(sessionId: string): string {
  return `order:${sessionId}`;
}

export async function getServiceOrder(sessionId: string): Promise<ServiceOrder | null> {
  const raw = await getServiceStore().get(keyFor(sessionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceOrder;
  } catch {
    return null;
  }
}

async function saveServiceOrder(order: ServiceOrder): Promise<void> {
  await getServiceStore().set(keyFor(order.id), JSON.stringify(order));
}

function stringId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function paymentReceivedMail(offer: ServiceOffer, intakeLink: string): { subject: string; text: string } {
  return {
    subject: `Payment received: ${offer.name}`,
    text: [
      `We received your payment for ${offer.name}.`,
      "",
      "Open this link and send the details we need:",
      intakeLink,
      "",
      "After you submit that form, we email a confirmation. We then email the finished work within 48 hours of a complete intake.",
      "",
      "You do not need a meeting.",
      "",
      "Anzen Digital Media LLC",
      STUDIO_EMAIL,
    ].join("\n"),
  };
}

export function confirmationMail(
  offer: ServiceOffer,
  order: ServiceOrder,
): { subject: string; text: string } {
  const lines = [
    `We have your ${offer.name} order.`,
    "",
    `We will email the finished work to ${order.intake?.deliveryEmail ?? order.email} within 48 hours.`,
    `Order reference: ${order.id}`,
    "",
  ];
  if (offer.id === "trademark-name-logo") {
    lines.push("Reply to this email with the logo file. The 48 hours start when we have that file.", "");
  }
  lines.push(offer.acknowledge, "", "Anzen Digital Media LLC", STUDIO_EMAIL);
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

/** Record a paid Checkout session. Safe to call more than once. */
export async function recordPaidServiceSession(session: Stripe.Checkout.Session): Promise<ServiceOrder | null> {
  if (!paidServiceSession(session)) return null;
  const offer = offerById(session.metadata?.offer ?? "");
  if (!offer) return null;
  const existing = await getServiceOrder(session.id);
  const now = new Date().toISOString();
  const order: ServiceOrder = {
    id: session.id,
    offerId: offer.id,
    email: session.customer_details?.email ?? existing?.email ?? "",
    customerId: stringId(session.customer) ?? existing?.customerId ?? null,
    subscriptionId: stringId(session.subscription) ?? existing?.subscriptionId ?? null,
    paymentStatus: session.payment_status ?? existing?.paymentStatus ?? "paid",
    intake: existing?.intake ?? null,
    paymentNotice: existing?.paymentNotice ?? "not_sent",
    confirmation: existing?.confirmation ?? "not_sent",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (order.email && order.paymentNotice !== "sent" && order.paymentNotice !== "pending_configuration") {
    const mail = paymentReceivedMail(offer, intakeLink(session));
    order.paymentNotice = await sendServiceMail({ to: order.email, ...mail });
  }

  await saveServiceOrder(order);
  if (order.paymentNotice === "failed") {
    throw new Error("Service payment email failed");
  }
  return order;
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

  const existing = (await recordPaidServiceSession(session)) ?? (await getServiceOrder(session.id));
  if (!existing) return { ok: false, error: "missing" };
  if (existing.intake) return { ok: true, order: existing };

  const now = new Date().toISOString();
  const order: ServiceOrder = {
    ...existing,
    intake: { submittedAt: now, deliveryEmail, answers: cleaned },
    updatedAt: now,
  };

  const mail = confirmationMail(offer, order);
  order.confirmation = await sendServiceMail({ to: deliveryEmail, ...mail });
  if (order.email && order.email.toLowerCase() !== deliveryEmail.toLowerCase()) {
    await sendServiceMail({ to: order.email, ...mail });
  }
  await sendServiceMail({
    to: STUDIO_EMAIL,
    subject: `New service order: ${offer.name}`,
    text: operatorText(offer, order),
  });
  await saveServiceOrder(order);
  await notifyServiceForm({
    offer: offer.name,
    email: deliveryEmail,
    reference: order.id,
    summary: operatorText(offer, order).slice(0, 4000),
  });
  return { ok: true, order };
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

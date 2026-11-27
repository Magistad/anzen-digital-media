import type { Metadata } from "next";
import Link from "next/link";
import { offerById, paidServiceSession } from "../../../../lib/services";
import { getServiceOrder } from "../../../../lib/service-orders";
import { getStripe } from "../../../../lib/stripe";
import { STUDIO_EMAIL } from "../../../../lib/studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service intake",
  description: "Send the details for an Anzen Digital Media service after checkout.",
  robots: { index: false, follow: false },
};

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

const ERRORS: Record<string, string> = {
  missing: "Check the required fields and send the form again.",
  email: "Enter an email like you@domain.com.",
  acknowledge: "Confirm the note under the form before sending.",
};

export default async function IntakePage({
  searchParams,
}: {
  searchParams?: { session_id?: string | string[]; error?: string | string[] };
}) {
  const sessionId = one(searchParams?.session_id);
  const error = one(searchParams?.error);
  const stripe = getStripe();
  if (!stripe || !sessionId) {
    return (
      <main id="content" className="desk-shell">
        <div className="desk-frame">
          <h1 className="desk-title">Intake form</h1>
          <p className="desk-lead">This form opens after Stripe Checkout. Start from the service page.</p>
          <p className="desk-lead">
            <Link href="/services">Services</Link>
          </p>
        </div>
      </main>
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    session = null;
  }
  const offer = session && paidServiceSession(session) ? offerById(session.metadata?.offer ?? "") : undefined;
  if (!session || !offer) {
    return (
      <main id="content" className="desk-shell">
        <div className="desk-frame">
          <h1 className="desk-title">We cannot open this order</h1>
          <p className="desk-lead">
            The payment is not complete, or this link does not match a service order. If you just paid, wait a minute and reload. You can also write to {STUDIO_EMAIL}.
          </p>
        </div>
      </main>
    );
  }

  const existing = await getServiceOrder(sessionId);
  if (existing?.intake) {
    return (
      <main id="content" className="desk-shell">
        <div className="desk-frame">
          <h1 className="desk-title">We already have this order</h1>
          <p className="desk-lead">
            The intake for {offer.name} is in. We email the work within 48 hours. Reference: {sessionId}.
          </p>
          <p className="desk-lead">
            <Link href={`/services/received?session_id=${encodeURIComponent(sessionId)}`}>Order confirmation</Link>
          </p>
        </div>
      </main>
    );
  }

  const email = session.customer_details?.email ?? "";

  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame">
        <p className="desk-kicker">
          <Link href={offer.path}>{offer.name}</Link>
        </p>
        <h1 className="desk-title">Tell us what to prepare</h1>
        <p className="desk-lead">
          Payment is in. Send these details and we email a confirmation, then the finished work within 48 hours.
        </p>
        {error && ERRORS[error] ? (
          <p className="field-error" role="alert">
            {ERRORS[error]}
          </p>
        ) : null}
        <form className="intake-form" action="/api/services/intake" method="post">
          <input type="hidden" name="session_id" value={sessionId} />
          <p className="contact-hp" hidden>
            <label>
              Do not fill this in
              <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <label htmlFor="deliveryEmail">
            <span>Email for the confirmation and the finished work</span>
            <input id="deliveryEmail" name="deliveryEmail" type="email" required defaultValue={email} autoComplete="email" maxLength={200} />
          </label>
          {offer.fields.map((field) => (
            <label key={field.name} htmlFor={`field-${field.name}`}>
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea id={`field-${field.name}`} name={field.name} required={field.required} maxLength={field.maxLength} rows={4} />
              ) : field.type === "select" ? (
                <select id={`field-${field.name}`} name={field.name} required={field.required} defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input id={`field-${field.name}`} name={field.name} type="text" required={field.required} maxLength={field.maxLength} />
              )}
              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}
          <label className="intake-check" htmlFor="acknowledge">
            <input id="acknowledge" name="acknowledge" type="checkbox" value="yes" required />
            <span>{offer.acknowledge}</span>
          </label>
          <button type="submit" className="service-buy">
            Send intake
          </button>
        </form>
      </div>
    </main>
  );
}

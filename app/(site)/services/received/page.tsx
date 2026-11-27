import type { Metadata } from "next";
import Link from "next/link";
import { offerById } from "../../../../lib/services";
import { getServiceOrder } from "../../../../lib/service-orders";
import { STUDIO_EMAIL } from "../../../../lib/studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order received",
  description: "Anzen Digital Media received your service order.",
  robots: { index: false, follow: false },
};

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function ReceivedPage({
  searchParams,
}: {
  searchParams?: { session_id?: string | string[] };
}) {
  const sessionId = one(searchParams?.session_id);
  const order = sessionId ? await getServiceOrder(sessionId) : null;
  const offer = order ? offerById(order.offerId) : undefined;

  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame">
        <h1 className="desk-title">Order received</h1>
        {order && offer ? (
          <>
            <p className="desk-lead">
              We have your {offer.name} order. A confirmation goes to {order.intake?.deliveryEmail ?? order.email}. The finished work follows by email within 48 hours.
            </p>
            <p className="desk-lead">Order reference: {order.id}</p>
            {offer.id === "trademark-name-logo" ? (
              <p className="desk-lead">Reply to the confirmation email with the logo file. The 48 hours start when that file arrives.</p>
            ) : null}
            {order.confirmation === "failed" ? (
              <p className="desk-lead" role="status">
                The confirmation email did not send. The form is saved. Write to {STUDIO_EMAIL} and include the order reference, or submit the form once more to try the email again.
              </p>
            ) : null}
            {order.confirmation === "pending_configuration" ? (
              <p className="desk-lead">
                If the confirmation is not in your inbox shortly, write to {STUDIO_EMAIL} and include the order reference. We still have the intake.
              </p>
            ) : null}
          </>
        ) : (
          <p className="desk-lead">
            We could not find that order. If you just submitted the form, reload once. Otherwise write to {STUDIO_EMAIL}.
          </p>
        )}
        <p className="desk-lead">
          <Link href="/services">Services</Link>
        </p>
      </div>
    </main>
  );
}

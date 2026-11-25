import type { Metadata } from "next";
import { headers } from "next/headers";
import { LegalDocument, LegalLink, LegalSection } from "../../../components/LegalDocument";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../../lib/native-shell";

export function generateMetadata(): Metadata {
  const inApp = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  return {
    title: "Refund Policy",
    description: inApp
      ? "Refund and cancellation policy for Closepath and the research services from Anzen Digital Media, LLC."
      : "Refund and cancellation policy for Closepath and the research services from Anzen Digital Media, LLC.",
  };
}

export default function RefundsPage() {
  const inApp = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  return (
    <LegalDocument title="Refund Policy">
      <LegalSection id="scope" title="Subscription">
        {inApp ? (
          <p>
            Closepath is a subscription from Anzen Digital Media, LLC, started on the website, not in this
            app. It is not a lifetime license. The <LegalLink href="/terms">Terms of Service</LegalLink>{" "}
            govern the subscription. This page describes cancellation and refunds.
          </p>
        ) : (
          <p>
            Closepath is a subscription of $9.99 USD per month from Anzen Digital Media, LLC, after a 7-day
            trial. It is not a lifetime license. The <LegalLink href="/terms">Terms of Service</LegalLink>{" "}
            govern the subscription. This page describes the trial, cancellation, and refunds.
          </p>
        )}
      </LegalSection>

      <LegalSection id="trial" title="Trial">
        {inApp ? (
          <p>
            A card is collected on the website, not in this app. Cancel from a web browser before a charge
            if you do not want that charge. A period with no charge has no monthly charge to refund.
          </p>
        ) : (
          <p>
            Checkout starts a 7-day trial. A card is required at signup. Stripe does not charge the card during
            the trial. Unless the subscription is canceled before the trial ends, Stripe charges $9.99 USD per
            month starting when the trial ends. Cancellation in the customer portal takes effect at the end of
            the current period. During the trial, that period is the trial, and canceling before it ends means
            the monthly price is not charged. A trial with no charge has no monthly charge to refund.
          </p>
        )}
      </LegalSection>

      <LegalSection id="cancel" title="Cancellation">
        {inApp ? (
          <p>
            Cancel from a web browser, or by emailing{" "}
            <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
            Include the email on the subscription. Cancellation stops subsequent monthly charges and does not,
            by itself, refund a charge already paid. This app does not open a payment page.
          </p>
        ) : (
          <p>
            While you are signed in, Billing in the book opens Stripe’s customer portal. Cancellation through
            that portal takes effect at the end of the current period. During a trial, that period is the
            trial. You may also cancel by emailing{" "}
            <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
            Include the email on the subscription. Cancellation stops subsequent monthly charges and does not,
            by itself, refund a charge already paid.
          </p>
        )}
        <p>
          Access continues through the end of the period covered by the current charge, and then ends, unless
          that charge is refunded. During a trial, before any charge, access continues through the end of the
          trial. If a charge is refunded, access for that period ends. When access ends,
          Anzen may close the account and delete the book. A spreadsheet export is available while the
          account is open.
        </p>
      </LegalSection>

      <LegalSection id="ask" title="Refund requests">
        <p>
          Email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Include the email you used at checkout so we can find the charge.
        </p>
      </LegalSection>

      <LegalSection id="window" title="Latest monthly charge">
        <p>
          You may request a refund of the latest monthly charge within 14 days of that charge. We will refund
          {inApp ? " that monthly charge." : " that $9.99 charge."}
        </p>
      </LegalSection>

      <LegalSection id="access" title="Access not delivered">
        <p>
          If Anzen does not deliver access to the book, Anzen will refund that monthly charge. That refund is
          not limited to the 14-day period above.
        </p>
      </LegalSection>

      <LegalSection id="chargebacks" title="Chargebacks">
        <p>
          Please email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          before opening a chargeback with a bank or card issuer, so the charge can be reviewed.
        </p>
      </LegalSection>

      <LegalSection id="research" title="Research services">
        <p>
          The Trademark Search Report, the Grant Match Report, the Nevada Annual Compliance Kit, and the
          Certificate of Existence ordering guide are one-time fees. Email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          within 48 hours of payment if Anzen has not emailed the deliverable, and Anzen will refund that
          Anzen fee. If the deliverable has been emailed, the fee is for work already done and is not
          refunded, except where the law requires a refund.
        </p>
        <p>
          If Anzen does not email the deliverable within 48 hours after a complete intake, you may request a
          full refund of the Anzen fee. That request is not limited to 48 hours from payment. For a name and
          logo search, the 48 hours start when the logo file arrives.
        </p>
        <p>
          Fees you pay to a government agency are not Anzen fees. Nevada annual list fees, state business
          license fees, and certificate fees are paid by you to the State of Nevada. Anzen does not refund
          those amounts.
        </p>
      </LegalSection>

      <LegalSection id="watch" title="Trademark Watch">
        <p>
          Trademark Watch is $19 USD a month. Cancel anytime by emailing{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          from the address on the subscription. Cancellation stops future monthly charges. It does not, by
          itself, refund the current month.
        </p>
        <p>
          If Anzen does not email the first watch confirmation within 48 hours of a complete intake, you may
          request a refund of that first charge. A later month that was charged, and for which Anzen did not
          run the watch, can be refunded if you email within 14 days of that charge.
        </p>
      </LegalSection>

      <LegalSection id="limit" title="Scope">
        <p>
          A Closepath refund under this policy is limited to the monthly charge described in the Closepath
          sections. A research-service refund is limited to the Anzen fee described in the research sections.
          Cancellation stops subsequent charges. This policy does not refund earlier months, does not refund
          money you paid to a government agency, and does not add a warranty or a service-level commitment.
        </p>
        <nav aria-label="Related policies" className="flex flex-wrap gap-x-4 gap-y-2">
          <LegalLink href="/terms">Terms of Service</LegalLink>
          <LegalLink href="/privacy">Privacy Policy</LegalLink>
        </nav>
      </LegalSection>
    </LegalDocument>
  );
}

import type { Metadata } from "next";
import { LegalDocument, LegalLink, LegalSection } from "../../../components/LegalDocument";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund and cancellation policy for the $9.99 per month Closepath subscription from Anzen Digital Media, LLC.",
};

export default function RefundsPage() {
  return (
    <LegalDocument title="Refund Policy">
      <LegalSection id="scope" title="Subscription">
        <p>
          Closepath is a subscription of $9.99 USD per month from Anzen Digital Media, LLC. It is not a
          lifetime license. The <LegalLink href="/terms">Terms of Service</LegalLink> govern the
          subscription. This page describes cancellation and refunds.
        </p>
      </LegalSection>

      <LegalSection id="cancel" title="Cancellation">
        <p>
          While you are signed in, Billing in the book opens Stripe’s customer portal. Cancellation through
          that portal takes effect at the end of the current period. You may also cancel by emailing{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Include the email on the subscription. Cancellation stops subsequent monthly charges and does not,
          by itself, refund a charge already paid.
        </p>
        <p>
          Access continues through the end of the period covered by the current charge, and then ends, unless
          that charge is refunded. If a charge is refunded, access for that period ends. When access ends,
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
          that $9.99 charge.
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

      <LegalSection id="limit" title="Scope">
        <p>
          A refund under this policy is limited to the monthly charge described above. Cancellation stops
          subsequent charges. This policy does not refund earlier months and does not add a warranty or a
          service-level commitment.
        </p>
        <p>
          <LegalLink href="/terms">Terms of Service</LegalLink>
          {" · "}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

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
      <LegalSection id="scope" title="What this covers">
        <p>
          Closepath is $9.99 USD per month from Anzen Digital Media, LLC. It is a subscription. It is not a
          lifetime license. The <LegalLink href="/terms">Terms of Service</LegalLink> describe the
          subscription. This page is how cancellation and a refund work.
        </p>
      </LegalSection>

      <LegalSection id="cancel" title="Cancel anytime">
        <p>
          While you are signed in, Billing in the book opens Stripe’s customer portal. A cancellation there
          takes effect at the end of the current period. You may also cancel by emailing{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Include the email on the subscription so we can find it. Cancellation stops future monthly charges.
          It does not, by itself, refund a charge, and it does not leave the book open indefinitely.
        </p>
        <p>
          Access lasts through the end of the period the current charge covers, and then ends, unless we
          refund that charge. If we refund a charge, access for that period ends. When access ends, we may close
          the account and delete the book. Export a spreadsheet first if you want a copy of what you typed.
        </p>
      </LegalSection>

      <LegalSection id="ask" title="How to ask for a refund">
        <p>
          Email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Include the email you used at checkout so we can find the charge.
        </p>
      </LegalSection>

      <LegalSection id="window" title="Within 14 days">
        <p>
          You may request a refund of the latest monthly charge within 14 days of that charge. We will refund
          that $9.99 charge.
        </p>
      </LegalSection>

      <LegalSection id="access" title="If we do not deliver access">
        <p>
          If we failed to deliver access to the book, we will refund that monthly charge. That refund does
          not depend on the 14-day window.
        </p>
      </LegalSection>

      <LegalSection id="chargebacks" title="Chargebacks">
        <p>
          If you are considering a chargeback with your bank or card issuer, email us first so we can help.
        </p>
      </LegalSection>

      <LegalSection id="limit" title="What this policy does not add">
        <p>
          A refund under this policy is of the monthly charge described above. Cancellation stops the next
          charges. This policy does not refund every earlier month, and it does not add a warranty, an uptime
          commitment, or any obligation beyond the refunds described here.
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

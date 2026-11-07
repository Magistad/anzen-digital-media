import type { Metadata } from "next";
import { LegalDocument, LegalLink, LegalSection } from "../../../components/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Anzen Digital Media, LLC and Closepath. What we collect, what we do not collect, and who handles it.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy">
      <LegalSection id="who" title="Who we are">
        <p>
          Anzen Digital Media, LLC (“Anzen,” “we”) is a Nevada limited liability company. We operate{" "}
          <LegalLink href="https://anzendigitalmedia.com">anzendigitalmedia.com</LegalLink> and Closepath from
          the United States. This policy says what we collect, why, and who else handles it. The{" "}
          <LegalLink href="/terms">Terms of Service</LegalLink> govern use of the product.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="What we collect">
        <p>
          Account. When you set a password after checkout, we store the email address for the account (the
          checkout email when Stripe provides it), a salted scrypt hash of the password, the Stripe Checkout
          session id that unlocked access, the time the account was created and last updated, a count of
          failed sign-ins, and a lock time if sign-in is locked.
        </p>
        <p>
          Book. The book is stored with that email. It holds what you type: property addresses, listing or
          buyer side, status, and prices; client and lead names, phone numbers, email addresses, and source;
          dates, including inspection, appraisal, loan contingency, and close; showings; offers; commission
          rates, splits, figures, status, and notes; and any other notes you enter. You choose what to enter.
          We do not require a client’s information to create the account.
        </p>
        <p>
          Payment. Closepath is $9.99 USD per month. Checkout and later charges run through Stripe, on the
          Anzen Digital Media Stripe account. The card form is on Stripe’s domain, checkout.stripe.com.
          Stripe collects the payment details and the email you enter there, and Stripe keeps the card number
          and the billing record for the subscription. We do not receive or store the card number. We keep
          the checkout session id, and the email associated with that session, so we can confirm that the
          subscription charge succeeded and open the book. Stripe sends the receipt. You may cancel anytime
          from Billing in the book, which opens Stripe’s customer portal, or by emailing us, as the{" "}
          <LegalLink href="/terms">Terms of Service</LegalLink> describe. Cancellation takes effect at the
          end of the current period. It is not a lifetime grant of access.
        </p>
        <p>
          Email you send us. If you write to{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>, we
          receive the address you write from and the message. We use it to respond, including for a refund, a
          deletion request, or a dispute. There is no chat widget, form, or helpdesk on the site.
        </p>
      </LegalSection>

      <LegalSection id="do-not" title="What we do not collect">
        <p>
          We do not collect or store card numbers. Closepath does not accept uploaded contracts or other
          documents, and we do not keep a document vault. We do not run analytics, advertising pixels, or
          other non-essential tracking. We do not sell personal information.
        </p>
      </LegalSection>

      <LegalSection id="why" title="Why we use it">
        <p>
          We use this information to provide the book, authenticate you, fulfill the purchase, answer email,
          and protect the service against fraud and abuse. An account locks for fifteen minutes after eight
          failed sign-ins. We do not use book contents to advertise to your clients, and we do not train a
          model on them.
        </p>
      </LegalSection>

      <LegalSection id="share" title="Who else handles it">
        <p>
          Stripe is the payment processor. Stripe handles the card payment, the checkout email, the customer
          record, and the receipt. Stripe’s own policy is at{" "}
          <LegalLink href="https://stripe.com/privacy">stripe.com/privacy</LegalLink>. Checkout is on Stripe’s
          domain, not on a card form we host.
        </p>
        <p>
          Netlify is the hosting and storage processor. The site is hosted on Netlify. Buyer accounts and book
          data are stored in Netlify Blobs, in a store named closepath, keyed to the buyer’s email. Netlify’s
          own policy is at{" "}
          <LegalLink href="https://www.netlify.com/privacy/">netlify.com/privacy</LegalLink>.
        </p>
        <p>
          Stripe and Netlify process that data for us so Closepath can run. We can access the book as the
          operator. Netlify can access stored data as the host. We do not sell personal information. We do
          not share it with advertisers or data brokers, and we do not authorize Stripe or Netlify to sell
          it. We may disclose information if the law requires it, or to respond to valid legal process.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies">
        <p>
          We set one cookie, named closepath_session, after you set a password or sign in. It keeps you
          signed in. It is HTTP-only, so page scripts cannot read it. It is SameSite=Lax. It is marked Secure
          when the site is served over HTTPS. The value is HMAC-signed so we can tell we issued it, and it
          expires after 60 days. Signing out clears it. We use it only to recognize the account.
        </p>
        <p>
          We do not set analytics cookies, advertising cookies, or any other non-essential cookie. Stripe may
          set its own cookies on Stripe’s checkout domain while you pay. Those cookies are Stripe’s. This
          site does not use a cookie-consent banner because the only cookie we set is the session cookie
          above.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <p>
          We keep the account and the book while the account exists. Email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink> and
          ask us to delete the account and the book. Use the email on the account so we can find it. We will
          delete the account record and the book data stored under that email. We do not keep a copy of the
          book after that, except where the law requires us to retain a record.
        </p>
        <p>
          Stripe may keep payment records under Stripe’s own rules and under financial law. Deleting the
          Closepath account does not erase Stripe’s payment record.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          Data is transmitted over HTTPS. Passwords are stored as salted scrypt hashes, not as plaintext.
          Book contents are ordinary application data on our host. They are not end-to-end encrypted. Anzen
          can read them as the operator. Netlify can read them as the processor that stores them.
        </p>
        <p>
          We do not offer two-factor authentication. We do not provide SOC 2 or ISO 27001 reports. You are
          responsible for the password you choose and for the devices you use to open the book. The{" "}
          <LegalLink href="/terms">Terms of Service</LegalLink> state that responsibility.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          Closepath is not directed at children. The terms require users to be 18 or older. We do not
          knowingly collect personal information from children under 13. If you believe a child under 13 has
          given us personal information, email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink> and
          we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may update this policy by posting a new version on this page and changing the date above. The
          updated page is the notice.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Anzen Digital Media, LLC
          <br />
          Nevada, United States
          <br />
          <LegalLink href="https://anzendigitalmedia.com">https://anzendigitalmedia.com</LegalLink>
          <br />
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>
        </p>
        <p>
          <LegalLink href="/terms">Terms of Service</LegalLink>
          {" · "}
          <LegalLink href="/refunds">Refund Policy</LegalLink>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

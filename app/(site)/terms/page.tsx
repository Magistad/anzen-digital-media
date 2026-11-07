import type { Metadata } from "next";
import { LegalDocument, LegalLink, LegalSection } from "../../../components/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Closepath, the $9.99 per month listing-to-close book from Anzen Digital Media, LLC.",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service">
      <LegalSection id="agreement" title="Agreement">
        <p>
          These terms are a contract between you and Anzen Digital Media, LLC, a Nevada limited liability
          company (“Anzen,” “we,” “us”). They cover{" "}
          <LegalLink href="https://anzendigitalmedia.com">anzendigitalmedia.com</LegalLink> and Closepath.
        </p>
        <p>
          Completing Stripe Checkout for Closepath is your acceptance of these terms and the{" "}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>. Using the site, or setting a password and
          opening the book, is also acceptance. If you do not agree, do not buy Closepath and do not use it.
        </p>
      </LegalSection>

      <LegalSection id="product" title="The product">
        <p>
          Closepath is a listing-to-close book. After you pay, you open it in the browser. You type addresses,
          client details, dates, showings, offers, and commission notes. You may export a spreadsheet from
          inside the book. The export is optional. Excel is not the product.
        </p>
        <p>
          Closepath is $9.99 USD per month, billed through Stripe Checkout on our site, on the Anzen Digital
          Media Stripe account. You may cancel anytime. It is not a lifetime license. We do not store your
          card number. Stripe does.
        </p>
      </LegalSection>

      <LegalSection id="not" title="What Closepath is not">
        <p>
          Closepath is a productivity tool only. It is not a brokerage, a transaction coordinator, an MLS, a
          legal service, an accounting service, or a compliance system. We do not give legal, tax, real-estate,
          or fiduciary advice. We are not your broker, your lawyer, your accountant, or your transaction
          coordinator.
        </p>
        <p>
          Closepath is not a document vault, an e-sign product, or an AI contract reader. It does not take
          uploaded contracts, and it does not connect to an MLS. It is not the system of record for your
          forms, disclosures, or client files outside the notes you choose to type.
        </p>
      </LegalSection>

      <LegalSection id="responsibility" title="Your responsibility">
        <p>
          You are solely responsible for your own critical dates, deadlines, contracts, disclosures, client
          communications, and compliance with the brokerage, MLS, and legal rules that apply to you. Closepath
          does not watch a transaction for you.
        </p>
        <p>
          Closepath does not send email, text, or push alerts when a deadline is coming. The morning list is a
          view of dates you stored. It appears when you open the book. We do not warrant that dates,
          calculations (including commission math), in-book lists, exports, or stored data are complete,
          accurate, or timely.
        </p>
        <p>
          Commission figures are arithmetic on the numbers you type: sale price, rate, and split. They are not
          an accounting opinion and not a statement of what you will be paid. If a deadline is missed, that
          loss is your risk, not ours.
        </p>
      </LegalSection>

      <LegalSection id="license" title="The subscription">
        <p>
          The $9.99 monthly fee is a personal, non-exclusive, non-transferable, revocable license for one
          agent: the person who subscribes. It covers that agent’s own work, through one account, only while
          the subscription is active. It is a license to use the hosted book, not a sale of the software, and
          not a lifetime right to the book. Closepath and the site remain Anzen’s property.
        </p>
        <p>
          You may not transfer the subscription, share the account as a seat for someone else, copy the
          service, resell Closepath, rent it, sublicense it, or offer it as a hosted service for other
          people. A spreadsheet export is a copy of your entries. It is not a separate product and not a
          right to keep using Closepath after the subscription ends.
        </p>
        <p>
          You may cancel anytime. While you are signed in, Billing in the book opens Stripe’s customer
          portal, and a cancellation there takes effect at the end of the current period. You may also cancel
          by emailing{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Cancellation stops future monthly charges. It does not, by itself, refund a charge. Access lasts
          through the end of the period that charge covers, and then ends, unless we refund the charge under the{" "}
          <LegalLink href="/refunds">Refund Policy</LegalLink>. If we refund a charge, access for that period
          ends. When access ends, we may close the account and delete the book.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="Eligibility">
        <p>
          You must be at least 18 years old and able to enter a contract. Closepath is a tool for a working
          agent, not a product for children.
        </p>
      </LegalSection>

      <LegalSection id="account" title="Your account">
        <p>
          After checkout, you set a password for the email on the subscription. You return with that email and
          password while the subscription is active. We store the password only as a salted scrypt hash. We
          do not store the password itself.
        </p>
        <p>
          Account security is your responsibility. That includes the password you choose, the devices you use,
          and anyone you allow to see or use the account. Do not share the account. Activity under your email
          is yours, including activity by a person you gave the password to.
        </p>
        <p>
          Tell us at <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          if you believe someone else is using the account without permission. We may lock sign-in after
          repeated failures. The lock is currently eight failed sign-ins, for fifteen minutes.
        </p>
      </LegalSection>

      <LegalSection id="use" title="Acceptable use">
        <p>
          Do not abuse the service. Do not attempt to access an account, book, or system you are not allowed
          to use. Do not probe, disrupt, or circumvent access to Closepath. Do not use the book to violate the
          law, including duties you owe a client, a brokerage, or an MLS.
        </p>
        <p>
          You are responsible for having the right to store other people’s information in the book, and for
          the accuracy of what you enter.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Your content">
        <p>
          You own the text and figures you enter. You grant Anzen a limited, non-exclusive right to host,
          store, display back to you, and include that content in an export you request, only so the book
          works for your account. We do not sell your book contents. The right ends when we delete the
          content, except where the law requires us to keep a copy.
        </p>
        <p>
          You represent that you have the right to enter the client names, contact details, and other
          third-party information you put in the book, and that storing it does not violate a duty you owe to
          a client, a brokerage, an MLS, or anyone else.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="Indemnity">
        <p>
          You will indemnify Anzen Digital Media, LLC and its members, employees, and agents against
          third-party claims, losses, and reasonable attorneys’ fees arising from the information you enter,
          from your lack of a right to enter it, or from your use of the book. That includes a claim about a
          missed deadline, a client or brokerage dispute, or a failure of brokerage, MLS, disclosure, or other
          legal compliance.
        </p>
        <p>
          Indemnify means you cover those amounts, not that Anzen can never be sued. We will tell you about a
          claim we know about. You will not settle it in a way that admits fault by Anzen or puts a duty on
          Anzen unless we agree in writing. We may participate with our own counsel. This indemnity does not
          apply to a claim caused by our fraud or willful misconduct.
        </p>
      </LegalSection>

      <LegalSection id="service" title="The service">
        <p>
          Closepath is provided as-is and as-available. There is no uptime target and no service-level
          agreement. We may update, change, interrupt, or discontinue the service, including by changing the
          hosted book during a subscription. You are not entitled to a frozen copy of the product.
        </p>
        <p>
          We may suspend or terminate an account that abuses the service, breaks these terms, or creates a
          security risk. We may delete the book when the account ends. If you want a spreadsheet, export it
          while the account is open. We do not keep a copy of the book for you after deletion.
        </p>
        <p>
          Stopping or changing the service does not, by itself, create a refund beyond the{" "}
          <LegalLink href="/refunds">Refund Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection id="warranties" title="Disclaimers">
        <p>
          To the maximum extent allowed by law, Anzen disclaims all warranties, whether express, implied, or
          statutory, including merchantability, fitness for a particular purpose, title, and non-infringement,
          and any warranty that Closepath will be uninterrupted, timely, secure, or error-free.
        </p>
        <p>
          We do not warrant that a date will be caught, that a figure is right, that a deal will close, or
          that a commission will be paid. The product pages describe Closepath. They are not a guarantee, and
          they do not add a warranty or a service level. Some states do not allow certain disclaimers, so
          this section applies to the maximum extent those states allow.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of liability">
        <p>
          To the maximum extent allowed by law, Anzen and its members, employees, and agents will not be
          liable for lost commissions, missed closings, lost deals, lost profits, loss of goodwill, loss or
          corruption of data, or any indirect, incidental, special, consequential, or punitive damages,
          however caused, even if we knew they were possible.
        </p>
        <p>
          To the maximum extent allowed by law, our total liability for direct damages arising out of
          Closepath or these terms will not exceed the monthly charges you paid Anzen for Closepath in the
          twelve months before the claim. The cap is aggregate for all claims, on every theory, including
          contract, warranty, tort, and statute, and it still applies if a refund does not make you whole.
        </p>
        <p>
          These terms do not limit liability that the law does not allow us to limit. They are not a promise
          that you cannot sue. They allocate risk for a $9.99 per month tool: you remain responsible for your
          practice, and our exposure for direct damages is capped at those twelve months of charges.
        </p>
      </LegalSection>

      <LegalSection id="refunds" title="Refunds">
        <p>
          You may cancel anytime, as the subscription section says. You may request a refund of the latest
          monthly charge within 14 days of that charge. If we failed to deliver access to the book, we will
          refund that charge. Email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          The procedure is the <LegalLink href="/refunds">Refund Policy</LegalLink>. If that policy and this
          section differ on how a refund works, the Refund Policy controls.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes">
        <p>
          We may change these terms by posting the update on this page and changing the date above. The
          updated page is the notice. The new terms apply to your use of Closepath after that date. If you do
          not agree, stop using Closepath and email us. The terms posted when a monthly charge is made govern
          that charge, including the price and the refund rules then in effect.
        </p>
      </LegalSection>

      <LegalSection id="disputes" title="Disputes">
        <p>
          Email <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          before you file a lawsuit. Describe the dispute and what you want us to do. We will try to resolve
          it directly. If it is still unresolved 30 days after we receive that email, either of us may file
          an individual claim in court. You do not have to wait if a filing deadline would otherwise expire
          during those 30 days.
        </p>
        <p>
          These terms are governed by the laws of the State of Nevada, United States, without using
          conflict-of-law rules to apply another state’s law. The state and federal courts located in Nevada
          are the exclusive venue for disputes arising out of these terms or Closepath, and you and Anzen
          consent to personal jurisdiction there. Either of us may still bring an individual claim in small
          claims court if the claim qualifies. There is no arbitration clause in these terms.
        </p>
        <p>
          You and Anzen agree to bring claims against the other only as an individual, not as a plaintiff or
          class member in any class, collective, or representative action. A court may not consolidate more
          than one person’s claims unless we both agree. This waiver does not stop an individual claim, and
          it does not stop a government agency from bringing its own case. If a court will not enforce the
          waiver for a particular claim, that claim may proceed in court, and the rest of these terms still
          apply.
        </p>
      </LegalSection>

      <LegalSection id="other" title="Other terms">
        <p>
          These terms, the Privacy Policy, and the Refund Policy are the entire agreement about Closepath.
          They replace earlier statements about the product. If the Privacy Policy differs from these terms
          on personal information, the Privacy Policy controls that point.
        </p>
        <p>
          If a court holds a provision unenforceable, the rest remains in effect. Our failure to enforce a
          term once is not a waiver. Your responsibility for your practice, the indemnity, the disclaimers,
          the liability cap, and the dispute terms survive the end of the subscription.
        </p>
        <p>
          We may assign these terms if we transfer the business. You may not assign your account or the
          subscription.
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
          <LegalLink href="/privacy">Privacy Policy</LegalLink>
          {" · "}
          <LegalLink href="/refunds">Refund Policy</LegalLink>
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

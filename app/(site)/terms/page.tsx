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
      <LegalSection id="agreement" title="1. Agreement">
        <p>
          These Terms of Service are between you and Anzen Digital Media, LLC, a Nevada limited liability
          company (“Anzen”). They govern access to and use of{" "}
          <LegalLink href="https://anzendigitalmedia.com">anzendigitalmedia.com</LegalLink> and Closepath (the
          “Service”).
        </p>
        <p>
          By completing Stripe Checkout, creating an account, or using the Service, you agree to these terms
          and the <LegalLink href="/privacy">Privacy Policy</LegalLink>. If you do not agree, do not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. The Service">
        <p>
          Closepath is a hosted listing-to-close book. A user may enter addresses, client details, dates,
          showings, offers, and commission notes, and may export a spreadsheet from the Service. The export
          is optional. Excel is not the Service.
        </p>
        <p>
          The Service is a productivity tool. It is not a brokerage, transaction coordinator, multiple listing
          service, legal service, tax service, accounting service, compliance system, or fiduciary service,
          and it does not provide legal, tax, real-estate, or fiduciary advice. It is not a document vault, an
          electronic-signature product, or an automated contract reader. It does not accept uploaded contracts
          and does not connect to an MLS.
        </p>
        <p>
          The user is responsible for critical dates, deadlines, contracts, disclosures, client
          communications, and compliance with applicable brokerage, MLS, and legal requirements. The Service
          does not monitor transactions and does not send email, text, or push notifications of deadlines.
          The morning list displays dates stored in the account when the Service is opened.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="3. Eligibility and account">
        <p>
          You must be at least 18 years old and able to form a contract. After checkout, you set a password
          for the email associated with the subscription and use that email and password to return while the
          subscription is active. Passwords are stored as salted scrypt hashes. Anzen does not store the
          password in plaintext.
        </p>
        <p>
          You are responsible for the confidentiality of the password, for the devices used to access the
          account, and for activity under the account, including activity by any person with whom you share
          access. The subscription is one account. It is not a transferable seat. Notify Anzen at{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink> if
          you believe the account is being used without authorization.
        </p>
        <p>
          Anzen may lock sign-in after repeated failed attempts. The current setting is eight failed
          sign-ins, followed by a lock of fifteen minutes.
        </p>
      </LegalSection>

      <LegalSection id="license" title="4. License to use the Service">
        <p>
          Subject to these terms and payment of the applicable fees, Anzen grants the subscribing agent a
          personal, non-exclusive, non-transferable, revocable license to use the hosted Service for that
          agent’s own work, through one account, while the subscription is active. The license is not a sale
          of the software and is not a lifetime license. Anzen retains all right, title, and interest in the
          Service and the site.
        </p>
        <p>
          You may not transfer, sublicense, rent, or resell the Service, share the account, copy the Service,
          or offer it as a hosted product for other people. A spreadsheet export is a copy of entries in the
          account. It is not a separate license to the Service.
        </p>
      </LegalSection>

      <LegalSection id="use" title="5. Acceptable use">
        <p>
          You will not misuse the Service, attempt to access an account, book, or system you are not
          authorized to use, or probe, disrupt, or circumvent access controls. You will not use the Service
          in violation of applicable law, including duties owed to a client, a brokerage, or an MLS.
        </p>
        <p>
          You are responsible for the accuracy of information you submit and for having the rights needed to
          store information about other people in the Service.
        </p>
      </LegalSection>

      <LegalSection id="content" title="6. Your content">
        <p>
          You retain ownership of the text and figures you submit. You grant Anzen a limited, non-exclusive
          license to host, store, display to you, and include that content in an export you request, solely
          to operate the Service for your account. Anzen does not sell that content. The license ends when
          the content is deleted, except where the law requires a copy to be kept.
        </p>
        <p>
          You represent that you have the right to submit the client names, contact details, and other
          third-party information you enter, and that storing it does not violate a duty owed to a client, a
          brokerage, an MLS, or any other person.
        </p>
      </LegalSection>

      <LegalSection id="fees" title="7. Fees and billing">
        <p>
          The fee is $9.99 USD per month, billed through Stripe Checkout on the Anzen Digital Media Stripe
          account. Anzen does not store card numbers. Stripe processes payment and sends the receipt. The
          subscription is not a lifetime license.
        </p>
        <p>
          You may cancel at any time. While you are signed in, Billing in the Service opens Stripe’s
          customer portal, and cancellation through that portal takes effect at the end of the current
          period. You may also cancel by emailing{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>.
          Cancellation stops subsequent monthly charges. It does not, by itself, refund a charge already
          paid. Access continues through the end of the period covered by the current charge unless that
          charge is refunded. If a charge is refunded, access for that period ends.
        </p>
        <p>
          Refunds are described in the <LegalLink href="/refunds">Refund Policy</LegalLink>. You may request
          a refund of the latest monthly charge within 14 days of that charge. If Anzen does not deliver
          access to the Service, Anzen will refund the charge for that period. If the Refund Policy and this
          section differ on how a refund is handled, the Refund Policy controls.
        </p>
      </LegalSection>

      <LegalSection id="term" title="8. Term and termination">
        <p>
          The subscription continues until it is cancelled or terminated. Anzen may update, change, or
          interrupt the Service, including the hosted book, and may discontinue the Service. There is no
          uptime commitment and no service-level agreement. The license is to the Service as hosted, not to a
          fixed copy of the software.
        </p>
        <p>
          Anzen may suspend or terminate an account that misuses the Service, violates these terms, or
          presents a security risk. Anzen may delete account content when access ends. An export may be made
          while the account is open. Anzen does not keep a separate copy of the book for the user after
          deletion.
        </p>
        <p>
          Discontinuing or changing the Service does not, by itself, create a refund except as stated in the{" "}
          <LegalLink href="/refunds">Refund Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="9. Disclaimers">
        <p>
          The Service is provided as is and as available. To the maximum extent permitted by law, Anzen
          disclaims all warranties, whether express, implied, or statutory, including warranties of
          merchantability, fitness for a particular purpose, title, and non-infringement, and any warranty
          that the Service will be uninterrupted, timely, secure, or error-free.
        </p>
        <p>
          Dates, calculations (including commission calculations), lists, exports, and stored data are
          provided without warranty of completeness, accuracy, or timeliness. Commission figures are
          calculated from the sale price, rate, and split entered in the Service. Descriptions on the product
          pages do not add a warranty or a service level.
        </p>
        <p>
          Some jurisdictions do not allow certain warranty disclaimers. In those jurisdictions, this section
          applies to the maximum extent permitted.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Anzen and its members, employees, and agents will not be
          liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for
          lost commissions, missed closings, lost profits, lost deals, loss of goodwill, or loss or
          corruption of data, whether arising in contract, warranty, tort, or otherwise, and whether or not
          Anzen has been advised of the possibility.
        </p>
        <p>
          To the maximum extent permitted by law, Anzen’s total liability for direct damages arising out of
          the Service or these terms will not exceed the amounts paid for the Service in the twelve months
          before the claim. The limit is aggregate and applies to all claims and theories of liability.
        </p>
        <p>
          Some jurisdictions do not allow certain limitations of liability. In those jurisdictions, Anzen’s
          liability is limited to the maximum extent permitted by law. These terms do not limit liability
          that applicable law does not permit to be limited.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="11. Indemnification">
        <p>
          You will defend and indemnify Anzen Digital Media, LLC and its members, employees, and agents
          against third-party claims, losses, and reasonable attorneys’ fees arising out of content you
          submit, your lack of rights in that content, or your use of the Service, including claims
          concerning deadlines, client or brokerage disputes, or brokerage, MLS, disclosure, or other legal
          compliance.
        </p>
        <p>
          Anzen will give notice of a claim of which it is aware. You will not settle a claim in a manner
          that imposes an obligation on Anzen or admits fault by Anzen without Anzen’s prior written consent.
          Anzen may participate in the defense with its own counsel. This section does not apply to a claim
          arising from Anzen’s fraud or willful misconduct.
        </p>
      </LegalSection>

      <LegalSection id="law" title="12. Governing law">
        <p>
          Before starting a formal proceeding, you will email{" "}
          <LegalLink href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</LegalLink>{" "}
          with a description of the dispute and the relief requested. If the matter is unresolved 30 days
          after Anzen receives that notice, either party may file an individual claim. A party need not wait
          if a filing deadline would otherwise expire.
        </p>
        <p>
          These terms are governed by the laws of the State of Nevada, United States, without regard to
          conflict-of-law rules. The state and federal courts located in Nevada are the exclusive venue for
          disputes arising out of these terms or the Service, and each party consents to personal
          jurisdiction and venue in those courts. Either party may bring an individual claim in small claims
          court if the claim qualifies.
        </p>
        <p>
          Any proceeding will be brought only in an individual capacity, and not as a plaintiff or class
          member in any purported class, collective, or representative action. A court may not consolidate
          more than one person’s claims unless both parties agree. This waiver does not limit an action
          brought by a government agency. If a court holds the waiver unenforceable for a particular claim,
          that claim may proceed, and the remainder of these terms will remain in effect.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes">
        <p>
          Anzen may revise these terms by posting an updated version on this page and changing the date
          above. The posted page is notice of the revision. Revised terms apply to use of the Service after
          the updated date. The terms in effect when a monthly charge is made apply to that charge, including
          the price and the refund terms then in effect.
        </p>
      </LegalSection>

      <LegalSection id="misc" title="14. Miscellaneous">
        <p>
          These terms, the Privacy Policy, and the Refund Policy are the entire agreement concerning the
          Service and supersede earlier statements about it. If the Privacy Policy differs from these terms
          on the handling of personal information, the Privacy Policy controls.
        </p>
        <p>
          If a provision is held unenforceable, the remaining provisions continue in effect. A failure to
          enforce a provision is not a waiver. The provisions on content, disclaimers, limitation of
          liability, indemnification, and governing law survive the end of the subscription.
        </p>
        <p>
          Anzen may assign these terms in connection with a transfer of the business. You may not assign the
          account or the subscription.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="15. Contact">
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

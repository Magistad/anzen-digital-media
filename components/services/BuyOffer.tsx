import Link from "next/link";
import type { ServiceOffer } from "../../lib/services";
import { offerPriceLabel, serviceCheckoutReady } from "../../lib/services";

export function BuyOffer({
  offer,
  unavailable,
  inApp,
}: {
  offer: ServiceOffer;
  unavailable: boolean;
  inApp: boolean;
}) {
  const ready = serviceCheckoutReady(offer);
  const price = offerPriceLabel(offer);
  const noteId = `${offer.id}-note`;

  if (inApp) {
    return (
      <div className="service-offer">
        <h2 className="service-offer-name">{offer.name}</h2>
        <p className="service-offer-note">This purchase is available in a web browser, not in the Closepath app.</p>
      </div>
    );
  }

  return (
    <div className="service-offer">
      <h2 className="service-offer-name">{offer.name}</h2>
      <p className="service-offer-price">
        {price}
        <span className="sr-only">{offer.cadence === "month" ? ", billed monthly until you cancel" : ", paid once"}</span>
      </p>
      {ready ? (
        <form action="/api/services/checkout" method="post">
          <input type="hidden" name="offer" value={offer.id} />
          <button type="submit" className="service-buy">
            {offer.button}
          </button>
        </form>
      ) : (
        <>
          <button type="button" className="service-buy" disabled aria-describedby={noteId}>
            {offer.button}
          </button>
          <p id={noteId} className="service-offer-note">
            Online checkout opens when this price is connected to Stripe. Until then, the price above is the offer.
          </p>
        </>
      )}
      {unavailable ? (
        <p className="service-offer-note" role="status">
          Checkout did not start. Write to us if it keeps happening.
        </p>
      ) : null}
      <p className="service-offer-note">
        Paying means you agree to the <Link href="/terms">Terms of Service</Link> and the <Link href="/privacy">Privacy Policy</Link>. See{" "}
        <Link href="/refunds">Refunds</Link>.
      </p>
    </div>
  );
}

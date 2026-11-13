import Link from "next/link";
import { CLOSEPATH_TRIAL_BUTTON } from "../lib/closepath";
import { CLOSEPATH_PROMO_ERROR } from "../lib/closepath-promo";

const buttonClass =
  "inline-flex items-center border border-paper/30 bg-transparent px-5 py-3 text-[15px] tracking-[-0.015em] text-paper";

const legalLinkClass = "text-paper/80 transition-colors duration-300 hover:text-paper";

function PurchaseAgreement() {
  return (
    <p className="mt-4 max-w-md text-sm leading-snug text-paper/60">
      Purchasing Closepath means you agree to the{" "}
      <Link href="/terms" className={legalLinkClass}>
        Terms of Service
      </Link>{" "}
      and the{" "}
      <Link href="/privacy" className={legalLinkClass}>
        Privacy Policy
      </Link>
      . See{" "}
      <Link href="/refunds" className={legalLinkClass}>
        Refunds
      </Link>
      .
    </p>
  );
}

export function BuyClosepath({
  noteId,
  enabled,
  unavailable = false,
  codeError = false,
}: {
  noteId: string;
  enabled: boolean;
  unavailable?: boolean;
  codeError?: boolean;
}) {
  if (!enabled) {
    return (
      <div>
        <button
          type="button"
          disabled
          aria-describedby={noteId}
          className={`${buttonClass} cursor-not-allowed opacity-100`}
        >
          {CLOSEPATH_TRIAL_BUTTON}
        </button>
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60">
          Checkout coming soon.
        </p>
        <PurchaseAgreement />
      </div>
    );
  }

  const promoId = `${noteId}-promo`;
  const promoHintId = `${noteId}-promo-hint`;
  const promoErrorId = `${noteId}-promo-error`;

  return (
    <div>
      <form action="/api/checkout" method="post" className="max-w-xs">
        <label htmlFor={promoId} className="block">
          <span className="text-sm text-paper/60">Promo code</span>
          <input
            id={promoId}
            name="promo"
            type="text"
            maxLength={64}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Optional"
            aria-invalid={codeError ? true : undefined}
            aria-describedby={codeError ? promoErrorId : promoHintId}
            className="mt-2 w-full border-0 border-b border-paper/25 bg-transparent py-2 text-[15px] tracking-[-0.015em] text-paper placeholder:text-paper/35"
          />
        </label>
        <p id={promoHintId} className="mt-2 text-sm leading-snug text-paper/50">
          Optional. A code that covers the full price goes here, so checkout does not ask for a card.
        </p>
        <button
          type="submit"
          className={`${buttonClass} mt-4 cursor-pointer transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink`}
        >
          {CLOSEPATH_TRIAL_BUTTON}
        </button>
      </form>
      {codeError ? (
        <p id={promoErrorId} className="mt-4 max-w-xs text-sm text-paper/60" role="alert">
          {CLOSEPATH_PROMO_ERROR}
        </p>
      ) : unavailable ? (
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60" role="status">
          Checkout is unavailable right now.
        </p>
      ) : null}
      <PurchaseAgreement />
    </div>
  );
}

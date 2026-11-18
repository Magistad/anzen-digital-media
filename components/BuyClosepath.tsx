import Link from "next/link";
import { FocusField } from "./FocusField";
import { CLOSEPATH_TRIAL_BUTTON } from "../lib/closepath";
import { CLOSEPATH_PROMO_ERROR } from "../lib/closepath-promo";

const quietButtonClass =
  "inline-flex min-h-11 items-center border border-paper/30 bg-transparent px-5 py-3 text-[15px] tracking-[-0.015em] text-paper";

function PurchaseAgreement() {
  return (
    <p className="mt-4 max-w-md text-sm leading-snug text-paper/75">
      Purchasing Closepath means you agree to the{" "}
      <Link href="/terms" className="text-link">
        Terms of Service
      </Link>{" "}
      and the{" "}
      <Link href="/privacy" className="text-link">
        Privacy Policy
      </Link>
      . See{" "}
      <Link href="/refunds" className="text-link">
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
          className={`${quietButtonClass} cursor-not-allowed`}
        >
          {CLOSEPATH_TRIAL_BUTTON}
        </button>
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/75">
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
      <FocusField id={promoId} when={codeError} />
      <form action="/api/checkout" method="post" className="max-w-xs">
        <label htmlFor={promoId} className="block">
          <span className="text-sm text-paper/75">Promo code</span>
          <input
            id={promoId}
            name="promo"
            type="text"
            maxLength={64}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={codeError ? true : undefined}
            aria-describedby={codeError ? `${promoErrorId} ${promoHintId}` : promoHintId}
            className="line-input mt-2 w-full border-0 border-b border-paper/40 bg-transparent py-2 text-base tracking-[-0.015em] text-paper"
          />
        </label>
        {codeError ? (
          <p id={promoErrorId} className="mt-2 max-w-xs text-sm text-[#f0c9bc]" role="alert">
            {CLOSEPATH_PROMO_ERROR}
          </p>
        ) : null}
        <p id={promoHintId} className="mt-2 text-sm leading-snug text-paper/75">
          Optional. A code that covers the full price goes here, so checkout does not ask for a card.
        </p>
        <button type="submit" className="trial-button">
          {CLOSEPATH_TRIAL_BUTTON}
        </button>
      </form>
      {unavailable ? (
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/75" role="status">
          Checkout is unavailable right now.
        </p>
      ) : null}
      <PurchaseAgreement />
    </div>
  );
}

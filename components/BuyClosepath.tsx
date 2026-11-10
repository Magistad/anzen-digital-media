import Link from "next/link";
import { CLOSEPATH_TRIAL_BUTTON } from "../lib/closepath";

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
}: {
  noteId: string;
  enabled: boolean;
  unavailable?: boolean;
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

  return (
    <div>
      <form action="/api/checkout" method="post">
        <button
          type="submit"
          className={`${buttonClass} cursor-pointer transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink`}
        >
          {CLOSEPATH_TRIAL_BUTTON}
        </button>
      </form>
      {unavailable ? (
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60" role="status">
          Checkout is unavailable right now.
        </p>
      ) : null}
      <PurchaseAgreement />
    </div>
  );
}

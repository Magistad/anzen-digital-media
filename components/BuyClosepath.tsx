/**
 * Stripe is not configured for this repo. The button states the real
 * $59 offer and stays inactive until a checkout session exists.
 */
export function BuyClosepath({ noteId }: { noteId: string }) {
  return (
    <div>
      <button
        type="button"
        disabled
        aria-describedby={noteId}
        className="inline-flex cursor-not-allowed items-center border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper opacity-100"
      >
        Buy Closepath
      </button>
      <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60">
        Checkout coming soon.
      </p>
    </div>
  );
}

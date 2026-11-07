const buttonClass =
  "inline-flex items-center border border-paper/30 bg-transparent px-5 py-3 text-[15px] tracking-[-0.015em] text-paper";

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
          Subscribe
        </button>
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60">
          Checkout coming soon.
        </p>
      </div>
    );
  }

  return (
    <form action="/api/checkout" method="post">
      <button
        type="submit"
        className={`${buttonClass} cursor-pointer transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink`}
      >
        Subscribe
      </button>
      {unavailable ? (
        <p id={noteId} className="mt-4 max-w-xs text-sm text-paper/60" role="status">
          Checkout is unavailable right now.
        </p>
      ) : null}
    </form>
  );
}

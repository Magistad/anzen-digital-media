import type { Metadata } from "next";
import Link from "next/link";
import { closepathDownloadAccess } from "../../../../lib/closepath-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Closepath download",
  robots: { index: false, follow: false },
};

const linkClass =
  "inline-flex items-center border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClosepathSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string | string[] };
}) {
  const access = await closepathDownloadAccess(one(searchParams.session_id));
  const sessionId = one(searchParams.session_id);

  return (
    <main id="content" className="flex min-h-[100svh] flex-col justify-end pb-20 pt-28 md:pb-28">
      <div className="frame">
        <p className="text-[15px] tracking-[-0.02em] text-paper/60">Closepath</p>
        {access.state === "paid" && sessionId ? (
          <>
            <h1 className="mt-6 max-w-[12ch] text-[clamp(2.85rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              Your download is ready.
            </h1>
            <p className="mt-8 max-w-[36rem] text-lg leading-snug tracking-[-0.02em] text-paper/75">
              Payment of $59 is confirmed. The workbook tracks leads, showings,
              offers, critical dates, and commissions.
            </p>
            <a
              href={`/api/closepath/download?session_id=${encodeURIComponent(sessionId)}`}
              className={`${linkClass} mt-10`}
              referrerPolicy="no-referrer"
            >
              Download Closepath
            </a>
            <p className="mt-4 max-w-md text-sm text-paper/60">
              {access.email
                ? `Stripe sends the receipt to ${access.email}.`
                : "Stripe sends the receipt to the email you entered at checkout."}
            </p>
          </>
        ) : access.state === "unpaid" ? (
          <>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(2.85rem,8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              This payment is not marked paid yet.
            </h1>
            <p className="mt-8 max-w-[34rem] text-lg leading-snug tracking-[-0.02em] text-paper/75">
              If you just checked out, refresh in a moment. The download opens
              once Stripe marks the payment paid.
            </p>
            <Link href="/products/closepath" className={`${linkClass} mt-10`}>
              Back to Closepath
            </Link>
          </>
        ) : access.state === "unconfigured" ? (
          <>
            <h1 className="mt-6 max-w-[12ch] text-[clamp(2.85rem,8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              Checkout coming soon.
            </h1>
            <Link href="/products/closepath" className={`${linkClass} mt-10`}>
              Back to Closepath
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(2.85rem,8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              We couldn’t confirm this payment.
            </h1>
            <Link href="/products/closepath" className={`${linkClass} mt-10`}>
              Back to Closepath
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

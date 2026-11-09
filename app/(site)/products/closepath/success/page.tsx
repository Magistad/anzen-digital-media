import type { Metadata } from "next";
import Link from "next/link";
import { QuestionsLine } from "../../../../../components/QuestionsLine";
import { CLOSEPATH_OFFER } from "../../../../../lib/closepath";
import { closepathDownloadAccess } from "../../../../../lib/closepath-access";
import { findAccount } from "../../../../../lib/closepath-account";
import { sessionSecret } from "../../../../../lib/closepath-auth";
import { normalizeEmail } from "../../../../../lib/closepath-model";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open Closepath",
  robots: { index: false, follow: false },
};

const linkClass =
  "inline-flex items-center border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

const fieldClass =
  "mt-2 w-full border-0 border-b border-paper/25 bg-transparent py-3 text-lg tracking-[-0.02em] text-paper";

const errors: Record<string, string> = {
  short: "Use at least 8 characters.",
  mismatch: "Those passwords don’t match.",
  email: "Use the email from checkout.",
  exists: "This email already has a password. Sign in, or set a new one below.",
  unpaid: "This subscription isn’t active yet.",
  failed: "Closepath couldn’t open the book. Try again.",
  unconfigured: "Closepath can’t open accounts right now.",
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function PasswordForm({
  sessionId,
  email,
  locked,
  reset,
}: {
  sessionId: string;
  email: string;
  locked: boolean;
  reset?: boolean;
}) {
  return (
    <form action="/api/closepath/open" method="post" className="mt-8 max-w-md">
      <input type="hidden" name="session_id" value={sessionId} />
      {reset ? <input type="hidden" name="reset" value="1" /> : null}
      <label className="block">
        <span className="text-[15px] text-paper/60">Email</span>
        <input
          name="email"
          type="email"
          required
          readOnly={locked}
          defaultValue={email}
          autoComplete="email"
          className={fieldClass}
        />
      </label>
      <label className="mt-6 block">
        <span className="text-[15px] text-paper/60">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
      <label className="mt-6 block">
        <span className="text-[15px] text-paper/60">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
      <button type="submit" className={`${linkClass} mt-8`}>
        {reset ? "Set a new password" : "Open Closepath"}
      </button>
    </form>
  );
}

export default async function ClosepathSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string | string[]; error?: string | string[] };
}) {
  const sessionId = one(searchParams.session_id);
  const error = one(searchParams.error);
  const access = await closepathDownloadAccess(sessionId);
  const checkoutEmail = access.state === "paid" && access.email ? normalizeEmail(access.email) ?? "" : "";

  let existing = false;
  let storeReady = true;
  if (access.state === "paid" && checkoutEmail) {
    try {
      existing = Boolean(await findAccount(checkoutEmail));
    } catch {
      storeReady = false;
    }
  }
  const ready = Boolean(sessionSecret()) && storeReady;
  const already = existing || error === "exists";
  const message = error ? errors[error] : undefined;

  return (
    <main id="content" className="flex min-h-[100svh] flex-col justify-end pb-20 pt-28 md:pb-28">
      <div className="frame">
        <p className="text-[15px] tracking-[-0.02em] text-paper/60">Closepath</p>
        {access.state === "paid" && sessionId ? (
          already ? (
            <>
              <h1 className="mt-6 max-w-[12ch] text-[clamp(2.85rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                Sign in to your book.
              </h1>
              <p className="mt-8 max-w-[36rem] text-lg leading-snug tracking-[-0.02em] text-paper/75">
                This email already has a Closepath password. Your files are where you left them.
              </p>
              {message ? (
                <p className="mt-4 max-w-md text-sm text-paper/70" role="alert">
                  {message}
                </p>
              ) : null}
              <Link href="/closepath/sign-in" className={`${linkClass} mt-8`}>
                Sign in
              </Link>
              <h2 className="mt-12 text-[15px] text-paper/60">Forgot it?</h2>
              <p className="mt-3 max-w-md text-[15px] leading-snug text-paper/70">
                {access.plan === "monthly"
                  ? "Set a new password with this subscription. The files stay."
                  : "Set a new password. The files stay."}
              </p>
              {ready ? (
                <PasswordForm sessionId={sessionId} email={checkoutEmail} locked={Boolean(checkoutEmail)} reset />
              ) : (
                <p className="mt-6 text-[15px] text-paper/70">Closepath can’t open accounts right now.</p>
              )}
              <p className="mt-6 max-w-md text-sm text-paper/60">
                {checkoutEmail
                  ? `Stripe sends the receipt to ${checkoutEmail}.`
                  : "Stripe sends the receipt to the email you entered at checkout."}
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-6 max-w-[12ch] text-[clamp(2.85rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                Open Closepath.
              </h1>
              <p className="mt-8 max-w-[36rem] text-lg leading-snug tracking-[-0.02em] text-paper/75">
                {access.plan === "monthly"
                  ? `Your subscription is confirmed. ${access.trial ? CLOSEPATH_OFFER : "$9.99 a month, cancel anytime."} Set a password. The dates, the offers, and the commission stay with this email when you open Closepath on another phone.`
                  : "Payment is confirmed. Set a password. The dates, the offers, and the commission stay with this email when you open Closepath on another phone."}
              </p>
              {message ? (
                <p className="mt-4 max-w-md text-sm text-paper/70" role="alert">
                  {message}
                </p>
              ) : null}
              {ready ? (
                <PasswordForm sessionId={sessionId} email={checkoutEmail} locked={Boolean(checkoutEmail)} />
              ) : (
                <p className="mt-8 text-[15px] text-paper/70">Closepath can’t open accounts right now.</p>
              )}
              <p className="mt-6 max-w-md text-sm text-paper/60">
                {checkoutEmail
                  ? `Stripe sends the receipt to ${checkoutEmail}.`
                  : "Stripe sends the receipt to the email you entered at checkout."}
              </p>
            </>
          )
        ) : access.state === "unpaid" ? (
          <>
            <h1 className="mt-6 max-w-[14ch] text-[clamp(2.85rem,8vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              This subscription isn’t active yet.
            </h1>
            <p className="mt-8 max-w-[34rem] text-lg leading-snug tracking-[-0.02em] text-paper/75">
              If you just checked out, refresh in a moment. Closepath opens when the subscription is active, including during the trial.
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
              We couldn’t confirm this subscription.
            </h1>
            <Link href="/products/closepath" className={`${linkClass} mt-10`}>
              Back to Closepath
            </Link>
          </>
        )}
        <QuestionsLine className="mt-10" />
      </div>
    </main>
  );
}

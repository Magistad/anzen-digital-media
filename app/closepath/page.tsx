import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { ClosepathApp } from "../../components/closepath/ClosepathApp";
import { CLOSEPATH_TRIAL_BUTTON } from "../../lib/closepath";
import { accountAccess } from "../../lib/closepath-access";
import { loadWorkspace } from "../../lib/closepath-account";
import { readSession, SESSION_COOKIE } from "../../lib/closepath-auth";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../lib/native-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Closepath",
  robots: { index: false, follow: false },
};

const linkClass =
  "inline-flex items-center border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function ClosedBook({
  title,
  detail,
  canManageBilling,
  billingNote,
  inApp = false,
}: {
  title: string;
  detail: string;
  canManageBilling: boolean;
  billingNote?: string;
  inApp?: boolean;
}) {
  return (
    <main id="content" className="pb-16 pt-28">
      <div className="frame">
        <p className="text-[15px] text-paper/60">Closepath</p>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          {title}
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-snug text-paper/70">{detail}</p>
        {billingNote ? (
          <p className="mt-4 max-w-md text-sm text-paper/70" role="status">
            {billingNote}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          {!inApp && canManageBilling ? (
            <form action="/api/closepath/billing" method="post">
              <button type="submit" className={linkClass}>
                Manage subscription
              </button>
            </form>
          ) : null}
          {inApp ? null : (
            <Link href="/products/closepath" className={linkClass}>
              {CLOSEPATH_TRIAL_BUTTON}
            </Link>
          )}
          <form action="/api/closepath/sign-out" method="post">
            <button type="submit" className={linkClass}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default async function ClosepathPage({
  searchParams,
}: {
  searchParams?: { billing?: string | string[] };
}) {
  const session = readSession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) redirect("/closepath/sign-in");

  const billingNote =
    one(searchParams?.billing) === "unavailable" ? "Subscription management is unavailable right now." : undefined;
  const inApp = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));

  const access = await accountAccess(session.email, true);
  if (access.state === "ended") {
    const canManageBilling = Boolean(access.customerId);
    return (
      <ClosedBook
        title="This subscription isn’t active."
        detail={
          inApp
            ? "This app doesn’t sell or renew a subscription. Use a web browser for the subscription, then sign in here. The files stay with this email."
            : canManageBilling
              ? "The book stays closed. Manage the subscription to update the card or cancel. The files stay with this email."
              : "The book stays closed. The files stay with this email."
        }
        canManageBilling={canManageBilling}
        billingNote={billingNote}
        inApp={inApp}
      />
    );
  }
  if (access.state !== "open") {
    return (
      <ClosedBook
        title="The book can’t be opened right now."
        detail="Closepath can’t confirm this subscription. Wait a moment and reload."
        canManageBilling={Boolean(access.customerId)}
        billingNote={billingNote}
        inApp={inApp}
      />
    );
  }

  try {
    const workspace = await loadWorkspace(session.email);
    return (
      <Suspense>
        <ClosepathApp
          initial={workspace}
          email={session.email}
          billingNote={billingNote}
          canManageBilling={Boolean(access.customerId) && !inApp}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Closepath book failed to open", error instanceof Error ? error.message : "unknown");
    return (
      <main id="content" className="pb-16 pt-28">
        <div className="frame">
          <p className="text-[15px] text-paper/60">Closepath</p>
          <h1 className="mt-4 max-w-[16ch] text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            The book can’t be opened right now.
          </h1>
        </div>
      </main>
    );
  }
}

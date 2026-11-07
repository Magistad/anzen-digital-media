import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSession, SESSION_COOKIE } from "../../../lib/closepath-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const linkClass =
  "inline-flex items-center border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

const fieldClass =
  "mt-2 w-full border-0 border-b border-paper/25 bg-transparent py-3 text-lg tracking-[-0.02em] text-paper";

const errors: Record<string, string> = {
  invalid: "Email or password is wrong.",
  locked: "Too many attempts. Wait fifteen minutes.",
  inactive: "This subscription isn’t active. The book stays closed.",
  billing: "Closepath can’t confirm this subscription right now.",
  unconfigured: "Closepath can’t open accounts right now.",
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string | string[] };
}) {
  const session = readSession(cookies().get(SESSION_COOKIE)?.value);
  if (session) redirect("/closepath");
  const message = errors[one(searchParams?.error) ?? ""];

  return (
    <main id="content" className="flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-12 pt-24 sm:pb-20 sm:pt-28 md:pb-28">
      <div className="frame min-w-0">
        <p className="text-[15px] tracking-[-0.02em] text-paper/60">Closepath</p>
        <h1 className="mt-4 max-w-full text-[2.35rem] font-semibold leading-[0.92] tracking-[-0.045em] sm:mt-6 sm:max-w-[12ch] sm:text-[clamp(2.85rem,8vw,7rem)] sm:leading-[0.86] sm:tracking-[-0.055em]">
          Open your book.
        </h1>
        <p className="mt-5 max-w-[34rem] text-base leading-snug tracking-[-0.02em] text-paper/75 sm:mt-8 sm:text-lg">
          The email and password you set after checkout.
        </p>
        {message ? (
          <p className="mt-4 max-w-md text-sm text-paper/70" role="alert">
            {message}
          </p>
        ) : null}
        <form action="/api/closepath/sign-in" method="post" className="mt-6 max-w-md sm:mt-8">
          <label className="block">
            <span className="text-[15px] text-paper/60">Email</span>
            <input name="email" type="email" required autoComplete="email" className={fieldClass} />
          </label>
          <label className="mt-4 block sm:mt-6">
            <span className="text-[15px] text-paper/60">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={fieldClass}
            />
          </label>
          <button type="submit" className={`${linkClass} mt-6 min-h-11 sm:mt-8`}>
            Sign in
          </button>
        </form>
        <p className="mt-5 max-w-md text-sm leading-snug text-paper/60 sm:mt-6">
          Subscribed and never set a password? Use the page Stripe sent you back to after checkout.
          Questions go to{" "}
          <a
            href="mailto:contact@anzendigitalmedia.com"
            className="text-paper/80 hover:text-paper"
          >
            contact@anzendigitalmedia.com
          </a>
          .{" "}
          <Link href="/products/closepath" className="text-paper/80 hover:text-paper">
            Back to Closepath
          </Link>
        </p>
      </div>
    </main>
  );
}

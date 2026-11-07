import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClosepathApp } from "../../components/closepath/ClosepathApp";
import { loadWorkspace } from "../../lib/closepath-account";
import { readSession, SESSION_COOKIE } from "../../lib/closepath-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Closepath",
  robots: { index: false, follow: false },
};

export default async function ClosepathPage() {
  const session = readSession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) redirect("/closepath/sign-in");

  try {
    const workspace = await loadWorkspace(session.email);
    return (
      <Suspense>
        <ClosepathApp initial={workspace} email={session.email} />
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

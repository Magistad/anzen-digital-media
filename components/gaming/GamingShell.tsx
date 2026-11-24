import type { ReactNode } from "react";
import Link from "next/link";

export function GamingShell({ children }: { children: ReactNode }) {
  return (
    <main id="content" className="gaming-shell">
      {children}
    </main>
  );
}

export function GamingKicker({ href = "/gaming", label = "Gaming" }: { href?: string; label?: string }) {
  return (
    <p className="gaming-kicker">
      <Link href={href}>{label}</Link>
    </p>
  );
}

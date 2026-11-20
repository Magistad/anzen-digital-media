"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass = "inline-flex min-h-11 items-center transition-colors duration-150 hover:text-signal";

export function SiteFooter() {
  const path = usePathname();
  if (path === "/" || path === "/projects" || path === "/contact") return null;

  return (
    <footer className="border-t border-signal/30 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 font-sans text-sm tracking-normal text-paper/90 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p translate="no">Anzen Digital Media LLC</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/refunds" className={linkClass}>
            Refunds
          </Link>
        </nav>
      </div>
    </footer>
  );
}

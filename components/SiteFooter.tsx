"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDIO_EMAIL } from "../lib/studio";

const linkClass = "transition-colors duration-150 hover:text-signal";

export function SiteFooter() {
  const path = usePathname();
  if (path === "/" || path === "/projects" || path === "/contact") return null;

  return (
    <footer className="border-t border-signal/30 px-5 py-4 font-display text-[11px] uppercase tracking-[0.18em] text-paper/70 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Anzen Digital Media LLC</p>
        <a className={linkClass} href={`mailto:${STUDIO_EMAIL}`}>
          {STUDIO_EMAIL}
        </a>
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

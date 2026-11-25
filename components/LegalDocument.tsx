import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date("2026-11-25T12:00:00Z"));

const proseLinkClass =
  "text-paper underline decoration-signal/50 underline-offset-[3px] transition-[color,text-decoration-color] duration-150 hover:text-signal hover:decoration-signal";

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={proseLinkClass}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={proseLinkClass}>
      {children}
    </a>
  );
}

export function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="content" className="pb-16 pt-[calc(7rem+env(safe-area-inset-top))] md:pb-24">
      <article className="frame">
        <p className="text-[15px] tracking-[-0.02em] text-paper/75">
          <span translate="no">Anzen Digital Media, LLC</span>
        </p>
        <h1 className="mt-6 max-w-[10em] text-[clamp(2.6rem,6.4vw,5.25rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
          {title}
        </h1>
        <p className="mt-6 text-[15px] tracking-[-0.015em] text-paper/75">Effective {LEGAL_UPDATED}</p>
        <div className="legal-copy mt-12 max-w-[65ch] border-t border-signal/25">{children}</div>
      </article>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-b border-signal/20 py-7 md:py-8">
      <h2 id={id} className="text-base font-medium tracking-[-0.02em] text-paper">
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-[15px] leading-relaxed tracking-[-0.01em] text-paper/85 md:text-base [overflow-wrap:anywhere]">
        {children}
      </div>
    </section>
  );
}

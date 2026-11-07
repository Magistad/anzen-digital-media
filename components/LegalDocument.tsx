import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "November 6, 2026";

const proseLinkClass =
  "text-paper underline decoration-paper/40 underline-offset-[3px] transition-colors duration-300 hover:decoration-paper";

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
    <main id="content" className="pb-16 pt-28 md:pb-24">
      <article className="frame">
        <p className="text-[15px] tracking-[-0.02em] text-paper/60">Anzen Digital Media, LLC</p>
        <h1 className="mt-6 max-w-[10em] text-[clamp(2.6rem,6.4vw,5.25rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
          {title}
        </h1>
        <p className="mt-6 text-[15px] tracking-[-0.015em] text-paper/55">Effective {LEGAL_UPDATED}</p>
        <div className="mt-12 max-w-[40rem] border-t border-paper/15">{children}</div>
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
    <section aria-labelledby={id} className="border-b border-paper/15 py-6 md:py-7">
      <h2 id={id} className="text-[15px] tracking-[-0.02em] text-paper/60">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-snug tracking-[-0.015em] text-paper/80 md:text-base">
        {children}
      </div>
    </section>
  );
}

import Link from "next/link";

export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div aria-hidden className="absolute inset-0 bg-ink" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-full h-12 bg-gradient-to-b from-ink to-transparent"
      />
      <nav
        aria-label="Primary"
        className="frame pointer-events-auto relative flex flex-wrap items-baseline gap-x-3 gap-y-1 py-5 text-[15px] tracking-[-0.02em] md:py-6"
      >
        <Link href="/" className="text-paper">
          Anzen
        </Link>
        <span className="text-paper/35" aria-hidden="true">
          ·
        </span>
        <Link
          href="/#products"
          className="text-paper/80 transition-colors duration-300 hover:text-paper"
        >
          Products
        </Link>
        <span className="ml-auto flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1">
          <Link
            href="/terms"
            className="hidden text-paper/55 transition-colors duration-300 hover:text-paper md:inline"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hidden text-paper/55 transition-colors duration-300 hover:text-paper md:inline"
          >
            Privacy
          </Link>
          <Link
            href="/refunds"
            className="hidden text-paper/55 transition-colors duration-300 hover:text-paper md:inline"
          >
            Refunds
          </Link>
          <Link
            href="/closepath/sign-in"
            className="text-paper/80 transition-colors duration-300 hover:text-paper"
          >
            Sign in
          </Link>
        </span>
      </nav>
    </header>
  );
}

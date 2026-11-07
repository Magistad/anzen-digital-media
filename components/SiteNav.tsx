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
        className="frame pointer-events-auto relative flex items-baseline gap-3 py-5 text-[15px] tracking-[-0.02em] md:py-6"
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
        <Link
          href="/closepath/sign-in"
          className="ml-auto text-paper/80 transition-colors duration-300 hover:text-paper"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}

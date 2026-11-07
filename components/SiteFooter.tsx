import Link from "next/link";

const linkClass = "transition-colors duration-300 hover:text-paper";

export function SiteFooter() {
  return (
    <footer className="frame py-10 text-sm tracking-[-0.01em] text-paper/60 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <p>Anzen Digital Media LLC</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
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

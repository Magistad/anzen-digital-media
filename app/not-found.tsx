import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="content"
      className="flex min-h-[100svh] flex-col justify-end pb-20 pt-28 md:pb-28"
    >
      <div className="frame">
        <p className="text-[15px] tracking-[-0.02em] text-paper/60">404</p>
        <h1 className="mt-6 text-[clamp(2.85rem,8vw,7.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
          <span className="block">This page</span>
          <span className="block">isn’t here.</span>
        </h1>
        <Link
          href="/"
          className="mt-12 inline-flex items-center gap-3 border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink"
        >
          Return home
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}

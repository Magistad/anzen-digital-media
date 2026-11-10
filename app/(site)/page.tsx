import Link from "next/link";
import { CLOSEPATH_OFFER, CLOSEPATH_TRIAL_BUTTON } from "../../lib/closepath";

export default function Page() {
  return (
    <main id="content">
      <section className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:pb-24">
        <div aria-hidden className="hero-glow breathe pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="horizon horizon-draw pointer-events-none absolute inset-x-[14%] top-[18%] md:inset-x-[18%] md:top-[22%]"
          style={{ animationDelay: "180ms" }}
        />
        <div className="frame relative">
          <h1 className="max-w-[10em] text-balance text-[clamp(2.7rem,8.8vw,8.6rem)] font-semibold leading-[0.86] tracking-[-0.058em]">
            <span className="rise block" style={{ animationDelay: "60ms" }}>
              Tools you open in the browser and use every day.
            </span>
          </h1>
          <p
            className="rise mt-8 max-w-[34rem] text-lg leading-snug tracking-[-0.02em] text-paper/75 md:mt-10 md:text-[1.35rem]"
            style={{ animationDelay: "260ms" }}
          >
            Anzen builds systems you open in the browser, for working professionals
            who get paid when the details don’t slip.
          </p>
        </div>
      </section>

      <section
        id="products"
        className="flex min-h-[100svh] scroll-mt-24 flex-col justify-center py-28"
      >
        <div className="frame view-rise">
          <Link
            href="/products/closepath"
            className="group block border border-paper/15 px-6 py-10 transition-colors duration-500 hover:border-paper/55 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
          >
            <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <h2 className="text-[clamp(3.4rem,8vw,7.25rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                Closepath
              </h2>
              <p className="text-[clamp(3.4rem,8vw,7.25rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                <span className="sr-only">{CLOSEPATH_OFFER}</span>
                <span aria-hidden className="flex items-start">
                  <span className="mt-[0.14em] text-[0.42em] font-medium">$</span>
                  9.99
                </span>
              </p>
            </div>
            <p className="mt-10 max-w-[34rem] text-lg leading-snug tracking-[-0.02em] text-paper/75 md:mt-14 md:text-[1.35rem]">
              A listing-to-close system for solo residential agents. It
              supplements the tools you already use. Leads, showings, offers,
              critical dates, and commissions, in the browser on a computer or
              phone. {CLOSEPATH_OFFER}
            </p>
            <span className="mt-12 inline-flex items-center gap-3 border border-paper/30 px-5 py-3 text-[15px] tracking-[-0.015em] text-paper transition-colors duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-ink md:mt-16">
              {CLOSEPATH_TRIAL_BUTTON}
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
              >
                →
              </span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}

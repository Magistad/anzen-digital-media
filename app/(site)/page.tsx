import Image from "next/image";
import Link from "next/link";
import { CLOSEPATH_OFFER, CLOSEPATH_TRIAL_BUTTON } from "../../lib/closepath";

export default function Page() {
  return (
    <main id="content">
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-28 md:pb-24">
        <Image
          src="/brand/hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          className="pointer-events-none object-cover object-[center_28%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-ink"
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
            className="group block overflow-hidden border border-paper/15 px-6 py-10 transition-colors duration-500 hover:border-paper/55 sm:px-10 sm:py-14 lg:px-16 lg:py-16"
          >
            <div className="relative -mx-6 -mt-10 mb-10 aspect-[2.4/1] sm:-mx-10 sm:-mt-14 sm:mb-12 md:aspect-[3.2/1] lg:-mx-16 lg:-mt-16 lg:mb-14 lg:aspect-[3.6/1]">
              <Image
                src="/closepath/feature.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 84rem, 92vw"
                className="object-cover object-[center_34%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-ink"
              />
            </div>
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

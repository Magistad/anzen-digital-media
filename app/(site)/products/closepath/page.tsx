import type { Metadata } from "next";
import Link from "next/link";
import { BuyClosepath } from "../../../../components/BuyClosepath";
import { isStripeConfigured } from "../../../../lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Closepath",
  description:
    "Closepath is a listing-to-close system for solo residential real estate agents. Open it in the browser. One purchase, no monthly fee. $59.",
};

const tracks: { title: string; detail?: string }[] = [
  { title: "Leads" },
  { title: "Showings" },
  { title: "Offers" },
  {
    title: "Critical dates",
    detail: "(inspection, appraisal, contingencies, close)",
  },
  { title: "Commissions" },
];

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function AlreadyBought() {
  return (
    <p className="mt-4 text-sm text-paper/60">
      Already bought Closepath?{" "}
      <Link href="/closepath/sign-in" className="text-paper transition-colors duration-300 hover:text-paper">
        Sign in
      </Link>
    </p>
  );
}

const shots: { src: string; alt: string; label: string; caption: string }[] = [
  {
    src: "/closepath/morning.png",
    label: "Morning",
    caption:
      "Open this before your inbox. Maple’s inspection is inside three days, so it sits under Do these today.",
    alt: "Closepath morning list. 1842 Maple Street, Elena Vasquez, inspection deadline in 3 days under Do these today. Later dates for Maple and 910 Cedar Avenue follow.",
  },
  {
    src: "/closepath/files.png",
    label: "Files",
    caption: "One row per property. The next deadline, and the net still to collect.",
    alt: "Closepath files. 1842 Maple Street, listing, Elena Vasquez, inspection in 3 days, net $6,270. 910 Cedar Avenue, buyer, Marcus Hale, inspection in 4 days, net $5,700.",
  },
  {
    src: "/closepath/file.png",
    label: "The file",
    caption:
      "Open 1842 Maple Street. Critical dates on one side. The commission, $6,270 net on this sample, on the other.",
    alt: "Closepath file for 1842 Maple Street, Elena Vasquez, listing under contract. Inspection is in 3 days. Gross commission $12,540, net $6,270.",
  },
  {
    src: "/closepath/showings.png",
    label: "Same file",
    caption:
      "The showing, the accepted offer, and Elena stay on that address. The deal does not split across lists.",
    alt: "Lower half of the 1842 Maple Street file: a completed showing, an accepted offer at $418,000, and Elena Vasquez’s phone and email.",
  },
];

function ProductFilm() {
  return (
    <section className="pt-16 md:pt-24" aria-labelledby="closepath-film">
      <div className="frame">
        <h2
          id="closepath-film"
          className="text-[15px] font-normal tracking-[-0.02em] text-paper/60"
        >
          The film
        </h2>
        <video
          className="mt-8 block aspect-video h-auto w-full max-w-full border border-paper/15 bg-ink"
          controls
          playsInline
          preload="metadata"
          poster="/closepath/ad-poster.jpg"
          width={1920}
          height={1080}
          aria-label="Closepath product film"
          title="Closepath product film"
        >
          <source src="/closepath/ad.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

function BookShot({
  src,
  alt,
  label,
  caption,
}: {
  src: string;
  alt: string;
  label: string;
  caption: string;
}) {
  return (
    <figure className="min-w-0">
      <img
        src={src}
        alt={alt}
        width={1920}
        height={998}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full max-w-full border border-paper/15"
      />
      <figcaption className="mt-2 grid gap-1 text-[15px] leading-snug tracking-[-0.015em] sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-5">
        <span className="text-paper/45">{label}</span>
        <span className="text-paper/80">{caption}</span>
      </figcaption>
    </figure>
  );
}

export default function ClosepathPage({
  searchParams,
}: {
  searchParams?: { checkout?: string | string[] };
}) {
  const checkoutReady = isStripeConfigured();
  const unavailable = one(searchParams?.checkout) === "unavailable";

  return (
    <main id="content">
      <section className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:pb-24">
        <div aria-hidden className="hero-glow breathe pointer-events-none absolute inset-0" />
        <div className="frame relative">
          <p className="rise text-[15px] tracking-[-0.02em] text-paper/60">
            Closepath
          </p>
          <h1 className="mt-6 text-[clamp(2.85rem,8.2vw,8.15rem)] font-semibold leading-[0.86] tracking-[-0.058em]">
            <span className="rise block" style={{ animationDelay: "80ms" }}>
              Never lose a deal
            </span>
            <span className="rise block" style={{ animationDelay: "160ms" }}>
              to a missed date.
            </span>
          </h1>
          <p
            className="rise mt-8 max-w-[36rem] text-lg leading-snug tracking-[-0.02em] text-paper/75 md:mt-10 md:text-[1.35rem]"
            style={{ animationDelay: "280ms" }}
          >
            Closepath is a listing-to-close system for solo residential real
            estate agents. You open it in the browser. One purchase, no monthly
            fee.
          </p>
          <div className="rise mt-10 md:mt-12" style={{ animationDelay: "380ms" }}>
            <BuyClosepath
              noteId="closepath-checkout-hero"
              enabled={checkoutReady}
              unavailable={unavailable}
            />
            <AlreadyBought />
          </div>
        </div>
      </section>

      <ProductFilm />

      <section className="py-16 md:py-20" aria-labelledby="closepath-book">
        <div className="frame">
          <h2 id="closepath-book" className="text-[15px] font-normal tracking-[-0.02em] text-paper/60">
            The book
          </h2>
          <p className="mt-5 max-w-[16em] text-[clamp(1.85rem,3.6vw,2.9rem)] font-medium leading-[1.08] tracking-[-0.04em]">
            One address. The dates first.
          </p>
          <p className="mt-4 max-w-[38rem] text-[15px] leading-snug tracking-[-0.015em] text-paper/70 md:text-base">
            This is Closepath after you pay. The rows are samples: 1842 Maple Street, Elena Vasquez, and 910 Cedar Avenue, Marcus Hale. Not real clients.
          </p>
          <div className="mt-8 space-y-8">
            {shots.map((shot) => (
              <BookShot key={shot.src} {...shot} />
            ))}
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <BookShot
              src="/closepath/sign-in.png"
              label="Return"
              caption="The password you set after checkout. The book is there on the next phone."
              alt="Closepath sign-in. The heading reads Open your book, with email and password fields."
            />
            <BookShot
              src="/closepath/leads.png"
              label="Leads"
              caption="A lead is a person who is not a file yet. Maple and Cedar already have an address, so this list is empty."
              alt="Closepath leads, empty. The page says no loose leads, because the sample deals are already files."
            />
          </div>
        </div>
      </section>

      <section className="flex min-h-[100svh] flex-col justify-center py-28">
        <div className="frame view-rise">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/60">
            What it tracks
          </h2>
          <ol className="mt-8 border-t border-paper/15 md:mt-10">
            {tracks.map((item, index) => (
              <li
                key={item.title}
                className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-4 border-b border-paper/15 py-5 sm:grid-cols-[3.25rem_1fr] sm:gap-x-8 sm:py-6 lg:py-7"
              >
                <span className="text-sm tabular-nums text-paper/40 transition-colors duration-300 group-hover:text-paper">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[clamp(2rem,4.2vw,3.7rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                    {item.title}
                  </p>
                  {item.detail ? (
                    <p className="mt-2 max-w-[36rem] text-pretty text-base tracking-[-0.015em] text-paper/70 md:text-lg">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="flex min-h-[100svh] flex-col justify-end py-28 md:py-36">
        <div className="frame view-rise">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/60">
            Who it’s for
          </h2>
          <p className="mt-8 max-w-[14em] text-[clamp(1.9rem,4.1vw,3.45rem)] font-medium leading-[1.12] tracking-[-0.035em] md:mt-12">
            A solo residential agent who is running listings, showings, and
            closings out of texts and spreadsheets, and cannot afford to miss a
            date.
          </p>
        </div>
      </section>

      <section className="flex min-h-[100svh] flex-col justify-end py-28 md:py-36">
        <div className="frame view-rise">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/60">
            What it is not
          </h2>
          <p className="mt-8 max-w-[22em] border-l border-paper/25 pl-6 text-[clamp(1.4rem,2.45vw,2.15rem)] font-medium leading-[1.32] tracking-[-0.03em] text-paper/85 md:mt-12 md:pl-8">
            Not a Follow Up Boss or BoldTrail replacement. Those are monthly
            CRMs. Closepath is the system underneath — one purchase if you
            don’t need a full CRM yet, and one place that holds the transaction
            from listing to funded.
          </p>
        </div>
      </section>

      <section className="flex min-h-[100svh] flex-col justify-end pb-28 pt-28 md:pb-32">
        <div className="frame view-rise">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/60">
            Price
          </h2>
          <p className="mt-6 text-[clamp(5.5rem,18vw,12.5rem)] font-semibold leading-[0.8] tracking-[-0.065em]">
            <span className="sr-only">$59</span>
            <span aria-hidden className="flex items-start">
              <span className="mt-[0.12em] text-[0.38em] font-medium">$</span>
              59
            </span>
          </p>
          <div className="mt-10 md:mt-14">
            <BuyClosepath
              noteId="closepath-checkout-price"
              enabled={checkoutReady}
              unavailable={unavailable}
            />
            <AlreadyBought />
          </div>
        </div>
      </section>
    </main>
  );
}

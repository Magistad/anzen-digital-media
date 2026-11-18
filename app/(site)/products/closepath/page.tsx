import type { Metadata } from "next";
import Link from "next/link";
import { BuyClosepath } from "../../../../components/BuyClosepath";
import { CLOSEPATH_AMOUNT_CENTS, CLOSEPATH_OFFER } from "../../../../lib/closepath";
import { isStripeConfigured } from "../../../../lib/env";

export const dynamic = "force-dynamic";

const description =
  `Closepath is a listing-to-close system for solo residential real estate agents. It supplements the tools you already use. Open it in the browser on a computer or phone. ${CLOSEPATH_OFFER}`;

export const metadata: Metadata = {
  title: "Closepath",
  description,
  openGraph: {
    title: "Closepath",
    description,
    url: "/products/closepath",
  },
  twitter: {
    card: "summary",
    title: "Closepath",
    description,
  },
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

const priceFigure = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(CLOSEPATH_AMOUNT_CENTS / 100);

function offerLine(text: string) {
  return text.replace(/(\d+)\s+(days)/g, "$1\u00a0$2");
}

function ProductMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
      <polygon points="30 3 70 3 97 30 97 70 70 97 30 97 3 70 3 30" fill="none" stroke="#5df2dc" strokeWidth="6" />
    </svg>
  );
}

function AlreadySubscribed() {
  return (
    <p className="mt-4 text-sm text-paper/75">
      Already have Closepath?{" "}
      <Link href="/closepath/sign-in" className="text-link">
        Sign in
      </Link>
    </p>
  );
}

function Questions({ className = "mt-2" }: { className?: string }) {
  return (
    <p className={`${className} text-sm text-paper/75`}>
      Questions go to{" "}
      <a href="mailto:contact@anzendigitalmedia.com" className="text-link">
        contact@anzendigitalmedia.com
      </a>
      .
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
    <section className="border-t border-signal/25 pt-16 md:pt-24" aria-labelledby="closepath-film">
      <div className="frame">
        <h2
          id="closepath-film"
          className="text-[15px] font-normal tracking-[-0.02em] text-paper/80"
        >
          The film
        </h2>
        <p id="closepath-film-desc" className="mt-4 max-w-[38rem] text-[15px] leading-relaxed text-paper/75">
          The sample book, from the morning list through one address and the commission. The film has sound.
        </p>
        <video
          className="mt-6 block aspect-video h-auto w-full max-w-full border border-signal/40 bg-ink"
          controls
          playsInline
          preload="metadata"
          poster="/closepath/ad-poster.jpg"
          width={1920}
          height={1080}
          aria-label="Closepath product film"
          aria-describedby="closepath-film-desc"
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
      <figure className="min-w-0 max-w-full">
      <img
        src={src}
        alt={alt}
        width={1920}
        height={998}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full max-w-full border border-signal/40"
      />
      <figcaption className="mt-2 grid gap-1 text-[15px] leading-snug tracking-[-0.015em] sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-5">
        <span className="text-paper/75">{label}</span>
        <span className="text-paper/85">{caption}</span>
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
  const checkout = one(searchParams?.checkout);
  const unavailable = checkout === "unavailable";
  const codeError = checkout === "code";

  return (
    <main id="content" className="overflow-x-clip">
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-12 pt-[calc(6.5rem+env(safe-area-inset-top))] sm:pb-16 md:pb-24">
        <div aria-hidden className="hero-glow pointer-events-none absolute inset-0" />
        <div className="frame relative min-w-0">
          <p className="flex items-center gap-3 text-[15px] tracking-[-0.02em] text-signal">
            <ProductMark />
            <span translate="no">Closepath</span>
          </p>
          <h1 className="mt-4 max-w-full text-[2.15rem] font-semibold leading-[0.92] tracking-[-0.046em] sm:mt-6 sm:text-[clamp(2.85rem,7.4vw,7.4rem)] sm:leading-[0.86] sm:tracking-[-0.058em]">
            <span className="block">Never lose a deal</span>
            <span className="block">to a missed date.</span>
          </h1>
          <div aria-hidden className="mt-6 h-px w-16 bg-signal sm:mt-8" />
          <p className="mt-5 max-w-[38rem] text-base leading-relaxed tracking-[-0.02em] text-paper/80 sm:mt-8 sm:text-lg md:text-[1.25rem]">
            Closepath is a listing-to-close system for solo residential real
            estate agents. It supplements the tools you already use. You open
            it in the browser on a computer or phone. {offerLine(CLOSEPATH_OFFER)}
          </p>
          <div className="mt-6 sm:mt-10 md:mt-12">
            <BuyClosepath
              noteId="closepath-checkout-hero"
              enabled={checkoutReady}
              unavailable={unavailable}
              codeError={codeError}
            />
            <AlreadySubscribed />
            <Questions />
          </div>
        </div>
      </section>

      <ProductFilm />

      <section className="border-t border-signal/25 py-16 md:py-24" aria-labelledby="closepath-book">
        <div className="frame">
          <h2 id="closepath-book" className="text-[15px] font-normal tracking-[-0.02em] text-paper/80">
            The book
          </h2>
          <p className="mt-5 max-w-[16em] text-[clamp(1.85rem,3.6vw,2.9rem)] font-medium leading-[1.08] tracking-[-0.04em]">
            One address. The dates first.
          </p>
          <p className="mt-4 max-w-[38rem] text-[15px] leading-relaxed tracking-[-0.015em] text-paper/80 md:text-base">
            This is Closepath after checkout. The rows are samples: 1842 Maple Street, Elena Vasquez, and 910 Cedar Avenue, Marcus Hale. Not real clients.
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
          <Questions className="mt-8" />
        </div>
      </section>

      <section className="border-t border-signal/25 py-16 md:py-24">
        <div className="frame">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/80">
            What it tracks
          </h2>
          <ul className="mt-8 border-t border-signal/30 md:mt-10">
            {tracks.map((item) => (
              <li key={item.title} className="min-w-0 border-b border-signal/25 py-5 sm:py-6">
                <p className="text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                  {item.title}
                </p>
                {item.detail ? (
                  <p className="mt-2 max-w-[36rem] text-base tracking-[-0.015em] text-paper/80 md:text-lg">
                    {item.detail}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-signal/25 py-16 md:py-24">
        <div className="frame">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/80">
            Who it’s for
          </h2>
          <p className="mt-6 max-w-[18em] text-[clamp(1.55rem,4.1vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.035em]">
            A solo residential agent who is running listings, showings, and
            closings out of texts and spreadsheets, and cannot afford to miss a
            date.
          </p>
        </div>
      </section>

      <section className="border-t border-signal/25 py-16 md:py-24">
        <div className="frame">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/80">
            What it is not
          </h2>
          <p className="mt-6 max-w-[28em] border-l border-signal/70 pl-4 text-[clamp(1.25rem,2.45vw,2.05rem)] font-medium leading-[1.35] tracking-[-0.03em] text-paper/90 sm:pl-6">
            Not a Follow Up Boss or BoldTrail replacement. Those are full
            CRMs. Closepath is the book underneath: 7&nbsp;days free, then $9.99 a
            month, cancel anytime, and one place that holds the transaction
            from listing to funded.
          </p>
        </div>
      </section>

      <section className="overflow-x-clip border-t border-signal/25 pb-16 pt-16 sm:pb-24 sm:pt-20 md:pb-28">
        <div className="frame min-w-0">
          <h2 className="text-[15px] font-normal tracking-[-0.02em] text-paper/80">
            Price
          </h2>
          <p className="product-price mt-4 max-w-full text-[clamp(4.5rem,16vw,11rem)] font-semibold leading-[0.8] tracking-[-0.065em] sm:mt-6">
            <span className="sr-only">{offerLine(CLOSEPATH_OFFER)}</span>
            <span aria-hidden className="flex items-start">
              <span className="mt-[0.12em] text-[0.38em] font-medium">$</span>
              {priceFigure}
            </span>
          </p>
          <p className="mt-4 text-lg tracking-[-0.02em] text-paper/80 md:text-xl" aria-hidden>
            {offerLine(CLOSEPATH_OFFER)}
          </p>
          <div className="mt-8 sm:mt-10 md:mt-14">
            <BuyClosepath
              noteId="closepath-checkout-price"
              enabled={checkoutReady}
              unavailable={unavailable}
              codeError={codeError}
            />
            <AlreadySubscribed />
            <Questions />
          </div>
        </div>
      </section>
    </main>
  );
}

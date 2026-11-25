import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { BuyOffer } from "../../../../components/services/BuyOffer";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../../../../lib/native-shell";
import { servicePage, SERVICE_PAGES } from "../../../../lib/service-copy";
import { offersForService, offerPriceLabel } from "../../../../lib/services";

type Params = { slug: string };

export function generateStaticParams() {
  return SERVICE_PAGES.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const page = servicePage(params.slug);
  if (!page) return { title: "Services", robots: { index: false, follow: false } };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: { title: page.title, description: page.description, url: `/services/${page.slug}` },
  };
}

export default function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: { checkout?: string | string[] };
}) {
  const page = servicePage(params.slug);
  if (!page) notFound();
  const inApp = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  const checkout = searchParams?.checkout;
  const unavailable = checkout === "unavailable" || (Array.isArray(checkout) && checkout[0] === "unavailable");
  const offers = offersForService(page.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.description,
    provider: {
      "@type": "Organization",
      name: "Anzen Digital Media LLC",
      url: "https://anzendigitalmedia.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Las Vegas",
        addressRegion: "NV",
        addressCountry: "US",
      },
    },
    areaServed: "US",
    offers: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      priceCurrency: "USD",
      price: (offer.amountCents / 100).toFixed(2),
      url: `https://anzendigitalmedia.com${offer.path}`,
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <main id="content" className="desk-shell">
      <article className="desk-frame desk-frame-wide">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <p className="desk-kicker">
          <Link href="/services">Services</Link>
        </p>
        <h1 className="desk-title">{page.title}</h1>
        <p className="desk-lead">{page.lead}</p>
        <p className="service-flow">Stripe Checkout, then a short form, then a confirmation email, then the work by email within 48 hours.</p>

        <div className="service-offers">
          {offers.map((offer) => (
            <BuyOffer key={offer.id} offer={offer} unavailable={unavailable} inApp={inApp} />
          ))}
        </div>

        <section className="desk-block" aria-labelledby="receives">
          <h2 id="receives" className="desk-heading">
            {page.receivesTitle}
          </h2>
          <ul className="desk-list">
            {page.receives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="desk-block service-limits" aria-labelledby="limits">
          <h2 id="limits" className="desk-heading">
            {page.limitsTitle}
          </h2>
          <ul className="desk-list">
            {page.limits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="desk-block" aria-labelledby="steps">
          <h2 id="steps" className="desk-heading">
            How it works
          </h2>
          <ol className="desk-list">
            {page.steps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="desk-lead">
            Prices on this page: {offers.map((offer) => `${offer.name}, ${offerPriceLabel(offer)}`).join(". ")}.
          </p>
        </section>

        <section className="desk-block" aria-labelledby="service-faq">
          <h2 id="service-faq" className="desk-heading">
            Questions
          </h2>
          <dl className="faq-list">
            {page.faqs.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="desk-lead">
            More answers are on the <Link href="/faq">questions page</Link>. Support:{" "}
            <a href="mailto:contact@anzendigitalmedia.com">contact@anzendigitalmedia.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}

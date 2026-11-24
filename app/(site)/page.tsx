import type { Metadata } from "next";
import Link from "next/link";
import { DeskCard } from "../../components/desk/DeskCard";
import { latestDeskPost } from "../../lib/desk-posts";
import { HUB, SERVICE_PAGES } from "../../lib/service-copy";
import { offersForService, offerPriceLabel } from "../../lib/services";
import { listPosts } from "../../lib/gaming/posts";
import { VERTICALS } from "../../lib/verticals";

const description = HUB.description;

export const metadata: Metadata = {
  title: { absolute: HUB.title },
  description,
  openGraph: { title: HUB.title, description, url: "https://anzendigitalmedia.com" },
  twitter: { card: "summary", title: HUB.title, description },
};

function latestGaming() {
  const post = listPosts({ includeDrafts: false })[0];
  if (!post) return null;
  return { title: post.title, detail: post.excerpt, href: post.href };
}

export default function Page() {
  const latest = {
    gaming: latestGaming(),
    business: latestDeskPost("business"),
    tech: latestDeskPost("tech"),
    money: latestDeskPost("money"),
  };

  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame desk-frame-wide">
        <p className="desk-kicker">{HUB.eyebrow}</p>
        <h1 className="desk-title">{HUB.title}</h1>
        <p className="desk-lead">{HUB.lead}</p>

        <section className="desk-block" aria-labelledby="home-latest">
          <h2 id="home-latest" className="desk-heading">
            {HUB.latestHeading}
          </h2>
          <p className="desk-lead">{HUB.latestLead}</p>
          <ul className="desk-grid desk-grid-4">
            {VERTICALS.map((vertical) => {
              const piece = latest[vertical.id];
              const title = piece && "title" in piece ? piece.title : vertical.name;
              const detail = piece && "detail" in piece ? piece.detail : piece?.excerpt ?? vertical.summary;
              const href = piece?.href ?? vertical.href;
              return (
                <li key={vertical.id}>
                  <DeskCard href={href} kicker={vertical.name} title={title} detail={detail || vertical.summary} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="desk-block" aria-labelledby="home-services">
          <h2 id="home-services" className="desk-heading">
            {HUB.servicesHeading}
          </h2>
          <p className="desk-lead">{HUB.servicesLead}</p>
          <ul className="desk-grid desk-grid-3">
            {SERVICE_PAGES.map((page) => {
              const offers = offersForService(page.slug);
              const prices = offers.map((offer) => offerPriceLabel(offer)).join(" · ");
              return (
                <li key={page.slug}>
                  <DeskCard href={`/services/${page.slug}`} kicker={prices} title={page.title} detail={page.lead} />
                </li>
              );
            })}
          </ul>
          <p className="desk-lead">
            <Link href="/services">All services</Link>
            {" · "}
            <Link href="/faq">Questions</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

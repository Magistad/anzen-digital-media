import type { Metadata } from "next";
import Link from "next/link";
import { DeskCard } from "../../../components/desk/DeskCard";
import { SERVICE_INDEX, SERVICE_PAGES } from "../../../lib/service-copy";
import { offersForService, offerPriceLabel } from "../../../lib/services";

export const metadata: Metadata = {
  title: SERVICE_INDEX.title,
  description: SERVICE_INDEX.description,
  openGraph: { title: SERVICE_INDEX.title, description: SERVICE_INDEX.description, url: "/services" },
};

export default function ServicesPage() {
  return (
    <main id="content" className="desk-shell">
      <div className="desk-frame desk-frame-wide">
        <p className="desk-kicker">
          <Link href="/">Anzen</Link>
        </p>
        <h1 className="desk-title">{SERVICE_INDEX.title}</h1>
        <p className="desk-lead">{SERVICE_INDEX.lead}</p>
        <ul className="desk-grid desk-grid-3">
          {SERVICE_PAGES.map((page) => (
            <li key={page.slug}>
              <DeskCard
                href={`/services/${page.slug}`}
                kicker={offersForService(page.slug).map((offer) => offerPriceLabel(offer)).join(" · ")}
                title={page.title}
                detail={page.lead}
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

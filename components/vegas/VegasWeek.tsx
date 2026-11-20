import Link from "next/link";
import { withAffiliate } from "../../lib/vegas-affiliates";
import type { OfficialLink } from "../../lib/vegas-official";
import type { ListingFeed } from "../../lib/vegas-listings";
import { VEGAS_SECTIONS, type VegasSectionSlug } from "../../lib/vegas-sections";
import { formatPacific } from "../../lib/vegas-conditions";

export function WeekNav({ current }: { current?: VegasSectionSlug }) {
  return (
    <nav className="vegas-subnav" aria-label="This week">
      <Link href="/products/vegas" aria-current={current ? undefined : "page"}>
        Hub
      </Link>
      {VEGAS_SECTIONS.map((section) => (
        <Link key={section.slug} href={section.href} aria-current={section.slug === current ? "page" : undefined}>
          {section.title}
        </Link>
      ))}
    </nav>
  );
}

export function ListingPreview({ feed, href, label }: { feed: ListingFeed; href: string; label: string }) {
  const preview = feed.items.slice(0, 3);
  return (
    <section className="vegas-preview" aria-labelledby={`preview-${label}`}>
      <h3 id={`preview-${label}`} className="vegas-h3">
        <Link href={href}>{label}</Link>
      </h3>
      {feed.pending ? <p className="vegas-prose">{feed.note}</p> : null}
      {!feed.pending && !feed.ok ? <p className="vegas-prose">{feed.note}</p> : null}
      {!feed.pending && feed.ok && preview.length === 0 ? (
        <p className="vegas-prose">Nothing listed for this week.</p>
      ) : null}
      {preview.length > 0 ? (
        <ul className="vegas-listing">
          {preview.map((item) => (
            <li key={item.id}>
              <p className="vegas-stamp">
                {item.dateLabel}. {item.timeLabel}. {item.venue}
              </p>
              <p>{item.title}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <p>
        <Link className="text-link vegas-hit" href={href}>
          Full {label.toLowerCase()} week
        </Link>
      </p>
    </section>
  );
}

export function WeekList({ feed, links }: { feed: ListingFeed; links: readonly OfficialLink[] }) {
  return (
    <>
      <p className="vegas-prose">{feed.note}</p>
      {feed.fetchedAt ? (
        <p className="vegas-stamp">
          Checked <time dateTime={feed.fetchedAt}>{formatPacific(new Date(feed.fetchedAt))}</time>
        </p>
      ) : null}
      {feed.ok && !feed.pending && feed.items.length === 0 ? (
        <p className="vegas-empty">Nothing listed for this week.</p>
      ) : null}
      {feed.items.length > 0 ? (
        <ul className="vegas-listing">
          {feed.items.map((item) => (
            <li key={item.id}>
              <p className="vegas-stamp">
                <time dateTime={item.start ?? undefined}>{item.dateLabel}</time>
                {". "}
                {item.timeLabel}. {item.venue}
                {item.status ? `. ${item.status}` : ""}
              </p>
              <h3 className="vegas-h3">{item.title}</h3>
              <a className="text-link vegas-hit" href={withAffiliate(item.href)} target="_blank" rel="noopener noreferrer" data-outbound="">
                Tickets and info
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {links.length > 0 ? (
        <ul className="vegas-sources">
          {links.map((link) => (
            <li key={link.href}>
              <a className="text-link vegas-hit" href={withAffiliate(link.href)} target="_blank" rel="noopener noreferrer" data-outbound="">
                {link.label}
              </a>
              {link.note ? <span className="vegas-included">{link.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {feed.sourceUrl ? (
        <p className="vegas-prose">
          <a className="text-link vegas-hit" href={feed.sourceUrl} target="_blank" rel="noopener noreferrer">
            {feed.sourceLabel}
          </a>
        </p>
      ) : null}
    </>
  );
}

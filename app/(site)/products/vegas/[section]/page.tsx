import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeekList, WeekNav } from "../../../../../components/vegas/VegasWeek";
import { loadVegasFeeds } from "../../../../../lib/vegas-feeds";
import { CONVENTION_LINKS, NIGHTLIFE_LINKS, SHOW_LINKS, SPORTS_LINKS, type OfficialLink } from "../../../../../lib/vegas-official";
import { VEGAS_SECTIONS, type VegasSectionSlug } from "../../../../../lib/vegas-sections";

export const dynamic = "force-dynamic";

const LINKS: Record<VegasSectionSlug, readonly OfficialLink[]> = {
  sports: SPORTS_LINKS,
  shows: SHOW_LINKS,
  nightlife: NIGHTLIFE_LINKS,
  conventions: CONVENTION_LINKS,
  events: [],
};

const LEDE: Record<VegasSectionSlug, string> = {
  sports: "Games and race weeks in Las Vegas, with official schedules beside the Ticketmaster feed.",
  shows: "Shows on the Ticketmaster feed, plus the Sphere and T-Mobile Arena calendars.",
  nightlife: "Official club calendars. Ticketmaster nightlife listings appear here when that feed is connected.",
  conventions: "Shows from the Las Vegas Convention Guide. Confirm dates with each show.",
  events: "Public events for this week, with the date and venue left as published.",
};

function sectionFrom(param: string): (typeof VEGAS_SECTIONS)[number] | undefined {
  return VEGAS_SECTIONS.find((item) => item.slug === param);
}

export function generateMetadata({ params }: { params: { section: string } }): Metadata {
  const section = sectionFrom(params.section);
  if (!section) return {};
  const description = LEDE[section.slug];
  return {
    title: `${section.title} this week`,
    description,
    openGraph: { title: `${section.title} this week`, description, url: section.href },
  };
}

export default async function VegasSectionPage({ params }: { params: { section: string } }) {
  const section = sectionFrom(params.section);
  if (!section) notFound();
  const feeds = await loadVegasFeeds();
  return (
    <main id="content" className="vegas">
      <header className="vegas-hero">
        <p className="hud-kicker vegas-kicker">
          <Link href="/products/vegas" className="text-link">
            Vegas Right Now
          </Link>
        </p>
        <h1 className="page-title vegas-title">{section.title}</h1>
        <p className="vegas-lead">{LEDE[section.slug]}</p>
      </header>
      <WeekNav current={section.slug} />
      <WeekList feed={feeds[section.slug]} links={LINKS[section.slug]} />
      <p className="vegas-foot">
        <span translate="no">Vegas Right Now</span> is an <span translate="no">Anzen Digital Media</span> project.
      </p>
    </main>
  );
}

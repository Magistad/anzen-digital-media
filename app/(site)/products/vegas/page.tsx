import type { Metadata } from "next";
import { VegasGuide } from "../../../../components/vegas/VegasGuide";
import { loadConditions } from "../../../../lib/vegas-conditions";
import { loadVegasFeeds } from "../../../../lib/vegas-feeds";

export const dynamic = "force-dynamic";

const description =
  "What Las Vegas is like this week, and what a visit really costs. Forecast, airport status, resort fees, and convention weeks, with sources and dates.";

export const metadata: Metadata = {
  title: "Vegas Right Now",
  description,
  openGraph: {
    title: "Vegas Right Now",
    description,
    url: "/products/vegas",
  },
};

function flag(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value[0] === "1";
  return value === "1";
}

export default async function VegasPage({
  searchParams,
}: {
  searchParams?: { joined?: string | string[]; asked?: string | string[]; tipped?: string | string[] };
}) {
  const [report, feeds] = await Promise.all([loadConditions(fetch), loadVegasFeeds()]);
  return (
    <VegasGuide
      report={report}
      feeds={feeds}
      joined={flag(searchParams?.joined)}
      asked={flag(searchParams?.asked)}
      tipped={flag(searchParams?.tipped)}
    />
  );
}

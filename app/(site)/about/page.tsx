import type { Metadata } from "next";
import Link from "next/link";
import { FounderPortrait } from "../../../components/FounderPortrait";
import { GamingKicker, GamingShell } from "../../../components/gaming/GamingShell";
import { CREATOR, LUNCHBRK_AVATAR, LUNCHBRK_TWITCH, PUBLISHER } from "../../../lib/identity";

const description = `${PUBLISHER.description} ${CREATOR.description}`;

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "About Anzen Digital Media", description, url: "/about", siteName: PUBLISHER.name },
  twitter: { card: "summary", title: "About Anzen Digital Media", description },
};

/**
 * Approved copy (Sage, Nov 26 2026, under the owner's standing rule). The two
 * descriptions come from lib/identity.ts so they stay word for word the same
 * as the structured data and the social bios.
 */
export default function AboutPage() {
  return (
    <GamingShell>
      <article className="gaming-frame gaming-article">
        <GamingKicker href="/" label="Studio" />
        <h1 className="page-title gaming-title">About</h1>
        <div className="about-intro">
          <FounderPortrait priority />
          <div>
            <p className="gaming-lead">{PUBLISHER.description}</p>
            <p>
              I write the <Link href="/business">Business</Link>, <Link href="/tech">Tech</Link>, and{" "}
              <Link href="/money">Money</Link> desks myself, and I do the work on every{" "}
              <Link href="/services">research service</Link> order. No call center, no ghostwriters.
            </p>
          </div>
        </div>
        <div className="about-sections">
          <section className="glass-panel content-prose" aria-labelledby="lunchbrk">
            <h2 id="lunchbrk">Who writes the gaming pieces</h2>
            <div className="lunchbrk-card">
              <figure className="lunchbrk-avatar">
                <picture>
                  <source srcSet={LUNCHBRK_AVATAR.webp} type="image/webp" />
                  <img
                    src={LUNCHBRK_AVATAR.jpg}
                    alt={LUNCHBRK_AVATAR.alt}
                    width={LUNCHBRK_AVATAR.width}
                    height={LUNCHBRK_AVATAR.height}
                    decoding="async"
                  />
                </picture>
              </figure>
              <div>
                <p>{CREATOR.description}</p>
                <p>
                  I have been playing since an Atari 2600 showed up for Christmas in 1982. I stream and post clips as{" "}
                  <span translate="no">{CREATOR.handle}</span>, and the guides here are written from my own runs.
                </p>
                <a className="cta lunchbrk-watch" href={LUNCHBRK_TWITCH} rel="me noopener">
                  Watch LUNCHBRK on Twitch
                </a>
              </div>
            </div>
          </section>

          <section className="glass-panel content-prose" aria-labelledby="how-we-check">
            <h2 id="how-we-check">How the gaming pieces are checked</h2>
            <ul>
              <li>I play the game before I write about how it plays.</li>
              <li>
                Numbers come from the studio first: official help pages, patch notes, and store announcements. Fan
                wikis fill gaps and are named when they do.
              </li>
              <li>
                Anything I have only seen happen, on my own runs or on a stream, is labeled that way and is not
                presented as an official rule.
              </li>
              <li>Every guide says which patch it was checked against. When a patch changes a fact, the guide gets a new updated date.</li>
              <li>
                Some store links pay a small commission. Pages with those links say so, and it does not change a
                rating.
              </li>
            </ul>
          </section>

          <section className="glass-panel content-prose" aria-labelledby="contact">
            <h2 id="contact">Corrections and contact</h2>
            <p>
              If something is wrong or out of date, email <a href={`mailto:${PUBLISHER.email}`}>{PUBLISHER.email}</a>{" "}
              and it gets fixed. {PUBLISHER.legalName} also builds <Link href="/products/closepath">Closepath</Link>.
            </p>
          </section>
        </div>
      </article>
    </GamingShell>
  );
}

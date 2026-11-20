import { Fragment, type ReactNode } from "react";
import {
  ATTRACTIONS,
  ATTRACTIONS_CHECKED,
  attractionHref,
} from "../../lib/vegas-attractions";
import { COMMUNITY_CHECKED, COMMUNITY_POSTS, hasCommunityPosts } from "../../lib/vegas-community";
import {
  AIRPORT_HOME_URL,
  AIRPORT_WAIT_URL,
  FAA_HOME_URL,
  NWS_OFFICE_URL,
  NWS_ZONE_URL,
  type ConditionsReport,
  formatPacific,
} from "../../lib/vegas-conditions";
import {
  CONVENTION_CALENDAR,
  CONVENTION_MODULE_CHECKED,
  CONVENTION_WEEKS,
  formatWeekOf,
} from "../../lib/vegas-conventions";
import {
  FEE_MODULE_CHECKED,
  FEE_TRACKERS,
  PRIMARY_GAMING_CORRIDOR_RATE,
  RESORT_FEES,
  TAX_RATE_SOURCE,
  ZERO_RESORT_FEES,
  formatCheckedDate,
  formatUsd,
} from "../../lib/vegas-fees";
import { QUESTIONS_CHECKED, VISITOR_QUESTIONS } from "../../lib/vegas-questions";
import { AskForm, TipForm, WaitlistForm } from "./VegasForms";
import { TrackEvents } from "./TrackEvents";

function Octagon() {
  return (
    <svg className="vegas-mark" width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="30 3 70 3 97 30 97 70 70 97 30 97 3 70 3 30" fill="none" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}

function Outbound({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link vegas-hit" href={href} target="_blank" rel="noopener noreferrer" data-outbound="">
      {children}
    </a>
  );
}

function Stamp({ iso, label }: { iso: string; label: string }) {
  return (
    <p className="vegas-stamp">
      {label}{" "}
      <time dateTime={iso}>{formatCheckedDate(iso)}</time>
    </p>
  );
}

function Conditions({ report }: { report: ConditionsReport }) {
  const checked = formatPacific(new Date(report.checkedAt));
  const weatherUpdated =
    report.weather.ok && report.weather.data.updated ? formatPacific(new Date(report.weather.data.updated)) : null;
  const faaUpdated = report.faa.ok && report.faa.data.updated ? formatPacific(new Date(report.faa.data.updated)) : null;
  return (
    <section id="vegas-conditions" className="vegas-section" aria-labelledby="vegas-conditions-title">
      <h2 id="vegas-conditions-title" className="vegas-h2">
        Live Conditions
      </h2>
      <p className="vegas-stamp">
        Checked <time dateTime={report.checkedAt}>{checked}</time>
      </p>
      <div className="vegas-instrument">
        <div>
          <h3 className="vegas-h3">Las Vegas Valley</h3>
          <p className="vegas-readout">{report.weather.ok ? report.weather.data.line : report.weather.fallback}</p>
          {weatherUpdated ? (
            <p className="vegas-stamp">
              Forecast updated <time dateTime={report.weather.ok ? report.weather.data.updated ?? undefined : undefined}>{weatherUpdated}</time>
            </p>
          ) : null}
          <p className="vegas-sources">
            <Outbound href={NWS_OFFICE_URL}>National Weather Service Las Vegas</Outbound>
            <Outbound href={NWS_ZONE_URL}>Zone NVZ020</Outbound>
          </p>
        </div>
        <div>
          <h3 className="vegas-h3">Harry Reid Airport</h3>
          <p className="vegas-readout">{report.faa.ok ? report.faa.data.line : report.faa.fallback}</p>
          {faaUpdated ? (
            <p className="vegas-stamp">
              FAA updated <time dateTime={report.faa.ok ? report.faa.data.updated ?? undefined : undefined}>{faaUpdated}</time>
            </p>
          ) : null}
          <p className="vegas-prose">
            Checkpoint waits are on the airport’s site. This page does not estimate them.
          </p>
          <p className="vegas-sources">
            <Outbound href={AIRPORT_WAIT_URL}>Checkpoint waits</Outbound>
            <Outbound href={AIRPORT_HOME_URL}>Harry Reid International Airport</Outbound>
            <Outbound href={FAA_HOME_URL}>FAA status</Outbound>
          </p>
        </div>
      </div>
    </section>
  );
}

export function VegasGuide({
  report,
  joined,
  asked,
  tipped,
}: {
  report: ConditionsReport;
  joined: boolean;
  asked: boolean;
  tipped: boolean;
}) {
  const posts = hasCommunityPosts() ? COMMUNITY_POSTS : [];
  const taxPercent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    PRIMARY_GAMING_CORRIDOR_RATE * 100,
  );

  return (
    <main id="content" className="vegas">
      <TrackEvents />
      <header className="vegas-hero">
        <p className="hud-kicker vegas-kicker">
          <Octagon />
          <span>Live</span>
        </p>
        <h1 className="page-title vegas-title" translate="no">
          Vegas Right Now
        </h1>
        <p className="vegas-lead">What it is like this week, and what it really costs.</p>
        <p className="vegas-prose">Honest answers and current conditions from a Las Vegas local.</p>
      </header>

      <Conditions report={report} />

      <section id="vegas-cost" className="vegas-section" aria-labelledby="vegas-cost-title">
        <h2 id="vegas-cost-title" className="vegas-h2">
          What It Costs
        </h2>
        <Stamp iso={FEE_MODULE_CHECKED} label="Last updated" />
        <p className="vegas-prose">
          A room rate leaves out the resort fee and the tax. These {RESORT_FEES.length} hotels are a short list, not
          every property. The with-tax column adds {taxPercent}%, the Clark County primary gaming corridor rate. That
          total is math from the ordinance, not a number the hotel printed. Verify at booking. Fees change.
        </p>
        <div className="vegas-scroll">
          <table className="vegas-table">
            <caption>Verify at booking. Fees change. Last updated {formatCheckedDate(FEE_MODULE_CHECKED)}.</caption>
            <thead>
              <tr>
                <th scope="col">Hotel</th>
                <th scope="col">Pre-tax</th>
                <th scope="col">With tax</th>
                <th scope="col">Checked</th>
              </tr>
            </thead>
            <tbody>
              {RESORT_FEES.map((fee) => (
                <Fragment key={fee.id}>
                  <tr>
                    <th scope="row" id={`fee-${fee.id}`} translate="no">
                      {fee.hotel}
                    </th>
                    <td className="vegas-num">
                      <span className="vegas-cell-label">Pre-tax</span>
                      {formatUsd(fee.preTaxCents)}
                    </td>
                    <td className="vegas-num">
                      <span className="vegas-cell-label">With tax</span>
                      {fee.taxIncludedCents === null ? "Not verified" : formatUsd(fee.taxIncludedCents)}
                    </td>
                    <td className="vegas-checked">
                      <span className="vegas-cell-label">Checked</span>
                      <time dateTime={fee.checked}>{formatCheckedDate(fee.checked, "medium")}</time>
                    </td>
                  </tr>
                  <tr>
                    <td className="vegas-fee-note" colSpan={4} headers={`fee-${fee.id}`}>
                      {fee.included} <Outbound href={fee.sourceUrl}>{fee.sourceLabel}</Outbound>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vegas-prose">
          Tax rate source: <Outbound href={TAX_RATE_SOURCE.url}>{TAX_RATE_SOURCE.label}</Outbound>, checked{" "}
          <time dateTime={TAX_RATE_SOURCE.checked}>{formatCheckedDate(TAX_RATE_SOURCE.checked)}</time>.
        </p>
        <h3 className="vegas-h3">$0 Resort Fees</h3>
        {ZERO_RESORT_FEES.length === 0 ? (
          <p className="vegas-prose">
            No hotel with a $0 resort fee was confirmed on that hotel’s own site during this check.
          </p>
        ) : (
          <ul className="vegas-list">
            {ZERO_RESORT_FEES.map((hotel) => (
              <li key={hotel.id}>
                <span translate="no">{hotel.hotel}</span>
                {". "}
                <Outbound href={hotel.sourceUrl}>{hotel.sourceLabel}</Outbound>
                {", checked "}
                <time dateTime={hotel.checked}>{formatCheckedDate(hotel.checked)}</time>
              </li>
            ))}
          </ul>
        )}
        <p className="vegas-prose">
          Full lists:{" "}
          {FEE_TRACKERS.map((tracker, index) => (
            <span key={tracker.url}>
              {index > 0 ? " and " : null}
              <Outbound href={tracker.url}>{tracker.label}</Outbound>
            </span>
          ))}
          .
        </p>
      </section>

      <section id="vegas-week" className="vegas-section" aria-labelledby="vegas-week-title">
        <h2 id="vegas-week-title" className="vegas-h2">
          This Week
        </h2>
        <Stamp iso={CONVENTION_MODULE_CHECKED} label="Last updated" />
        <p className="vegas-prose">
          A busy week means fewer unsold rooms, and published hotel rates usually rise. This page does not estimate
          the increase. Crowd words come from the calendar linked below. If a week has no sourced crowd word, the
          line is left blank.
        </p>
        <ol className="vegas-weeks">
          {CONVENTION_WEEKS.map((week) => (
            <li key={week.id}>
              <h3 className="vegas-h3">{formatWeekOf(week.weekOf)}</h3>
              <p className="vegas-crowd">
                {week.crowd ? (
                  <>
                    Crowd: {week.crowd.label}.{" "}
                    <Outbound href={week.crowd.sourceUrl}>{week.crowd.sourceLabel}</Outbound>
                    {", data last updated "}
                    <time dateTime={week.crowd.checked}>{formatCheckedDate(week.crowd.checked)}</time>.
                  </>
                ) : (
                  "Crowd: not rated here."
                )}
              </p>
              {week.shows.length > 0 ? (
                <ul className="vegas-list">
                  {week.shows.map((show) => (
                    <li key={show.name}>
                      <Outbound href={show.sourceUrl}>{show.name}</Outbound>
                      {`. ${show.when}. ${show.where}.`}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="vegas-prose">{week.note}</p>
            </li>
          ))}
        </ol>
        <p className="vegas-prose">
          Full calendar: <Outbound href={CONVENTION_CALENDAR.url}>{CONVENTION_CALENDAR.label}</Outbound>.
        </p>
      </section>

      <section id="vegas-questions" className="vegas-section" aria-labelledby="vegas-questions-title">
        <h2 id="vegas-questions-title" className="vegas-h2">
          Visitor Questions
        </h2>
        <Stamp iso={QUESTIONS_CHECKED} label="Last updated" />
        <div className="vegas-questions">
          {VISITOR_QUESTIONS.map((item) => (
            <article key={item.id}>
              <h3 className="vegas-h3">{item.question}</h3>
              <p className="vegas-prose">{item.answer}</p>
              {item.sources.length > 0 ? (
                <ul className="vegas-sources">
                  {item.sources.map((source) => (
                    <li key={source.href}>
                      <Outbound href={source.href}>{source.label}</Outbound>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id="vegas-do" className="vegas-section" aria-labelledby="vegas-do-title">
        <h2 id="vegas-do-title" className="vegas-h2">
          Things to Do
        </h2>
        <Stamp iso={ATTRACTIONS_CHECKED} label="Last updated" />
        <p className="vegas-disclosure">Some links may earn us a commission at no extra cost to you.</p>
        <ul className="vegas-list">
          {ATTRACTIONS.map((item) => (
            <li key={item.id}>
              <Outbound href={attractionHref(item)}>{item.name}</Outbound>
              <span className="vegas-included">{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="vegas-community" className="vegas-section" aria-labelledby="vegas-community-title">
        <h2 id="vegas-community-title" className="vegas-h2">
          Community Answers
        </h2>
        <Stamp iso={COMMUNITY_CHECKED} label="Last updated" />
        {posts.length === 0 ? (
          <p className="vegas-empty">No community answers yet. Approved questions and tips are added here by hand. Nothing is posted automatically.</p>
        ) : (
          <ul className="vegas-list">
            {posts.map((post) => (
              <li key={post.id}>
                <h3 className="vegas-h3">{post.title}</h3>
                <p className="vegas-prose">{post.body}</p>
                <p className="vegas-stamp">
                  {post.kind === "tip" ? "Tip" : "Question"}
                  {post.area ? `, ${post.area}` : ""}
                  {post.attribution ? `, ${post.attribution}` : ""}
                  {". "}
                  <time dateTime={post.published}>{formatCheckedDate(post.published)}</time>
                </p>
              </li>
            ))}
          </ul>
        )}

        <h3 className="vegas-h3" id="ask-a-local">
          Ask a Local
        </h3>
        <p className="vegas-prose">
          The best questions are answered on this page after they are reviewed. Sending a question does not publish it.
        </p>
        <AskForm done={asked} />

        <h3 className="vegas-h3" id="share-a-tip">
          Share a Local Tip
        </h3>
        <p className="vegas-prose">Share a tip for a neighborhood. Tips are reviewed before they are posted.</p>
        <TipForm done={tipped} />
      </section>

      <section id="vegas-map" className="vegas-section" aria-labelledby="vegas-map-title">
        <h2 id="vegas-map-title" className="vegas-h2">
          A Map for Visitors
        </h2>
        <p className="vegas-prose">
          Join the list for a visitor map: walking routes, rideshare pickup spots, event and convention traffic, and
          area safety context. Safety context will be labeled with its lag, reported through a date. The records are
          calls and reports, not convictions. This is not a live incident feed.
        </p>
        <WaitlistForm done={joined} />
      </section>

      <p className="vegas-foot">
        <span translate="no">Vegas Right Now</span> is an <span translate="no">Anzen Digital Media</span> project.
      </p>
    </main>
  );
}

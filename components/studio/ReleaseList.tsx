import Link from "next/link";
import { RELEASES } from "../../lib/releases";

export function ReleaseList() {
  return (
    <section id="releases" className="hud-releases" aria-labelledby="releases-heading">
      <div id="products" className="absolute top-0" aria-hidden="true" />
      <div className="hud-releases-frame">
        <p className="hud-kicker">Field catalog</p>
        <h2 id="releases-heading" className="hud-releases-title">
          Releases
        </h2>
        <p className="hud-releases-lead">
          Small apps from the studio. Open a live one, or read what is still on the bench.
        </p>
        <ol className="hud-release-list">
          {RELEASES.map((release, index) => (
            <li key={release.slug}>
              <Link href={release.href} className="release-row">
                <span className="release-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="release-name">{release.name}</span>
                <span className={release.status === "live" ? "release-status release-status-live" : "release-status"}>
                  {release.status === "live" ? <span className="hud-live-pip" aria-hidden="true" /> : null}
                  {release.statusLabel}
                </span>
                <span className="release-summary">{release.summary}</span>
                <span className="release-action">
                  {release.action} <span aria-hidden="true">›</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

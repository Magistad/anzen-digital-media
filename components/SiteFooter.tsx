import Link from "next/link";
import { headers } from "next/headers";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../lib/native-shell";
import { STUDIO_EMAIL } from "../lib/studio";
import { CREATOR, CREATOR_PROFILES, PUBLISHER } from "../lib/identity";
import { VERTICALS } from "../lib/verticals";

export function SiteFooter() {
  const hideStore = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  return (
    <footer className="site-foot">
      <div className="site-foot-grid">
        <div>
          <p className="site-foot-name" translate="no">
            Anzen
          </p>
          <p className="site-foot-meta">Digital Media LLC · Las Vegas, Nevada</p>
          <p className="site-foot-meta">{PUBLISHER.description}</p>
          <a className="site-foot-link" href={`mailto:${STUDIO_EMAIL}`}>
            {STUDIO_EMAIL}
          </a>
        </div>
        <div>
          <p className="site-foot-label">Desks</p>
          <ul className="site-foot-list">
            {VERTICALS.map((vertical) => (
              <li key={vertical.id}>
                <Link href={vertical.href} className="site-foot-link">
                  {vertical.name}
                </Link>
              </li>
            ))}
            {hideStore ? null : (
              <li>
                <Link href="/services" className="site-foot-link">
                  Services
                </Link>
              </li>
            )}
            {hideStore ? null : (
              <li>
                <Link href="/products/closepath" className="site-foot-link">
                  Products: Closepath
                </Link>
              </li>
            )}
            <li>
              <Link href="/projects" className="site-foot-link">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/contact" className="site-foot-link">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="site-foot-label">Company</p>
          <ul className="site-foot-list">
            <li>
              <Link href="/about" className="site-foot-link">
                About
              </Link>
            </li>
            <li>
              <Link href="/faq" className="site-foot-link">
                Questions
              </Link>
            </li>
            <li>
              <Link href="/terms" className="site-foot-link">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="site-foot-link">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="site-foot-link">
                Refunds
              </Link>
            </li>
            {CREATOR_PROFILES.map((profile) => (
              <li key={profile.href}>
                <a href={profile.href} rel="me noopener" className="site-foot-link">
                  {profile.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="site-foot-meta">{CREATOR.handle}</p>
        </div>
      </div>
      <div className="site-foot-bar">
        <p>© 2026 Anzen Digital Media LLC</p>
      </div>
    </footer>
  );
}

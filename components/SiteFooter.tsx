import Link from "next/link";
import { headers } from "next/headers";
import { nativePlatformFromUserAgent, nativeShellHidesStoreBilling } from "../lib/native-shell";
import { STUDIO_EMAIL } from "../lib/studio";
import { CREATOR, CREATOR_PROFILES } from "../lib/identity";
import { VERTICALS } from "../lib/verticals";

const linkClass = "inline-flex min-h-11 items-center transition-colors duration-150 hover:text-signal";

export function SiteFooter() {
  const hideStore = nativeShellHidesStoreBilling(nativePlatformFromUserAgent(headers().get("user-agent")));
  return (
    <footer className="border-t border-signal/30 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8 font-sans text-sm tracking-normal text-paper/90 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p translate="no">Anzen Digital Media LLC</p>
          <p className="text-paper/70">Las Vegas, Nevada</p>
        </div>
        <a className={linkClass} href={`mailto:${STUDIO_EMAIL}`}>
          {STUDIO_EMAIL}
        </a>
        <nav aria-label="Products" className="flex flex-wrap gap-x-4 gap-y-1">
          {hideStore ? null : (
            <Link href="/products/closepath" className={linkClass}>
              Products: Closepath
            </Link>
          )}
          <Link href="/projects" className={linkClass}>
            Projects
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact
          </Link>
        </nav>
        <nav aria-label="Desks" className="flex flex-wrap gap-x-4 gap-y-1">
          {VERTICALS.map((vertical) => (
            <Link key={vertical.id} href={vertical.href} className={linkClass}>
              {vertical.name}
            </Link>
          ))}
          {hideStore ? null : (
            <Link href="/services" className={linkClass}>
              Services
            </Link>
          )}
        </nav>
        <nav aria-label={`${CREATOR.handle} profiles`} className="flex flex-wrap gap-x-4 gap-y-1">
          {CREATOR_PROFILES.map((profile) => (
            <a key={profile.href} href={profile.href} rel="me noopener" className={linkClass}>
              {profile.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/refunds" className={linkClass}>
            Refunds
          </Link>
          <Link href="/faq" className={linkClass}>
            Questions
          </Link>
        </nav>
      </div>
    </footer>
  );
}

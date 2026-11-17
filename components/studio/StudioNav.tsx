"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDIO_EMAIL } from "../../lib/studio";

const TABS = [
  { id: "studio", href: "/", label: "Studio" },
  { id: "projects", href: "/projects", label: "Projects" },
  { id: "contact", href: `mailto:${STUDIO_EMAIL}`, label: "Contact" },
] as const;

function activeId(path: string): string {
  if (path === "/") return "studio";
  if (path === "/projects" || path.startsWith("/products/")) return "projects";
  return "";
}

function showSignIn(path: string): boolean {
  return path.startsWith("/products/closepath") || path.startsWith("/closepath");
}

function Tabs({ active }: { active: string }) {
  return (
    <nav aria-label="Primary" className="hud-tabs">
      {TABS.map((tab) => {
        const on = active === tab.id;
        const className = on ? "hud-tab hud-tab-on" : "hud-tab";
        if (tab.href.startsWith("mailto:")) {
          return (
            <a key={tab.id} href={tab.href} className={className}>
              {tab.label}
            </a>
          );
        }
        return (
          <Link key={tab.id} href={tab.href} aria-current={on ? "page" : undefined} className={className}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Tools({ signIn }: { signIn: boolean }) {
  return (
    <div className="hud-tools">
      <a className="hud-mail" href={`mailto:${STUDIO_EMAIL}`}>
        {STUDIO_EMAIL}
      </a>
      {signIn ? (
        <Link href="/closepath/sign-in" className="hud-signin">
          Sign in
        </Link>
      ) : null}
    </div>
  );
}

export function StudioNav({ placement }: { placement: "hero" | "bar" }) {
  const path = usePathname() || "/";
  const active = activeId(path);
  const signIn = showSignIn(path);

  if (placement === "bar") {
    return (
      <div className="hud-nav hud-nav-bar">
        <Link href="/" className="hud-mark hud-mark-compact">
          Anzen
        </Link>
        <Tabs active={active} />
        <Tools signIn={signIn} />
      </div>
    );
  }

  return (
    <div className="hud-nav">
      <Tabs active={active} />
      <Link href="/" className="hud-mark">
        <span className="hud-mark-name">Anzen</span>
        <span className="hud-mark-sub">Digital Media</span>
      </Link>
      <Tools signIn={signIn} />
    </div>
  );
}

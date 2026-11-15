"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDIO_EMAIL } from "../../lib/studio";

const TABS = [
  { id: "studio", href: "/", label: "Studio" },
  { id: "releases", href: "/#releases", label: "Releases" },
  { id: "closepath", href: "/products/closepath", label: "Closepath" },
] as const;

function activeId(path: string): string {
  if (path === "/") return "studio";
  if (path.startsWith("/products/closepath")) return "closepath";
  if (path.startsWith("/products/")) return "releases";
  if (path.startsWith("/closepath")) return "signin";
  return "";
}

function Tabs({ active }: { active: string }) {
  return (
    <nav aria-label="Primary" className="hud-tabs">
      {TABS.map((tab) => {
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={on ? "hud-tab hud-tab-on" : "hud-tab"}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Tools() {
  return (
    <div className="hud-tools">
      <a className="hud-mail" href={`mailto:${STUDIO_EMAIL}`}>
        {STUDIO_EMAIL}
      </a>
      <Link href="/closepath/sign-in" className="hud-signin">
        Sign in
      </Link>
    </div>
  );
}

export function StudioNav({ placement }: { placement: "hero" | "bar" }) {
  const path = usePathname() || "/";
  const active = activeId(path);

  if (placement === "bar") {
    return (
      <div className="hud-nav hud-nav-bar">
        <Link href="/" className="hud-mark hud-mark-compact">
          Anzen
        </Link>
        <Tabs active={active} />
        <Tools />
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
      <Tools />
    </div>
  );
}

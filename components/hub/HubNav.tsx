"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/gaming", label: "Gaming" },
  { href: "/business", label: "Business" },
  { href: "/tech", label: "Tech" },
  { href: "/money", label: "Money" },
  { href: "/services", label: "Services" },
] as const;

function current(path: string, href: string): boolean {
  return path === href || path.startsWith(`${href}/`);
}

function NavLinks({ path, links }: { path: string; links: readonly { href: string; label: string }[] }) {
  return (
    <>
      {links.map((link) => {
        const on = current(path, link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={on ? "page" : undefined} className={on ? "hub-link hub-link-on" : "hub-link"}>
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function HubNav({ hideServices }: { hideServices: boolean }) {
  const path = usePathname() || "/";
  const links = hideServices ? LINKS.filter((link) => link.href !== "/services") : LINKS;

  return (
    <div className="hub-nav-bar">
      <Link href="/" className="hub-brand">
        <span className="hub-mark">Anzen</span>
        <span className="hub-sub">Digital Media · Las Vegas</span>
      </Link>
      <nav aria-label="Primary" className="hub-links">
        <NavLinks path={path} links={links} />
      </nav>
    </div>
  );
}

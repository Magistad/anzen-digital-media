"use client";

import { usePathname } from "next/navigation";
import { StudioNav } from "./studio/StudioNav";

export function SiteNav() {
  const path = usePathname();
  if (path === "/" || path === "/projects" || path === "/contact") return null;
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-signal/25 bg-black font-display">
      <StudioNav placement="bar" />
    </header>
  );
}

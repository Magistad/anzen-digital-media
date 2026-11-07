import type { ReactNode } from "react";

/** Marketing pages keep the site’s paper wash. The Closepath book does not. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="wash drift absolute -left-[18%] top-[-10%] h-[70vh] w-[70vw]" />
        <div className="vignette absolute inset-0" />
      </div>
      {children}
    </>
  );
}

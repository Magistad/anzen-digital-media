"use client";
import { useEffect, useState } from "react";

export default function CRTOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      if (!a.hasAttribute("data-poweroff")) return;
      if (a.target === "_blank") return;

      const href = a.getAttribute("href") || "";
      const isHash = href.startsWith("#");
      const isInternal =
        isHash || href.startsWith("/") || a.hostname === window.location.hostname;
      if (!isInternal) return;

      setShow(true);
      setTimeout(() => setShow(false), 420);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!show) return null;
  return <div className="fixed inset-0 z-[9999] pointer-events-none crt-poweroff" />;
}

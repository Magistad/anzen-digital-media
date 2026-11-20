"use client";

import { useEffect } from "react";

export function sendVegasEvent(type: "view" | "outbound" | "waitlist", target?: string) {
  const body = JSON.stringify({ type, target: target ?? "" });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/vegas/events", blob)) return;
    }
  } catch {
    // Fall through to fetch. A failed count must not block the click or the form.
  }
  void fetch("/api/vegas/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function TrackEvents() {
  useEffect(() => {
    sendVegasEvent("view", "/products/vegas");
    const onClick = (event: MouseEvent) => {
      const node = event.target instanceof Element ? event.target.closest("a[data-outbound]") : null;
      if (!(node instanceof HTMLAnchorElement)) return;
      const href = node.href;
      if (href) sendVegasEvent("outbound", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

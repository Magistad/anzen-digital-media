"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { featuredRelease } from "../../lib/releases";
import { STUDIO_EMAIL } from "../../lib/studio";
import { StudioNav } from "./StudioNav";

const OCTAGON = "30 3 70 3 97 30 97 70 70 97 30 97 3 70 3 30";

export function StudioHero() {
  const heroRef = useRef<HTMLElement>(null);
  const [grain, setGrain] = useState(true);
  const featured = featuredRelease();

  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    let open = 0.58;

    const paint = () => {
      frame = 0;
      root.style.setProperty("--px", px.toFixed(4));
      root.style.setProperty("--py", py.toFixed(4));
      root.style.setProperty("--open", open.toFixed(4));
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.58;
      px = (event.clientX - cx) / rect.width;
      py = (event.clientY - cy) / rect.height;
      const dist = Math.min(1, Math.hypot(px * 1.2, py) / 0.42);
      open = 0.18 + (1 - dist) * 0.82;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onLeave = () => {
      px = 0;
      py = 0;
      open = 0.58;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="hud-hero"
      data-grain={grain ? "on" : "off"}
      aria-label="Anzen Digital Media"
    >
      <div className="hud-grain" aria-hidden="true" />
      <div className="hud-scan" aria-hidden="true" />
      <div className="hud-sweep" aria-hidden="true" />
      <svg className="hud-frame" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <polygon className="hud-draw" points="18,6 982,6 994,18 994,982 982,994 18,994 6,982 6,18" />
        <polygon className="hud-draw hud-draw-late" points="34,16 966,16 984,34 984,966 966,984 34,984 16,966 16,34" />
      </svg>
      <span className="hud-tick hud-tick-tl" aria-hidden="true" />
      <span className="hud-tick hud-tick-tr" aria-hidden="true" />
      <span className="hud-tick hud-tick-bl" aria-hidden="true" />
      <span className="hud-tick hud-tick-br" aria-hidden="true" />

      <StudioNav placement="hero" />

      <div className="hud-stage">
        <div className="hud-copy hud-rise">
          <p className="hud-kicker">Independent studio</p>
          <h1 className="hud-title">
            <span className="block">Strange little things</span>
            <span className="block">people actually use</span>
          </h1>
        </div>

        <Link href="/#releases" className="hud-side hud-side-left">
          <span className="hud-side-kicker">Releases</span>
          <span className="hud-action">
            View <span aria-hidden="true">›</span>
          </span>
        </Link>

        <div className="hud-portal">
          <div className="hud-portal-window">
            <div className="hud-portal-core" aria-hidden="true" />
            <div className="hud-door hud-door-left" aria-hidden="true" />
            <div className="hud-door hud-door-right" aria-hidden="true" />
            <div className="hud-portal-label">
              <p className="hud-kicker">Studio</p>
              <p className="hud-portal-name">Anzen</p>
            </div>
          </div>
          <svg className="hud-portal-svg" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="hud-orbit" cx="50" cy="50" r="46" />
            <polygon className="hud-draw" points={OCTAGON} />
            <polygon className="hud-draw hud-draw-late hud-octagon-inner" points="36 14 64 14 86 36 86 64 64 86 36 86 14 64 14 36" />
          </svg>
          <span className="hud-cross hud-cross-x" aria-hidden="true" />
          <span className="hud-cross hud-cross-y" aria-hidden="true" />
        </div>

        {featured ? (
          <Link href={featured.href} className="hud-side hud-side-right">
            <span className="hud-side-kicker">{featured.name}</span>
            <span className="hud-action">
              {featured.action} <span aria-hidden="true">›</span>
            </span>
          </Link>
        ) : null}
      </div>

      <footer className="hud-foot">
        <p>Anzen Digital Media LLC</p>
        <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
        <nav aria-label="Legal" className="hud-legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
        <button
          type="button"
          className="hud-grain-toggle"
          aria-pressed={grain}
          aria-label={grain ? "Grain on" : "Grain off"}
          onClick={() => setGrain((value) => !value)}
        >
          Grain {grain ? "[On]" : "[Off]"}
        </button>
      </footer>
    </section>
  );
}

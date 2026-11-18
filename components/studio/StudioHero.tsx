"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const OCTAGON = "30 3 70 3 97 30 97 70 70 97 30 97 3 70 3 30";

export function StudioHero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [grain, setGrain] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (!video) return;
      if (reduce.matches || !motion) {
        video.pause();
        return;
      }
      video.muted = true;
      void video.play().catch(() => {
        setVideoReady(false);
      });
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, [motion, videoReady]);

  return (
    <section
      ref={heroRef}
      className="hud-hero"
      data-grain={grain ? "on" : "off"}
      data-video={videoReady ? "ready" : "missing"}
      data-motion={motion ? "on" : "off"}
    >
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-media-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/hero.webp"
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        >
          <source src="/brand/hero.mp4" type="video/mp4" />
        </video>
        <img className="hero-media-still" src="/brand/hero.webp" alt="" width={1920} height={1080} />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hud-grain" aria-hidden="true" />
      <div className="hud-texture" aria-hidden="true" />
      <svg className="hud-frame" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <polygon points="18,6 982,6 994,18 994,982 982,994 18,994 6,982 6,18" />
      </svg>
      <span className="hud-tick hud-tick-tl" aria-hidden="true" />
      <span className="hud-tick hud-tick-tr" aria-hidden="true" />
      <span className="hud-tick hud-tick-bl" aria-hidden="true" />
      <span className="hud-tick hud-tick-br" aria-hidden="true" />

      <div className="hud-stage">
        <div className="hud-name">
          <h1 className="hud-portal-name" translate="no">
            <span className="block">Anzen</span>
            <span className="block">Digital</span>
            <span className="block">Media</span>
          </h1>
        </div>

        <div className="hud-portal" data-slot="studio-portal">
          <div className="hud-portal-window">
            <div className="hud-portal-core" aria-hidden="true" />
            <div className="hud-door hud-door-left" aria-hidden="true" />
            <div className="hud-door hud-door-right" aria-hidden="true" />
          </div>
          <svg className="hud-portal-svg" viewBox="0 0 100 100" aria-hidden="true">
            <polygon points={OCTAGON} />
            <polygon className="hud-octagon-inner" points="36 14 64 14 86 36 86 64 64 86 36 86 14 64 14 36" />
          </svg>
        </div>

        <div className="hud-actions">
          <Link href="/projects" className="hud-side hud-side-left">
            <img className="section-art" data-slot="projects" src="/brand/projects-panel.webp" alt="" width={640} height={960} />
            <span className="hud-side-kicker">Projects</span>
            <span className="hud-action">
              View <span aria-hidden="true">›</span>
            </span>
          </Link>
          <Link href="/contact" className="hud-side hud-side-right">
            <img className="section-art" data-slot="contact" src="/brand/contact-panel.webp" alt="" width={640} height={960} />
            <span className="hud-side-kicker">Contact</span>
            <span className="hud-action">
              Reach out <span aria-hidden="true">›</span>
            </span>
          </Link>
        </div>
      </div>

      <footer className="hud-foot">
        <nav aria-label="Legal" className="hud-legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
        <div className="hud-foot-tools">
          {videoReady ? (
            <button
              type="button"
              className="hud-grain-toggle"
              aria-pressed={motion}
              aria-label={motion ? "Pause background" : "Play background"}
              onClick={() => setMotion((value) => !value)}
            >
              {motion ? "Pause" : "Play"}
            </button>
          ) : null}
          <button
            type="button"
            className="hud-grain-toggle"
            aria-pressed={grain}
            aria-label={grain ? "Grain on" : "Grain off"}
            onClick={() => setGrain((value) => !value)}
          >
            Grain {grain ? "[On]" : "[Off]"}
          </button>
        </div>
      </footer>
    </section>
  );
}

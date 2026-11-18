"use client";

import { useEffect, useRef, useState } from "react";

export function StudioHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [grain, setGrain] = useState(true);
  const [playVideo, setPlayVideo] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 860px)");
    const sync = () => setPlayVideo(wide.matches && !reduce.matches);
    sync();
    wide.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playVideo || paused) {
      video.pause();
      return;
    }
    video.muted = true;
    void video.play().catch(() => setPaused(true));
  }, [playVideo, paused]);

  const showing = playVideo && !paused;

  return (
    <section
      className="hud-hero"
      data-grain={grain ? "on" : "off"}
      data-video={showing ? "ready" : "still"}
      data-motion={showing ? "on" : "off"}
    >
      <div className="hero-media" aria-hidden="true">
        {playVideo ? (
          <video
            ref={videoRef}
            className="hero-media-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/brand/hero-poster.webp"
            width={1920}
            height={1080}
          >
            <source src="/brand/hero-loop.webm" type="video/webm" />
            <source src="/brand/hero-loop.mp4" type="video/mp4" />
          </video>
        ) : null}
        <picture className="hero-media-still">
          <source media="(max-width: 859px)" srcSet="/brand/hero-poster-phone.webp" type="image/webp" />
          <source media="(max-width: 859px)" srcSet="/brand/hero-poster-phone.jpg" type="image/jpeg" />
          <source media="(min-width: 860px)" srcSet="/brand/hero-poster.webp" type="image/webp" />
          <img src="/brand/hero-poster.jpg" alt="" width={2400} height={1350} decoding="async" fetchPriority="high" />
        </picture>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hud-grain" aria-hidden="true" />

      <div className="hud-stage">
        <div className="hud-name">
          <h1 className="hud-portal-name" translate="no">
            <span className="block">Anzen</span>
            <span className="block">Digital</span>
            <span className="block">Media</span>
          </h1>
        </div>
      </div>

      <div className="hud-foot-tools hero-tools">
        {playVideo ? (
          <button
            type="button"
            className="hud-grain-toggle"
            aria-pressed={!paused}
            aria-label={paused ? "Play background" : "Pause background"}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Play" : "Pause"}
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
    </section>
  );
}

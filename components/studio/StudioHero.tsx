"use client";

import { useEffect, useRef, useState } from "react";

export function StudioHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [grain, setGrain] = useState(true);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;

    if (paused) {
      video.pause();
      return;
    }

    let stopped = false;
    function detach() {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    }
    function onGesture() {
      tryPlay();
    }
    function tryPlay() {
      if (stopped) return;
      video.muted = true;
      void video.play().then(detach).catch(() => {
        window.addEventListener("pointerdown", onGesture, { passive: true });
        window.addEventListener("touchstart", onGesture, { passive: true });
        window.addEventListener("scroll", onGesture, { passive: true });
      });
    }
    tryPlay();
    video.addEventListener("canplay", tryPlay);

    return () => {
      stopped = true;
      detach();
      video.removeEventListener("canplay", tryPlay);
    };
  }, [paused]);

  return (
    <section
      className="hud-hero"
      data-grain={grain ? "on" : "off"}
      data-video={!paused && ready ? "ready" : "still"}
      data-motion={paused ? "off" : "on"}
    >
      <div className="hero-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-media-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          width={1920}
          height={1080}
          onLoadedData={() => setReady(true)}
        >
          <source media="(max-width: 859px)" src="/brand/hero-loop-phone.webm" type="video/webm" />
          <source media="(max-width: 859px)" src="/brand/hero-loop-phone.mp4" type="video/mp4" />
          <source media="(min-width: 860px)" src="/brand/hero-loop.webm" type="video/webm" />
          <source media="(min-width: 860px)" src="/brand/hero-loop.mp4" type="video/mp4" />
        </video>
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
        <button
          type="button"
          className="hud-grain-toggle"
          aria-pressed={!paused}
          aria-label={paused ? "Play background" : "Pause background"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play" : "Pause"}
        </button>
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

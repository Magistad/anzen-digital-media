export default function NotFound() {
  type CRTOpts = {
    flicker: boolean;
    curvature: boolean;
    scanGlow: boolean;
    grain: boolean;
    powerOn: boolean;
  };

  const CRT_OPTS: CRTOpts = {
    flicker: true,
    curvature: true,
    scanGlow: true,
    grain: true,
    powerOn: true,
  };

  function CRTFrame({ children, opts }: { children: React.ReactNode; opts: CRTOpts }) {
    return (
      <div className="min-h-screen bg-[#12100d] flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-[24px] bg-[#d2c6a6] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-black/15">
          {/* Outer bevel */}
          <div className="pointer-events-none absolute inset-0 rounded-[24px] [box-shadow:inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-4px_20px_rgba(0,0,0,0.25)]" />

          {/* Screen well */}
          <div
            className={[
              "relative m-5 rounded-[18px] bg-[#0b1213] overflow-hidden ring-1 ring-black/40 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]",
              opts.curvature ? "crt-curved" : "",
            ].join(" ")}
          >
            {/* Curvature + vignette */}
            <div className="pointer-events-none absolute inset-0 rounded-[18px] [box-shadow:inset_0_-80px_140px_rgba(0,0,0,0.6),inset_0_0_120px_rgba(0,0,0,0.7)]" />

            {/* Scanlines */}
            <div
              className={[
                "pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay",
                "[background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)]",
                opts.scanGlow ? "crt-scan-glow" : "",
              ].join(" ")}
            />

            {/* Glass reflections */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_60%_at_50%_-20%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(40%_30%_at_0%_0%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(40%_30%_at_100%_0%,rgba(255,255,255,0.06),transparent_50%)]" />

            {/* Content */}
            <div className={["relative p-10 text-center", opts.powerOn ? "crt-poweron" : ""].join(" ")}>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                The AI House
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">404 — Signal Lost</h1>
              <p className="mt-4 text-zinc-300">
                The page you’re looking for isn’t broadcasting. Try the main channel.
              </p>
              <a
                href="/"
                className="mt-8 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
              >
                Return home
              </a>
              <div className="mt-10 grid grid-cols-1 gap-4 text-left text-sm text-zinc-400 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-zinc-300">What we do</div>
                  <ul className="mt-2 list-disc pl-5">
                    <li>Compliance automation & audit-ready reporting</li>
                    <li>Cross-app runbooks & event pipelines</li>
                    <li>AI copilots with governance & evals</li>
                    <li>Applied AI product engineering</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-zinc-300">Status</div>
                  <p className="mt-2">Currently not accepting new clients in 2025.</p>
                </div>
              </div>
            </div>

            {/* Phosphor grain */}
            {opts.grain && <div className="pointer-events-none absolute inset-0 crt-grain" />}

            {/* Flicker */}
            {opts.flicker && <div className="pointer-events-none absolute inset-0 crt-flicker" />}
          </div>

          {/* Lower bezel controls */}
          <div className="mx-5 mb-5 mt-2 flex items-center justify-between">
            <div className="h-10 w-28 rounded-sm bg-[#cdbf9f] shadow-inner ring-1 ring-black/20 flex items-center justify-center text-[10px] tracking-widest text-[#6b6048]">
              PUSH
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2.5 w-2.5 rounded-full bg-[#1aff5c] shadow-[0_0_10px_rgba(26,255,92,0.65)]" />
              <div className="h-6 w-6 rounded-sm bg-[#cdbf9f] shadow-inner ring-1 ring-black/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CRTFrame
      opts={{
        ...CRT_OPTS,
      }}
    >
      {/* Empty – CRTFrame renders full screen UI */}
    </CRTFrame>
  );
}

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
      <div className="relative w-full max-w-7xl rounded-[24px] bg-[#d2c6a6] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-black/15">
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
          <div className={["relative", opts.powerOn ? "crt-poweron" : ""].join(" ")}>
            {children}
          </div>

          {/* Phosphor grain overlay */}
          {opts.grain && (
            <div className="pointer-events-none absolute inset-0 crt-grain" />
          )}

          {/* Flicker overlay (top of stack) */}
          {opts.flicker && (
            <div className="pointer-events-none absolute inset-0 crt-flicker" />
          )}
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

export default function Page() {
  const services = [
    {
      title: "Compliance",
      blurb:
        "Automated controls, policy checks, and audit-ready reporting for SOC 2, HIPAA, PCI, CCPA/CPRA, and more.",
      bullets: [
        "Continuous compliance monitoring",
        "PII/PHI discovery and redaction",
        "Vendor risk and third-party due diligence",
      ],
    },
    {
      title: "Automation",
      blurb:
        "Orchestrate the busywork: from data entry and QA to multi-system runbooks across SaaS and internal tools.",
      bullets: [
        "Cross-app workflows and RPA",
        "Event-driven pipelines",
        "Human-in-the-loop approvals",
      ],
    },
    {
      title: "Assistance",
      blurb:
        "AI copilots that understand your business — secure, on-brand, and measurable.",
      bullets: [
        "Private RAG over your data",
        "CX/Agent assist copilots",
        "Knowledge governance and analytics",
      ],
    },
    {
      title: "Development",
      blurb:
        "Applied AI product engineering: from quick prototypes to production-grade apps and platforms.",
      bullets: ["Full-stack app builds", "MLOps and evals", "Security, privacy, and SLOs"],
    },
  ];

  const logos = [
    "AWS",
    "Azure",
    "Google Cloud",
    "Cloudflare",
    "Kubernetes",
    "Docker",
    "Vercel",
    "Render",
    "Netlify",
    "GitHub",
    "Snowflake",
    "Databricks",
    "Postgres",
    "BigQuery",
    "Stripe",
    "Twilio",
    "OpenAI",
    "Anthropic",
    "Vertex AI",
    "Bedrock",
  ];

  return (
    <CRTFrame opts={CRT_OPTS}>
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-extrabold tracking-tight">
              <span className="text-zinc-100">ANZEN</span>
              <span className="text-zinc-400"> DIGITAL</span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
              The AI House
            </span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a className="text-sm text-zinc-300 hover:text-white" href="#work">
              Work
            </a>
            <a className="text-sm text-zinc-300 hover:text-white" href="#services">
              Solutions
            </a>
            <a className="text-sm text-zinc-300 hover:text-white" href="#why">
              Why Anzen
            </a>
            <a className="text-sm text-zinc-300 hover:text-white" href="#contact">
              Contact
            </a>
          </div>
          <a
            href="#services"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            Explore solutions
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            The AI House for modern operations
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            AI that drives outcomes across every leg of your operation
          </h1>
          <p className="mt-5 text-pretty text-zinc-300 md:text-lg">
            Anzen Digital Media LLC designs, builds, and runs applied AI systems — from
            compliance and automation to assistance and full-stack development. Secure,
            measurable, and production-ready.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#services"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Explore solutions
            </a>
            <a
              href="#why"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10"
            >
              See our approach
            </a>
          </div>
        </div>

        {/* Logo rail */}
        <div className="mt-16 grid grid-cols-2 items-center justify-items-center gap-6 opacity-70 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="text-xs text-zinc-400">
              {l}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-white/10 bg-zinc-900/20 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-2xl font-semibold md:text-3xl">Solutions</h2>
            <p className="text-sm text-zinc-400">
              Compliance • Automation • Assistance • Development
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset]"
              >
                <div className="mb-3 text-lg font-semibold">{s.title}</div>
                <p className="mb-4 text-sm text-zinc-300">{s.blurb}</p>
                <ul className="space-y-2 text-sm text-zinc-400">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Anzen */}
      <section id="why" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold md:text-3xl">Why leaders choose Anzen</h3>
              <ul className="mt-6 space-y-4 text-zinc-300">
                <li>
                  <span className="font-medium text-white">Outcome first.</span> We ship value in
                  weeks, not quarters.
                </li>
                <li>
                  <span className="font-medium text-white">Secure by design.</span> Data isolation,
                  least privilege, and auditable traces.
                </li>
                <li>
                  <span className="font-medium text-white">Measurable impact.</span> We define
                  success metrics and instrument from day one.
                </li>
                <li>
                  <span className="font-medium text-white">Vendor-agnostic and cloud-native.</span>{" "}
                  We meet you in your stack (AWS, Azure, GCP, Cloudflare, Kubernetes,
                  Vercel/Netlify/Render, on-prem) without lock-in.
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-zinc-300">
                <div className="mb-3 text-xs uppercase tracking-widest text-zinc-400">
                  Sample Engagements
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Automated audit pack generation that cut prep time 78%.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    CX copilot reducing AHT by 24% with higher CSAT.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    RAG over private data with evals and governance.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/10 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h3 className="text-2xl font-semibold md:text-3xl">Contact</h3>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Currently not accepting new clients in 2025.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold">ANZEN DIGITAL</div>
            <p className="mt-2 text-sm text-zinc-400">
              The AI House for modern operations: compliance, automation, assistance, and
              development.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-300">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <a href="#work" className="hover:text-white">
                  Work
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-white">
                  Why Anzen
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-300">Platforms and ecosystems</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>Cloud: AWS · Azure · GCP</li>
              <li>Edge/Web: Cloudflare · Vercel · Netlify</li>
              <li>Data: Snowflake · Databricks · BigQuery</li>
              <li>Apps: Salesforce · HubSpot · Zendesk</li>
              <li>Messaging/Media: Slack · Twilio · Mux</li>
              <li>Plus your stack, vendor-agnostic.</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-6 text-xs text-zinc-500">
          © {new Date().getFullYear()} Anzen Digital Media LLC. All rights reserved.
        </div>
      </footer>
    </CRTFrame>
  );
}



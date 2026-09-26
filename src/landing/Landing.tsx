import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { percent } from "@/lib/format";
import { RISK_META } from "@/lib/risk";
import { buildLiquidationRisk } from "@/services/hyperliquid/adapters";
import { EXECUTION_NETWORK, READ_NETWORK } from "@/services/config";
import { useReveal } from "@/hooks/useLeora";
import { Button, Headline, Panel, Pill, SectionLabel } from "@/components/ui/primitives";
import { RiskBadge, RiskScale } from "@/components/ui/RiskViz";
import { Wordmark } from "@/components/ui/Brand";
import {
  IconHistory,
  IconLayers,
  IconPulse,
  IconRisk,
  IconShield,
  IconSpark,
} from "@/components/ui/Icons";
import { AppPreview, MarketStrip } from "./AppPreview";
import { cn } from "@/utils/cn";

export function Landing({ onLaunch }: { onLaunch: () => void }) {
  const rootRef = useReveal<HTMLDivElement>();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={rootRef} className="relative">
      {/* ---------------------------------- nav */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-gold-500/[0.14] bg-ink-1000/80 backdrop-blur-xl" : "",
        )}
      >
        <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:h-[82px] lg:px-8">
          <Wordmark />
          <nav className="hidden items-center gap-9 md:flex">
            {[
              { id: "preview", label: "Product" },
              { id: "risk", label: "Risk" },
              { id: "trust", label: "Read-only" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[10.5px] font-medium tracking-[0.2em] text-mist-400 uppercase transition-colors hover:text-gold-200"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <Button size="sm" onClick={onLaunch}>
            Launch App
          </Button>
        </div>
      </header>

      {/* ---------------------------------- hero */}
      <section className="relative px-4 pt-28 pb-10 sm:px-6 sm:pt-36 lg:px-8 lg:pt-44">
        <div className="mx-auto max-w-[1240px]">
          <motion.div
            initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[820px]"
          >
            <Pill tone="gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              hyperliquid · read-only
            </Pill>

            <div className="mt-8">
              <Wordmark size={54} letter="text-[30px] sm:text-[38px] tracking-[0.34em]" />
            </div>

            <h1 className="display-xl mt-8 text-[38px] sm:text-[54px] lg:text-[64px]">
              <span className="text-mist-50 italic">See your risk</span>
              <br />
              <span className="gold-text">before it becomes a problem.</span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[15px] leading-[1.75] text-mist-300 sm:text-[16.5px]">
              Track your Hyperliquid positions, PnL, funding and liquidation distance in one clear
              view.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={onLaunch}>
                Launch App
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("preview")}>
                Explore Leora
              </Button>
            </div>

            <div className="mt-9 text-[9.5px] font-medium tracking-[0.24em] text-mist-500 uppercase">
              no keys · no custody · see → understand → decide
            </div>
          </motion.div>

          <MarketStrip className="mt-12 border-t border-gold-500/[0.12] pt-6" />
        </div>
      </section>

      {/* ---------------------------------- product preview */}
      <section id="preview" className="scroll-mt-24 px-4 pt-6 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="reveal">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ---------------------------------- problem */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="reveal max-w-[640px]">
            <SectionLabel gold>The problem</SectionLabel>
            <Headline className="mt-5" lead="Liquidation is quiet" accent="until it is not." />
            <p className="mt-7 text-[14.5px] leading-[1.8] text-mist-400">
              Terminals are built for speed. Spreadsheets are built for after-the-fact. Neither
              answers the only question that matters while you are in a position: how close are you,
              right now?
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {[
              {
                n: "01",
                title: "See",
                copy: "Open positions, side, size and exposure without the noise of an order ticket.",
              },
              {
                n: "02",
                title: "Understand",
                copy: "PnL, funding, and a visual of mark versus liquidation — not a buried column.",
              },
              {
                n: "03",
                title: "Decide",
                copy: "When execution arrives, reduce or close with an amount you choose. Never assumed.",
              },
            ].map((item, i) => (
              <Panel
                key={item.n}
                className="reveal flex items-start gap-5 p-5 transition-colors duration-500 hover:border-gold-400/25 sm:gap-7 sm:p-7"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <span className="font-display gold-text shrink-0 text-[26px] leading-none sm:text-[32px]">
                  {item.n}
                </span>
                <div>
                  <h3 className="text-[18px] text-mist-50 sm:text-[21px]">{item.title}</h3>
                  <p className="mt-2 max-w-[560px] text-[13.5px] leading-[1.75] text-mist-400">
                    {item.copy}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- what leora shows */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="reveal text-center">
            <SectionLabel gold>What Leora shows</SectionLabel>
            <Headline className="mt-5" lead="Everything that changes" accent="your risk" />
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: IconLayers,
                title: "Positions",
                copy: "Asset, side, size, entry and mark — composed as cards, not a spreadsheet.",
              },
              {
                icon: IconSpark,
                title: "PnL",
                copy: "Unrealised on every position. Realised from fills. No invented numbers.",
              },
              {
                icon: IconPulse,
                title: "Funding",
                copy: "Since open, projected, and the live rate. Carry is part of risk.",
              },
              {
                icon: IconRisk,
                title: "Liquidation",
                copy: "A track from mark to liq. Healthy, attention, high risk — readable in a glance.",
              },
              {
                icon: IconShield,
                title: "Margin",
                copy: "Maintenance margin against equity, free collateral and account leverage.",
              },
              {
                icon: IconHistory,
                title: "History",
                copy: "Recent trades and funding payments, so the past explains the present.",
              },
            ].map((item, i) => (
              <Panel
                key={item.title}
                className="reveal group p-6 transition-all duration-500 hover:border-gold-400/25 sm:p-7"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="relative inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border border-gold-500/40 bg-gradient-to-br from-gold-300/[0.10] to-transparent">
                  <span className="absolute inset-[3px] rounded-[6px] border border-gold-500/18" />
                  <item.icon className="relative h-[17px] w-[17px] text-gold-300" />
                </span>
                <h3 className="mt-6 text-[21px] text-mist-50">{item.title}</h3>
                <p className="mt-2.5 text-[13px] leading-[1.75] text-mist-400">{item.copy}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- risk visualisation */}
      <RiskSection />

      {/* ---------------------------------- read-only */}
      <section id="trust" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <div className="reveal">
            <SectionLabel gold>Trust</SectionLabel>
            <Headline className="mt-5" lead="Read-only," accent="by design." />
            <p className="mx-auto mt-7 max-w-[620px] text-[14.5px] leading-[1.85] text-mist-400">
              Leora never asks for a private key or a seed. Wallet connection is only used to know
              which Hyperliquid account to read. Mainnet is observed, not instructed. Execution —
              reduce and close with an amount you choose — will arrive later, behind an explicit
              confirmation, and never as a hidden 50%.
            </p>
          </div>

          <div className="reveal mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "No private keys",
              "No custody",
              "No passwords",
              `${READ_NETWORK} read`,
            ].map((label) => (
              <div
                key={label}
                className="rounded-full border border-gold-500/20 bg-gold-300/[0.03] px-5 py-4 text-[11px] font-medium tracking-[0.2em] text-gold-200 uppercase"
              >
                {label}
              </div>
            ))}
          </div>

          <p className="reveal mt-8 text-[11.5px] leading-relaxed text-mist-600">
            Execution is developed and verified on {EXECUTION_NETWORK} behind a feature flag before
            it is ever enabled on mainnet.
          </p>
        </div>
      </section>

      {/* ---------------------------------- final cta */}
      <section className="px-4 pt-10 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-[1240px]">
          <div className="reveal relative overflow-hidden px-6 py-16 text-center sm:py-24">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(ellipse 45% 60% at 50% 50%, rgba(199,157,93,0.14), transparent 72%)",
              }}
            />
            <div className="relative flex flex-col items-center">
              <Wordmark size={56} letter="text-[30px] sm:text-[40px] tracking-[0.34em]" />
              <h2 className="display-xl mt-10 text-[30px] text-mist-50 italic sm:text-[44px]">
                Your risk, at a glance.
              </h2>
              <p className="mt-5 max-w-[420px] text-[14.5px] leading-[1.75] text-mist-400">
                Connect a wallet or paste an address. Leora reads Hyperliquid. Nothing else.
              </p>
              <Button size="lg" className="mt-10" onClick={onLaunch}>
                Launch App
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------- footer */}
      <footer className="border-t border-gold-500/[0.12] px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="text-[10px] font-medium tracking-[0.24em] text-mist-500 uppercase">
          Leora · Hyperliquid risk
        </div>
        <div className="mt-2.5 text-[10px] font-medium tracking-[0.24em] text-mist-600 uppercase">
          read-only · not a trading terminal
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive risk explainer                                          */
/* ------------------------------------------------------------------ */

function RiskSection() {
  const [distance, setDistance] = useState(0.24);
  // Illustrative mechanism only: a hypothetical mark of 100 at the chosen
  // distance. Real positions always use live prices from the account snapshot.
  const mark = 100;
  const risk = buildLiquidationRisk(mark, mark * (1 - distance));
  const meta = RISK_META[risk.level];

  return (
    <section id="risk" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[900px]">
        <div className="reveal text-center">
          <SectionLabel gold>Signature</SectionLabel>
          <Headline className="mt-5" lead="Distance to liquidation," accent="made visible." />
        </div>

        <Panel className="reveal mt-12 p-4 sm:p-7">
          <RiskScale risk={risk} markPrice={mark} szDecimals={2} />

          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {(
              [
                { level: "healthy", caption: "Comfortable distance" },
                { level: "attention", caption: "Watch the path" },
                { level: "critical", caption: "Close to liquidation" },
              ] as const
            ).map((item) => {
              const m = RISK_META[item.level];
              const active = risk.level === item.level;
              return (
                <div
                  key={item.level}
                  className={cn(
                    "rounded-[14px] border px-2 py-4 text-center transition-all duration-500",
                    active
                      ? cn(m.border, m.bg)
                      : "border-gold-500/[0.1] bg-gold-300/[0.015] opacity-55",
                  )}
                >
                  <div className={cn("text-[14px] sm:text-[16px]", m.text)}>{m.label}</div>
                  <div className="mt-1.5 text-[11px] leading-snug text-mist-500">
                    {item.caption}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="label-xs">Drag to explore</span>
              <span className="num font-mono text-[11px] text-gold-200">
                {percent(distance, 1)} away
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              value={Math.round(distance * 100)}
              onChange={(e) => setDistance(Number(e.target.value) / 100)}
              aria-label="Distance to liquidation"
              className="leora-range mt-3.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gold-300/12"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gold-500/[0.12] pt-5">
            <RiskBadge level={risk.level} />
            <p className={cn("text-[13px] leading-relaxed", meta.text)}>
              {risk.level === "critical"
                ? "A small move ends the position."
                : risk.level === "attention"
                  ? "Still alive, but the buffer is thin."
                  : "Plenty of room for ordinary volatility."}
            </p>
          </div>

          <p className="mt-4 text-[9.5px] tracking-[0.2em] text-mist-700 uppercase">
            illustration of the mechanism · real positions use live prices
          </p>
        </Panel>
      </div>
    </section>
  );
}

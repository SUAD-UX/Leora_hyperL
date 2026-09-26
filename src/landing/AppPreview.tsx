import { useEffect, useState } from "react";
import type { PortfolioPoint } from "@/lib/types";
import { compactUsd, percent, price } from "@/lib/format";
import { buildLiquidationRisk } from "@/services/hyperliquid/adapters";
import { getCandles } from "@/services/hyperliquid";
import { useMarkets } from "@/hooks/useLeora";
import { Chart } from "@/components/ui/Chart";
import { RiskTrack } from "@/components/ui/RiskViz";
import { LeoraSeal } from "@/components/ui/Brand";
import { LiveDot, Skeleton } from "@/components/ui/primitives";
import {
  IconHistory,
  IconOverview,
  IconPositions,
  IconRisk,
  IconWallet,
} from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

const WATCHLIST = ["BTC", "ETH", "SOL", "HYPE"];

/**
 * A faithful preview of the Leora app chrome, rendered with live Hyperliquid
 * market data. Account-specific figures are intentionally absent — they only
 * exist once a wallet is connected.
 */
export function AppPreview({ className }: { className?: string }) {
  const { quotes, failed } = useMarkets(WATCHLIST);
  const [candles, setCandles] = useState<PortfolioPoint[] | null>(null);
  const [demoProximity, setDemoProximity] = useState(0.32);

  useEffect(() => {
    let active = true;
    getCandles("BTC", "1h", 48 * 60 * 60 * 1000)
      .then((data) => active && setCandles(data))
      .catch(() => active && setCandles([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setDemoProximity(0.42 + Math.sin(frame / 7) * 0.22);
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  const lead = quotes?.[0];
  const risk = buildLiquidationRisk(100, 100 * (1 - (1 - demoProximity) * 0.5));

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute -inset-x-10 -top-16 h-56 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 50%, rgba(122,132,214,0.22), transparent 70%)",
        }}
      />
      <div className="glass-deep noise relative rounded-[22px] p-1.5 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)] sm:rounded-[26px] sm:p-2.5">
        <div className="overflow-hidden rounded-[16px] border border-gold-500/[0.16] bg-ink-1000/85 sm:rounded-[20px]">
          <div className="flex">
            {/* rail */}
            <div className="hidden w-[150px] shrink-0 flex-col border-r border-gold-500/[0.12] p-3 md:flex">
              <div className="flex items-center gap-2 px-1">
                <LeoraSeal size={22} />
                <span className="font-display gold-text text-[11px] tracking-[0.3em]">LEORA</span>
              </div>
              <div className="mt-6 space-y-0.5">
                {[
                  { icon: IconOverview, label: "Overview", active: true },
                  { icon: IconPositions, label: "Positions" },
                  { icon: IconRisk, label: "Risk" },
                  { icon: IconHistory, label: "History" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px]",
                      item.active
                        ? "border border-gold-500/25 bg-gold-300/[0.07] text-gold-100"
                        : "text-mist-600",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="flex-1" />
              <div className="rounded-xl border border-gold-500/[0.18] bg-gold-300/[0.03] p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] text-mist-300">
                  <IconWallet className="h-3.5 w-3.5" />
                  Connect wallet
                </div>
                <div className="mt-1 font-mono text-[8px] tracking-[0.14em] text-mist-600 uppercase">
                  read-only access
                </div>
              </div>
            </div>

            {/* content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between border-b border-gold-500/[0.12] px-3 py-2.5">
                <div>
                  <div className="text-[12px] text-mist-100">Overview</div>
                  <div className="font-mono text-[8px] tracking-[0.16em] text-mist-600 uppercase">
                    live market layer
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-full border border-gold-500/25 bg-gold-300/[0.06] px-2 py-0.5 text-[8.5px] font-medium tracking-[0.18em] text-gold-200 uppercase sm:inline-flex">
                    <LiveDot /> mainnet · read
                  </span>
                  <span className="h-5 w-5 rounded-full bg-gradient-to-br from-gold-100 to-gold-500" />
                </div>
              </div>

              <div className="space-y-2.5 p-2.5 sm:space-y-3 sm:p-3.5">
                <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-[1.45fr_1fr]">
                  <div className="rounded-xl border border-gold-500/[0.14] bg-gold-300/[0.025] p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="label-xs">BTC · mark price</div>
                        {lead ? (
                          <div className="num mt-1.5 text-[22px] tracking-tight text-mist-50 sm:text-[26px]">
                            {price(lead.markPrice, 5)}
                          </div>
                        ) : (
                          <Skeleton className="mt-2 h-7 w-32" />
                        )}
                      </div>
                      {lead && (
                        <div
                          className={cn(
                            "num font-mono text-[11px]",
                            lead.dayChange >= 0 ? "text-jade-300" : "text-ember-300",
                          )}
                        >
                          {percent(lead.dayChange, 2, true)}
                        </div>
                      )}
                    </div>
                    {candles === null ? (
                      <Skeleton className="mt-3 h-[96px] w-full" />
                    ) : (
                      <Chart
                        points={candles}
                        height={96}
                        tone="gold"
                        className="mt-2"
                        valueFormat={(v) => price(v, 5)}
                      />
                    )}
                    <div className="mt-2 flex items-center justify-between text-[8.5px] font-medium tracking-[0.18em] text-mist-600 uppercase">
                      <span>48h</span>
                      <span>hyperliquid mainnet</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gold-500/[0.14] bg-gold-300/[0.025] p-3">
                    <div className="label-xs">Market pulse</div>
                    <div className="mt-2.5 space-y-2">
                      {(quotes ?? []).slice(0, 4).map((q) => (
                        <div key={q.symbol} className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-mist-200">{q.symbol}</span>
                          <div className="flex items-center gap-3">
                            <span className="num font-mono text-[11px] text-mist-300">
                              {price(q.markPrice, 5)}
                            </span>
                            <span
                              className={cn(
                                "num w-14 text-right font-mono text-[10.5px]",
                                q.dayChange >= 0 ? "text-jade-300" : "text-ember-300",
                              )}
                            >
                              {percent(q.dayChange, 2, true)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {!quotes && !failed &&
                        [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                      {!quotes && failed && (
                        <div className="text-[11px] leading-relaxed text-mist-500">
                          Market data is unavailable right now. Leora will retry automatically.
                        </div>
                      )}
                    </div>
                    {quotes?.[0] && (
                      <div className="mt-3 border-t border-gold-500/[0.12] pt-2.5">
                        <div className="label-xs">BTC funding · 1h</div>
                        <div className="num mt-1 font-mono text-[12px] text-mist-100">
                          {percent(quotes[0].fundingHourly, 4, true)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gold-500/[0.14] bg-gold-300/[0.025] p-3">
                  <div className="flex items-center justify-between">
                    <div className="label-xs">Distance to liquidation</div>
                    <span className="text-[8.5px] font-medium tracking-[0.18em] text-mist-600 uppercase">
                      component preview
                    </span>
                  </div>
                  <RiskTrack risk={risk} className="mt-3" />
                  <div className="mt-2.5 text-[11px] leading-relaxed text-mist-500">
                    Connect a wallet and every open position lands here — size, PnL, funding and how
                    far it sits from liquidation.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {["Open positions", "Exposure", "Funding · 24h"].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-dashed border-gold-500/[0.16] px-2.5 py-2.5"
                    >
                      <div className="label-xs truncate">{label}</div>
                      <div className="mt-1.5 font-mono text-[12px] text-mist-600">—</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small live strip used in the hero. */
export function MarketStrip({ className }: { className?: string }) {
  const { quotes, failed } = useMarkets(WATCHLIST);

  if (failed) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-7",
        className,
      )}
    >
      <span className="flex items-center gap-2 text-[9.5px] font-medium tracking-[0.2em] text-mist-500 uppercase">
        <LiveDot /> live mainnet
      </span>
      {(quotes ?? []).map((q) => (
        <span key={q.symbol} className="flex items-baseline gap-2">
          <span className="text-[9.5px] font-medium tracking-[0.18em] text-mist-500 uppercase">
            {q.symbol}
          </span>
          <span className="num font-mono text-[12px] text-mist-200">{price(q.markPrice, 5)}</span>
          <span
            className={cn(
              "num font-mono text-[10.5px]",
              q.dayChange >= 0 ? "text-jade-300" : "text-ember-300",
            )}
          >
            {percent(q.dayChange, 1, true)}
          </span>
        </span>
      ))}
      {!quotes && <Skeleton className="h-3 w-56" />}
      {quotes?.[0] ? (
        <span className="hidden text-[9.5px] font-medium tracking-[0.18em] text-mist-600 uppercase xl:inline">
          oi {compactUsd(quotes[0].openInterest)}
        </span>
      ) : null}
    </div>
  );
}

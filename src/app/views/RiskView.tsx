import { useMemo } from "react";
import type { AccountSnapshot, Position } from "@/lib/types";
import { compactUsd, percent, price, usd } from "@/lib/format";
import { RISK_META, accountRiskLevel, pnlTone, riskHeadline } from "@/lib/risk";
import { Panel, Pill, SectionLabel } from "@/components/ui/primitives";
import { ExposureSplit, HealthArc, RiskBadge, RiskTrack } from "@/components/ui/RiskViz";
import { IconArrowRight } from "@/components/ui/Icons";
import { EmptyPositions, EmptyRow } from "../states";
import { cn } from "@/utils/cn";

export function RiskView({
  snapshot,
  onOpenPosition,
}: {
  snapshot: AccountSnapshot;
  onOpenPosition: (position: Position) => void;
}) {
  const { summary, positions } = snapshot;
  const level = accountRiskLevel(summary);
  const meta = RISK_META[level];

  const ladder = useMemo(
    () =>
      [...positions].sort(
        (a, b) => (a.liquidation.distanceRatio ?? 99) - (b.liquidation.distanceRatio ?? 99),
      ),
    [positions],
  );

  const concentration = useMemo(
    () => [...positions].sort((a, b) => b.notional - a.notional).slice(0, 8),
    [positions],
  );

  const fundingPayers = useMemo(
    () =>
      [...positions]
        .filter((p) => Math.abs(p.funding.projectedDaily) > 0.0001)
        .sort((a, b) => a.funding.projectedDaily - b.funding.projectedDaily)
        .slice(0, 6),
    [positions],
  );

  if (positions.length === 0) return <EmptyPositions address={snapshot.address} />;

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Account health */}
      <section className="grid gap-3.5 sm:gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Panel className="p-5 sm:p-6">
          <SectionLabel>Account health</SectionLabel>
          <div className="mt-5 flex flex-col items-center">
            <HealthArc
              ratio={Math.min(1, summary.marginRatio)}
              level={level}
              label={percent(summary.marginRatio, 1)}
              caption="of equity held as maintenance margin"
              size={188}
            />
            <div className={cn("mt-5 font-display text-[20px]", meta.text)}>
              {riskHeadline(positions, summary)}
            </div>
            <p className="mt-2 max-w-[300px] text-center text-[12.5px] leading-relaxed text-mist-500">
              Liquidation of the whole account becomes possible when maintenance margin reaches
              100% of equity. You currently hold{" "}
              <span className="text-mist-200">
                {percent(Math.max(0, 1 - summary.marginRatio), 1)}
              </span>{" "}
              of buffer.
            </p>
          </div>
        </Panel>

        <div className="grid gap-3.5 sm:gap-4">
          <Panel className="p-4 sm:p-5">
            <SectionLabel>Exposure</SectionLabel>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Figure label="Total notional" value={compactUsd(summary.totalNotional)} />
              <Figure label="Equity" value={compactUsd(summary.accountValue)} />
              <Figure label="Leverage" value={`${summary.accountLeverage.toFixed(2)}×`} />
              <Figure
                label="Free collateral"
                value={compactUsd(summary.withdrawable)}
              />
            </div>
            <ExposureSplit
              longNotional={summary.longNotional}
              shortNotional={summary.shortNotional}
              className="mt-5"
            />
          </Panel>

          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Concentration</SectionLabel>
              <span className="font-mono text-[10px] text-mist-600">share of exposure</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {concentration.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-mono text-[11.5px] text-mist-300">
                    {p.symbol}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gold-300/[0.05]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        p.side === "long"
                          ? "bg-gradient-to-r from-jade-500/60 to-jade-400/85"
                          : "bg-gradient-to-r from-iris-500/60 to-iris-400/85",
                      )}
                      style={{ width: `${Math.max(3, p.exposureShare * 100)}%` }}
                    />
                  </div>
                  <span className="num w-12 shrink-0 text-right font-mono text-[11px] text-mist-500">
                    {percent(p.exposureShare, 0)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Liquidation ladder */}
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>Liquidation ladder</SectionLabel>
          <Pill tone="neutral">sorted by proximity</Pill>
        </div>

        <div className="mt-4 space-y-2">
          {ladder.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPosition(p)}
              className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-xl border border-gold-500/[0.12] bg-gold-300/[0.022] p-3.5 text-left transition-colors hover:border-gold-500/[0.26] hover:bg-gold-300/[0.04] lg:grid-cols-[180px_1fr_150px_120px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] font-medium tracking-[0.06em] text-mist-50">{p.symbol}</span>
                <span
                  className={cn(
                    "text-[9px] font-medium tracking-[0.18em] uppercase",
                    p.side === "long" ? "text-jade-300" : "text-iris-300",
                  )}
                >
                  {p.side} · {p.leverage}×
                </span>
              </div>

              <div className="order-3 col-span-2 lg:order-none lg:col-span-1">
                <RiskTrack risk={p.liquidation} compact />
              </div>

              <div className="hidden text-right lg:block">
                <div className="num font-mono text-[12px] text-mist-200">
                  {p.liquidation.liquidationPrice
                    ? price(p.liquidation.liquidationPrice, p.szDecimals)
                    : "—"}
                </div>
                <div className="label-xs mt-0.5">liq. price</div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <div
                    className={cn(
                      "num text-[15px]",
                      RISK_META[p.liquidation.level].text,
                    )}
                  >
                    {p.liquidation.distanceRatio === null
                      ? "—"
                      : percent(p.liquidation.distanceRatio, 1)}
                  </div>
                  <div className="label-xs mt-0.5">distance</div>
                </div>
                <IconArrowRight className="h-4 w-4 text-mist-600 transition-all group-hover:translate-x-0.5 group-hover:text-mist-300" />
              </div>
            </button>
          ))}
        </div>
      </Panel>

      {/* Funding impact */}
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>Funding impact</SectionLabel>
          <div className="flex items-center gap-3">
            <span className="label-xs">next 24h</span>
            <span
              className={cn(
                "num text-[16px]",
                pnlTone(summary.projectedDailyFunding),
              )}
            >
              {usd(summary.projectedDailyFunding, { sign: true })}
            </span>
          </div>
        </div>

        {fundingPayers.length === 0 ? (
          <div className="mt-4">
            <EmptyRow title="No meaningful funding flow" hint="Rates are flat across your positions." />
          </div>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {fundingPayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gold-500/[0.12] bg-gold-300/[0.022] px-3.5 py-3"
              >
                <div>
                  <div className="text-[13px] text-mist-100">{p.symbol}</div>
                  <div className="num mt-0.5 font-mono text-[10px] text-mist-600">
                    {percent(p.funding.annualRate, 1, true)} apr
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn("num font-mono text-[12.5px]", pnlTone(p.funding.projectedDaily))}
                  >
                    {usd(p.funding.projectedDaily, { sign: true })}
                  </div>
                  <div className="label-xs mt-0.5">per day</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gold-500/[0.14] pt-4">
          <RiskBadge level={level} label={`account ${meta.label.toLowerCase()}`} />
          <span className="num font-mono text-[11px] text-mist-500">
            funding since open {usd(summary.netFundingSinceOpen, { sign: true })}
          </span>
        </div>
      </Panel>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className="num mt-1.5 text-[17px] text-mist-50">{value}</div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import type { AccountSnapshot, PortfolioRange, Position } from "@/lib/types";
import { compactUsd, percent, relativeTime, usd } from "@/lib/format";
import { RISK_META, accountRiskLevel, mostAtRisk, pnlTone, riskHeadline } from "@/lib/risk";
import { useAnimatedNumber, useMediaQuery } from "@/hooks/useLeora";
import { Button, Panel, Pill, SectionLabel, Segmented } from "@/components/ui/primitives";
import { Chart } from "@/components/ui/Chart";
import { ExposureSplit, HealthArc, RiskBadge } from "@/components/ui/RiskViz";
import { IconArrowRight, IconPulse } from "@/components/ui/Icons";
import { PositionCard, PositionRow } from "../PositionCard";
import { EmptyPositions, EmptyRow } from "../states";
import { cn } from "@/utils/cn";

const RANGE_OPTIONS: { value: PortfolioRange; label: string }[] = [
  { value: "day", label: "24H" },
  { value: "week", label: "1W" },
  { value: "month", label: "1M" },
  { value: "allTime", label: "All" },
];

export function Overview({
  snapshot,
  onOpenPosition,
  onViewAll,
}: {
  snapshot: AccountSnapshot;
  onOpenPosition: (position: Position) => void;
  onViewAll: () => void;
}) {
  const [range, setRange] = useState<PortfolioRange>("day");
  const [expanded, setExpanded] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { summary, positions, performance } = snapshot;
  const series = performance[range];
  const animatedValue = useAnimatedNumber(summary.accountValue);
  const level = accountRiskLevel(summary);
  const meta = RISK_META[level];
  const worst = mostAtRisk(positions);
  const topPositions = positions.slice(0, 3);

  const handleCard = (position: Position) => {
    if (isDesktop) setExpanded((cur) => (cur === position.id ? null : position.id));
    else onOpenPosition(position);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* ---------- Equity + risk ---------- */}
      <section className="grid gap-3.5 sm:gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionLabel>Account value</SectionLabel>
              <div className="num mt-2 text-[32px] leading-none tracking-tight text-mist-50 sm:text-[42px] lg:text-[46px]">
                {usd(animatedValue, { decimals: summary.accountValue >= 100000 ? 0 : 2 })}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                <span className={cn("num text-[13px]", pnlTone(series.netPnl))}>
                  {usd(series.netPnl, { sign: true })}
                </span>
                <span className={cn("num text-[12px]", pnlTone(series.returnRatio))}>
                  {percent(series.returnRatio, 2, true)}
                </span>
                <span className="text-[9.5px] font-medium tracking-[0.18em] text-mist-600 uppercase">
                  {RANGE_OPTIONS.find((r) => r.value === range)?.label}
                </span>
              </div>
            </div>
            <Segmented options={RANGE_OPTIONS} value={range} onChange={setRange} size="sm" />
          </div>

          <Chart
            points={series.equity}
            height={170}
            interactive
            showGrid
            className="mt-5"
            valueFormat={(v) => usd(v, { decimals: 2 })}
          />

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gold-500/[0.14] pt-4 sm:grid-cols-4">
            <MiniStat label="Withdrawable" value={compactUsd(summary.withdrawable)} />
            <MiniStat label="Margin used" value={compactUsd(summary.totalMarginUsed)} />
            <MiniStat
              label="Volume"
              value={series.volume ? compactUsd(series.volume) : "—"}
            />
            <MiniStat
              label="Account leverage"
              value={`${summary.accountLeverage.toFixed(2)}×`}
            />
          </div>
        </Panel>

        <Panel className="flex flex-col p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SectionLabel>Risk posture</SectionLabel>
              <h3 className={cn("mt-2 font-display text-[19px]", meta.text)}>
                {riskHeadline(positions, summary)}
              </h3>
            </div>
            <RiskBadge level={level} />
          </div>

          <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <HealthArc
              ratio={Math.min(1, summary.marginRatio / 1)}
              level={level}
              label={percent(summary.marginRatio, 1)}
              caption="maintenance margin used"
              size={152}
            />
            <div className="w-full flex-1 space-y-3 sm:w-auto">
              <SummaryLine
                label="Open positions"
                value={`${summary.openPositions}`}
              />
              <SummaryLine label="Total exposure" value={compactUsd(summary.totalNotional)} />
              <SummaryLine
                label="Closest to liquidation"
                value={
                  worst && worst.liquidation.distanceRatio !== null
                    ? `${worst.symbol} · ${percent(worst.liquidation.distanceRatio, 1)}`
                    : "—"
                }
                tone={worst ? RISK_META[worst.liquidation.level].text : undefined}
              />
            </div>
          </div>

          <ExposureSplit
            longNotional={summary.longNotional}
            shortNotional={summary.shortNotional}
            className="mt-5"
          />
        </Panel>
      </section>

      {/* ---------- Key figures ---------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Unrealised PnL"
          value={usd(summary.unrealizedPnl, { sign: true })}
          tone={pnlTone(summary.unrealizedPnl)}
          sub="across open positions"
        />
        <StatTile
          label="Realised · 24h"
          value={usd(summary.realizedPnl24h, { sign: true })}
          tone={pnlTone(summary.realizedPnl24h)}
          sub={`${usd(summary.fees24h)} fees`}
        />
        <StatTile
          label="Funding · 24h est."
          value={usd(summary.projectedDailyFunding, { sign: true })}
          tone={pnlTone(summary.projectedDailyFunding)}
          sub={`${usd(summary.netFundingSinceOpen, { sign: true })} since open`}
        />
        <StatTile
          label="Exposure"
          value={compactUsd(summary.totalNotional)}
          sub={`${summary.accountLeverage.toFixed(2)}× account leverage`}
        />
      </section>

      {/* ---------- Positions + activity ---------- */}
      <section className="grid gap-3.5 sm:gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <SectionLabel>Positions</SectionLabel>
            {positions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                className="h-auto px-0 text-[12px]"
                trailing={
                  <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                }
              >
                All {positions.length}
              </Button>
            )}
          </div>

          {positions.length === 0 ? (
            <EmptyPositions address={snapshot.address} />
          ) : (
            <div className="space-y-3">
              {topPositions.map((position, i) => (
                <PositionCard
                  key={position.id}
                  index={i}
                  position={position}
                  expanded={expanded === position.id}
                  dimmed={Boolean(expanded) && expanded !== position.id}
                  allowInline={isDesktop}
                  onToggle={() => handleCard(position)}
                />
              ))}
              {positions.length > 3 && (
                <button
                  onClick={onViewAll}
                  className="group flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-gold-500/[0.20] py-3.5 text-[12.5px] text-mist-500 transition-colors hover:border-gold-400/45 hover:text-mist-200"
                >
                  {positions.length - 3} more position{positions.length - 3 > 1 ? "s" : ""}
                  <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          {positions.length > 0 && (
            <Panel className="p-4 sm:p-5">
              <SectionLabel>Liquidation map</SectionLabel>
              <div className="mt-3 -mx-1.5 space-y-0.5">
                {positions.slice(0, 6).map((p) => (
                  <PositionRow key={p.id} position={p} onSelect={() => onOpenPosition(p)} />
                ))}
              </div>
            </Panel>
          )}

          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Recent activity</SectionLabel>
              <Pill tone="neutral">
                <IconPulse className="h-3 w-3" /> live
              </Pill>
            </div>
            <div className="mt-3 space-y-0.5">
              {snapshot.fills.length === 0 ? (
                <EmptyRow title="No recent fills" hint="Trades on this account will appear here." />
              ) : (
                snapshot.fills.slice(0, 6).map((fill) => (
                  <motion.div
                    key={fill.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-3 rounded-lg px-1.5 py-2.5"
                  >
                    <span
                      className={cn(
                        "h-6 w-[2px] rounded-full",
                        fill.side === "buy" ? "bg-jade-400/70" : "bg-iris-400/70",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] text-mist-200">
                        {fill.direction} {fill.symbol}
                      </div>
                      <div className="num font-mono text-[10px] text-mist-600">
                        {relativeTime(fill.time)} · {compactUsd(fill.notional)}
                      </div>
                    </div>
                    {fill.closedPnl !== 0 && (
                      <span className={cn("num font-mono text-[11.5px]", pnlTone(fill.closedPnl))}>
                        {usd(fill.closedPnl, { sign: true })}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className="num mt-1.5 font-mono text-[13px] text-mist-100">{value}</div>
    </div>
  );
}

function SummaryLine({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gold-500/[0.12] pb-2.5 last:border-0 last:pb-0">
      <span className="text-[12px] text-mist-500">{label}</span>
      <span className={cn("num font-mono text-[12.5px] text-mist-100", tone)}>{value}</span>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <Panel className="p-3.5 transition-colors duration-500 hover:border-gold-500/[0.24] sm:p-4">
      <div className="label-xs">{label}</div>
      <div className={cn("num mt-2 text-[19px] tracking-tight text-mist-50 sm:text-[22px]", tone)}>
        {value}
      </div>
      {sub ? <div className="num mt-1.5 text-[10.5px] text-mist-600">{sub}</div> : null}
    </Panel>
  );
}

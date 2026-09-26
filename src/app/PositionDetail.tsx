import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Position } from "@/lib/types";
import { compactUsd, percent, price, size as fmtSize, usd } from "@/lib/format";
import { RISK_META, pnlTone } from "@/lib/risk";
import { AssetGlyph, Button, Divider, Pill } from "@/components/ui/primitives";
import { DistanceReadout, PriceScale, RiskBadge, RiskTrack } from "@/components/ui/RiskViz";
import { IconClose, IconSpark } from "@/components/ui/Icons";
import { ReducePanel } from "./ReducePanel";
import { cn } from "@/utils/cn";

/**
 * The focused position view. Shared by the inline expansion (desktop)
 * and the full-screen sheet (mobile) so both stay identical in substance.
 */
export function PositionDetailBody({ position }: { position: Position }) {
  const [reduceOpen, setReduceOpen] = useState(false);
  const meta = RISK_META[position.liquidation.level];
  const funding = position.funding;

  return (
    <div className="space-y-5">
      {/* Headline PnL */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-xs">Unrealised PnL</div>
          <div
            className={cn(
              "num mt-1.5 text-[34px] leading-none tracking-tight sm:text-[42px]",
              pnlTone(position.unrealizedPnl),
            )}
          >
            {usd(position.unrealizedPnl, { sign: true })}
          </div>
          <div className={cn("num mt-2 text-[13px]", pnlTone(position.roe))}>
            {percent(position.roe, 2, true)} on margin
          </div>
        </div>
        <div className="text-right">
          <div className="label-xs">Exposure</div>
          <div className="num mt-1.5 text-[22px] text-mist-50">
            {compactUsd(position.notional)}
          </div>
          <div className="num mt-1 text-[11.5px] text-mist-500">
            {fmtSize(position.size, position.szDecimals)} {position.symbol} · {position.leverage}×{" "}
            {position.leverageMode}
          </div>
        </div>
      </div>

      {/* Core numbers */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-gold-500/[0.14] bg-gold-300/[0.05] sm:grid-cols-4">
        {[
          { label: "Entry", value: price(position.entryPrice, position.szDecimals) },
          { label: "Mark", value: price(position.markPrice, position.szDecimals) },
          {
            label: "Liquidation",
            value: position.liquidation.liquidationPrice
              ? price(position.liquidation.liquidationPrice, position.szDecimals)
              : "—",
            tone: position.liquidation.liquidationPrice ? meta.text : undefined,
          },
          {
            label: "Funding since open",
            value: usd(funding.netSinceOpen, { sign: true }),
            tone: pnlTone(funding.netSinceOpen),
          },
        ].map((item) => (
          <div key={item.label} className="bg-ink-950/60 p-3.5 sm:p-4">
            <div className="label-xs">{item.label}</div>
            <div className={cn("num mt-2 text-[16px] text-mist-50", item.tone)}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Liquidation distance */}
      <div className="rounded-[18px] border border-gold-500/[0.14] bg-gold-300/[0.022] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="label-xs">Distance to liquidation</div>
            <DistanceReadout risk={position.liquidation} size="lg" className="mt-1.5" />
          </div>
          <RiskBadge level={position.liquidation.level} />
        </div>

        <RiskTrack risk={position.liquidation} className="mt-5" />

        {position.liquidation.priceDistance !== null ? (
          <p className="mt-4 text-[12.5px] leading-relaxed text-mist-400">
            {position.symbol} would have to move{" "}
            <span className="num text-mist-100">
              {price(position.liquidation.priceDistance, position.szDecimals)}
            </span>{" "}
            {position.side === "long" ? "lower" : "higher"} — that is{" "}
            <span className="num text-mist-100">{percent(position.liquidation.distanceRatio!, 1)}</span>{" "}
            from the current mark — before this position is liquidated.
          </p>
        ) : (
          <p className="mt-4 text-[12.5px] leading-relaxed text-mist-400">
            Hyperliquid is not reporting a liquidation price for this position — the rest of your{" "}
            {position.leverageMode} collateral is currently absorbing it. Account health is the
            number to watch here.
          </p>
        )}

        <PriceScale
          entry={position.entryPrice}
          mark={position.markPrice}
          liquidation={position.liquidation.liquidationPrice}
          side={position.side}
          szDecimals={position.szDecimals}
          className="mt-2"
        />
      </div>

      {/* Supporting detail */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[18px] border border-gold-500/[0.14] bg-gold-300/[0.022] p-4 sm:p-5">
          <div className="label-xs">Funding</div>
          <div className="mt-4 space-y-3.5">
            <Row label="Current rate (1h)" value={percent(funding.hourlyRate, 4, true)} />
            <Row label="Annualised" value={percent(funding.annualRate, 1, true)} />
            <Row
              label="Projected next 24h"
              value={usd(funding.projectedDaily, { sign: true })}
              tone={pnlTone(funding.projectedDaily)}
            />
            <Row
              label="Paid / received since open"
              value={usd(funding.netSinceOpen, { sign: true })}
              tone={pnlTone(funding.netSinceOpen)}
            />
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-mist-600">
            {funding.projectedDaily >= 0
              ? "At the current rate this position is being paid to stay open."
              : "At the current rate this position pays funding to stay open."}
          </p>
        </div>

        <div className="rounded-[18px] border border-gold-500/[0.14] bg-gold-300/[0.022] p-4 sm:p-5">
          <div className="label-xs">Margin & sizing</div>
          <div className="mt-4 space-y-3.5">
            <Row label="Margin used" value={usd(position.marginUsed)} />
            <Row label="Leverage" value={`${position.leverage}× ${position.leverageMode}`} />
            <Row label="Max leverage" value={`${position.maxLeverage}×`} />
            <Row label="Share of exposure" value={percent(position.exposureShare, 1)} />
            <Row
              label="24h market move"
              value={percent(position.dayChange, 2, true)}
              tone={pnlTone(position.dayChange)}
            />
          </div>
        </div>
      </div>

      {/* Future execution surface */}
      <div>
        <AnimatePresence initial={false} mode="wait">
          {reduceOpen ? (
            <ReducePanel key="panel" position={position} onClose={() => setReduceOpen(false)} />
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-gold-500/[0.14] bg-gold-300/[0.022] p-4"
            >
              <div className="text-[12.5px] leading-relaxed text-mist-500">
                Need to act on this? Plan a reduction — you choose the amount.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReduceOpen(true)}
                icon={<IconSpark className="h-4 w-4" />}
              >
                Reduce / Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12.5px] text-mist-500">{label}</span>
      <span className={cn("num font-mono text-[12.5px] text-mist-100", tone)}>{value}</span>
    </div>
  );
}

/** Mobile: focused full-screen position view. */
export function PositionSheet({
  position,
  onClose,
}: {
  position: Position | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!position) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [position, onClose]);

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="absolute inset-0 bg-ink-1000/85 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: "4%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "3%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 top-8 flex flex-col overflow-hidden rounded-t-[26px] border-t border-gold-500/[0.20] bg-ink-950/95"
          >
            <div className="flex items-center gap-3 border-b border-gold-500/[0.14] px-4 py-3.5">
              <AssetGlyph symbol={position.symbol} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium tracking-[0.06em] text-mist-50">
                    {position.symbol}-PERP
                  </span>
                  <Pill tone={position.side === "long" ? "jade" : "iris"}>{position.side}</Pill>
                </div>
                <div className="num mt-0.5 font-mono text-[10.5px] text-mist-500">
                  {fmtSize(position.size, position.szDecimals)} · {position.leverage}×
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close position detail"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/[0.18] text-mist-300 active:scale-95"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-10">
              <PositionDetailBody position={position} />
              <Divider className="mt-8" />
              <p className="mt-4 pb-6 text-center text-[11px] text-mist-600">
                Live Hyperliquid mainnet data · read-only
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

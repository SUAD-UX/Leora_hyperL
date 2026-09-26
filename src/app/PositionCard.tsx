import { AnimatePresence, motion } from "motion/react";
import type { Position } from "@/lib/types";
import { compactUsd, percent, price, size as fmtSize, usd } from "@/lib/format";
import { pnlTone } from "@/lib/risk";
import { AssetGlyph, Pill } from "@/components/ui/primitives";
import { DistanceReadout, RiskBadge, RiskTrack } from "@/components/ui/RiskViz";
import { IconChevron } from "@/components/ui/Icons";
import { PositionDetailBody } from "./PositionDetail";
import { cn } from "@/utils/cn";

interface PositionCardProps {
  position: Position;
  expanded: boolean;
  onToggle: () => void;
  dimmed?: boolean;
  /** When false the card never expands inline (mobile opens a sheet instead). */
  allowInline?: boolean;
  index?: number;
}

export function PositionCard({
  position,
  expanded,
  onToggle,
  dimmed = false,
  allowInline = true,
  index = 0,
}: PositionCardProps) {
  const sideTone = position.side === "long" ? "jade" : "iris";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: dimmed ? 0.55 : 1,
        y: 0,
        scale: dimmed ? 0.992 : 1,
      }}
      transition={{
        layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "glass edge-light group relative overflow-hidden rounded-[18px] transition-shadow duration-500",
        expanded
          ? "border-gold-500/[0.28] shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]"
          : "hover:border-gold-500/[0.24]",
      )}
    >
      {expanded && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(122,132,214,0.14), transparent 70%)",
          }}
        />
      )}

      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="relative w-full cursor-pointer p-4 text-left sm:p-5"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <AssetGlyph symbol={position.symbol} size={40} className="hidden sm:flex" />
          <AssetGlyph symbol={position.symbol} size={34} className="sm:hidden" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[14px] font-medium tracking-[0.06em] text-mist-50 sm:text-[15px]">
                {position.symbol}-PERP
              </span>
              <Pill tone={sideTone}>{position.side}</Pill>
              <span className="num font-mono text-[10.5px] text-mist-500">
                {position.leverage}× {position.leverageMode}
              </span>
            </div>
            <div className="num mt-1.5 font-mono text-[11.5px] text-mist-500">
              {fmtSize(position.size, position.szDecimals)} {position.symbol} ·{" "}
              {compactUsd(position.notional)}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div
              className={cn(
                "num text-[17px] tracking-tight sm:text-[20px]",
                pnlTone(position.unrealizedPnl),
              )}
            >
              {usd(position.unrealizedPnl, { sign: true })}
            </div>
            <div className={cn("num mt-1 text-[11px]", pnlTone(position.roe))}>
              {percent(position.roe, 2, true)}
            </div>
          </div>

          <IconChevron
            className={cn(
              "mt-1 hidden h-4 w-4 shrink-0 text-mist-500 transition-transform duration-500 sm:block",
              expanded && "rotate-180",
            )}
          />
        </div>

        {/* Risk row */}
        <div className="mt-4 flex items-center gap-4 sm:mt-5">
          <div className="min-w-0 flex-1">
            <RiskTrack risk={position.liquidation} compact />
            <div className="mt-1.5 hidden items-center gap-3 text-[9px] font-medium tracking-[0.18em] text-mist-600 uppercase sm:flex">
              <span>entry {price(position.entryPrice, position.szDecimals)}</span>
              <span>mark {price(position.markPrice, position.szDecimals)}</span>
              {position.liquidation.liquidationPrice && (
                <span>
                  liq {price(position.liquidation.liquidationPrice, position.szDecimals)}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <DistanceReadout risk={position.liquidation} size="sm" className="justify-end" />
            <div className="mt-1.5 flex justify-end">
              <RiskBadge level={position.liquidation.level} />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && allowInline && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gold-500/[0.16] p-4 sm:p-5 lg:p-6">
              <PositionDetailBody position={position} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/** Dense one-line representation used in the overview and risk views. */
export function PositionRow({
  position,
  onSelect,
}: {
  position: Position;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-gold-500/[0.16] hover:bg-gold-300/[0.032]"
    >
      <AssetGlyph symbol={position.symbol} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] text-mist-100">{position.symbol}</span>
          <span
            className={cn(
              "text-[9px] font-medium tracking-[0.18em] uppercase",
              position.side === "long" ? "text-jade-300" : "text-iris-300",
            )}
          >
            {position.side}
          </span>
        </div>
        <div className="num mt-0.5 font-mono text-[10.5px] text-mist-600">
          {compactUsd(position.notional)}
        </div>
      </div>
      <div className="w-20 shrink-0 sm:w-28">
        <RiskTrack risk={position.liquidation} compact />
      </div>
      <div className="w-16 shrink-0 text-right">
        <div className="num font-mono text-[12px] text-mist-200">
          {position.liquidation.distanceRatio === null
            ? "—"
            : percent(position.liquidation.distanceRatio, 1)}
        </div>
      </div>
    </button>
  );
}

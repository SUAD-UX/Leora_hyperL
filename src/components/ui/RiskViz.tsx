import { useMemo } from "react";
import type { LiquidationRisk, RiskLevel } from "@/lib/types";
import { percent, price } from "@/lib/format";
import { RISK_META } from "@/lib/risk";
import { cn } from "@/utils/cn";

/**
 * RISK TRACK — Leora's signature liquidation-distance visualisation.
 *
 * The track always reads left → right: composure → liquidation.
 * The marker position is derived from the real distance between mark price
 * and liquidation price; nothing here is decorative.
 */
export function RiskTrack({
  risk,
  compact = false,
  className,
}: {
  risk: LiquidationRisk;
  compact?: boolean;
  className?: string;
}) {
  const meta = RISK_META[risk.level];
  const hasLiq = risk.proximity !== null;
  const pos = hasLiq ? Math.min(0.985, Math.max(0.015, risk.proximity!)) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative", compact ? "h-[16px]" : "h-[22px]")}>
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full">
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(124,201,164,0.75) 0%, rgba(220,184,124,0.6) 55%, rgba(226,131,108,0.9) 100%)",
            }}
          />
        </div>

        {/* zone ticks */}
        {!compact &&
          [0.5, 0.8].map((t) => (
            <div
              key={t}
              className="absolute top-1/2 h-[9px] w-px -translate-y-1/2 bg-gold-300/25"
              style={{ left: `${t * 100}%` }}
            />
          ))}

        {hasLiq ? (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${pos * 100}%` }}
          >
            <span
              className="absolute -inset-2.5 rounded-full opacity-50 blur-[7px]"
              style={{ background: meta.hex }}
            />
            <span
              className={cn(
                "relative block rounded-full border-2 border-ink-1000",
                compact ? "h-2.5 w-2.5" : "h-[13px] w-[13px]",
              )}
              style={{
                background: "linear-gradient(145deg,#faf1de,#e9cf9d)",
                boxShadow: `0 0 0 1.5px ${meta.hex}`,
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
            <span className="rounded-full bg-ink-1000/90 px-2 py-0.5 text-[8.5px] tracking-[0.18em] text-mist-600 uppercase">
              no liquidation price
            </span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-1.5 flex items-center justify-between text-[8.5px] tracking-[0.2em] text-mist-600 uppercase">
          <span className="text-jade-300/70">Safer</span>
          <span className="hidden sm:inline">Watch</span>
          <span className={risk.level === "critical" ? "text-ember-300" : "text-ember-300/60"}>
            Liquidation
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * The full signature scale: labelled ends, marker, and the three key values.
 */
export function RiskScale({
  risk,
  markPrice,
  szDecimals,
  className,
}: {
  risk: LiquidationRisk;
  markPrice: number;
  szDecimals: number;
  className?: string;
}) {
  const meta = RISK_META[risk.level];
  const hasLiq = risk.proximity !== null;
  const pos = hasLiq ? Math.min(0.96, Math.max(0.04, risk.proximity!)) : 0.5;

  return (
    <div
      className={cn(
        "rounded-[18px] border border-gold-500/20 bg-gold-300/[0.025] px-4 py-5 sm:px-6",
        className,
      )}
    >
      <div className="flex items-center justify-between text-[9px] tracking-[0.2em] uppercase">
        <span className="text-jade-300/80">Safer</span>
        <span className="text-mist-100">Mark</span>
        <span className="text-ember-300/80">Liquidation</span>
      </div>

      <div className="relative mt-6 h-[2px] w-full rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(124,201,164,0.8) 0%, rgba(220,184,124,0.65) 55%, rgba(226,131,108,0.95) 100%)",
          }}
        />
        {/* liquidation end tick */}
        <span className="absolute top-1/2 right-0 h-3 w-[2px] -translate-y-1/2 rounded-full bg-ember-400" />

        {hasLiq && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${pos * 100}%` }}
          >
            <span
              className="absolute -inset-3 rounded-full opacity-55 blur-[9px]"
              style={{ background: meta.hex }}
            />
            <span
              className="relative block h-3.5 w-3.5 rounded-full border-2 border-ink-1000"
              style={{
                background: "linear-gradient(145deg,#faf1de,#e9cf9d)",
                boxShadow: `0 0 0 1.5px ${meta.hex}`,
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <div className="label-xs">Liquidation</div>
          <div className="num mt-1 font-mono text-[12.5px] text-ember-300">
            {risk.liquidationPrice ? price(risk.liquidationPrice, szDecimals) : "—"}
          </div>
        </div>
        <div className="text-center">
          <div className={cn("num text-[26px] leading-none", meta.text)}>
            {risk.distanceRatio === null ? "—" : percent(risk.distanceRatio, 1)}
          </div>
          <div className="label-xs mt-1.5">away</div>
        </div>
        <div className="text-right">
          <div className="label-xs">Mark</div>
          <div className="num mt-1 font-mono text-[12.5px] text-mist-100">
            {price(markPrice, szDecimals)}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Distance headline used next to the track. */
export function DistanceReadout({
  risk,
  size = "md",
  className,
}: {
  risk: LiquidationRisk;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = RISK_META[risk.level];
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "num",
          meta.text,
          size === "sm" && "text-[17px]",
          size === "md" && "text-[24px]",
          size === "lg" && "text-[38px]",
        )}
      >
        {risk.distanceRatio === null ? "—" : percent(risk.distanceRatio, 1)}
      </span>
      <span className="label-xs whitespace-nowrap">
        <span className="sm:hidden">to liq.</span>
        <span className="hidden sm:inline">to liquidation</span>
      </span>
    </div>
  );
}

export function RiskBadge({
  level,
  className,
  label,
}: {
  level: RiskLevel;
  className?: string;
  label?: string;
}) {
  const meta = RISK_META[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium tracking-[0.18em] uppercase",
        meta.border,
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {label ?? meta.label}
    </span>
  );
}

/**
 * PRICE SCALE — where mark sits between entry and liquidation, on a real axis.
 */
export function PriceScale({
  entry,
  mark,
  liquidation,
  side,
  szDecimals,
  className,
}: {
  entry: number;
  mark: number;
  liquidation: number | null;
  side: "long" | "short";
  szDecimals: number;
  className?: string;
}) {
  const model = useMemo(() => {
    const anchors = [entry, mark, liquidation].filter(
      (v): v is number => typeof v === "number" && v > 0,
    );
    if (!anchors.length) return null;
    let lo = Math.min(...anchors);
    let hi = Math.max(...anchors);
    const pad = (hi - lo || hi * 0.04) * 0.22;
    lo -= pad;
    hi += pad;
    const at = (v: number) => ((v - lo) / (hi - lo)) * 100;
    return { lo, hi, at };
  }, [entry, mark, liquidation]);

  if (!model) return null;

  const markers = [
    { key: "entry", label: "Entry", value: entry, tone: "text-mist-300", color: "#a8a59e" },
    { key: "mark", label: "Mark", value: mark, tone: "text-gold-200", color: "#e9cf9d" },
    ...(liquidation
      ? [
          {
            key: "liq",
            label: "Liquidation",
            value: liquidation,
            tone: "text-ember-300",
            color: "#e2836c",
          },
        ]
      : []),
  ].sort((a, b) => a.value - b.value);

  return (
    <div className={cn("relative pt-9 pb-8", className)}>
      <div className="relative h-[2px] w-full rounded-full bg-gradient-to-r from-gold-500/10 via-gold-500/25 to-gold-500/10">
        {liquidation && (
          <div
            className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
            style={{
              left: `${Math.min(model.at(mark), model.at(liquidation))}%`,
              width: `${Math.abs(model.at(mark) - model.at(liquidation))}%`,
              background: "linear-gradient(90deg, rgba(226,131,108,0.2), rgba(226,131,108,0.65))",
            }}
          />
        )}

        {markers.map((m, i) => {
          const left = Math.min(98, Math.max(2, model.at(m.value)));
          const above = i % 2 === 0;
          return (
            <div key={m.key} className="absolute top-1/2" style={{ left: `${left}%` }}>
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-1000"
                style={{ background: m.color }}
              />
              <span
                className="absolute h-6 w-px -translate-x-1/2 bg-gold-500/20"
                style={above ? { bottom: "8px" } : { top: "8px" }}
              />
              <div
                className={cn(
                  "absolute -translate-x-1/2 text-center whitespace-nowrap",
                  above ? "bottom-8" : "top-8",
                )}
              >
                <div className="label-xs">{m.label}</div>
                <div className={cn("num mt-0.5 text-[12px]", m.tone)}>
                  {price(m.value, szDecimals)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 text-center text-[8.5px] tracking-[0.2em] text-mist-600 uppercase">
        {side === "long" ? "price falls → liquidation" : "price rises → liquidation"}
      </div>
    </div>
  );
}

/** Account health arc — maintenance margin consumed vs. equity. */
export function HealthArc({
  ratio,
  level,
  label,
  caption,
  size = 168,
}: {
  ratio: number;
  level: RiskLevel;
  label: string;
  caption?: string;
  size?: number;
}) {
  const meta = RISK_META[level];
  const clamped = Math.min(1, Math.max(0, ratio));
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const arc = 0.74;
  const dash = c * arc;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[223deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(233,207,157,0.10)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.hex}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash * clamped} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className={cn("num text-[30px] leading-none", meta.text)}>{label}</div>
        {caption ? (
          <div className="mt-2 max-w-[116px] text-[8.5px] leading-relaxed tracking-[0.16em] text-mist-500 uppercase">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Long / short exposure split. */
export function ExposureSplit({
  longNotional,
  shortNotional,
  className,
}: {
  longNotional: number;
  shortNotional: number;
  className?: string;
}) {
  const total = longNotional + shortNotional;
  const longPct = total > 0 ? (longNotional / total) * 100 : 50;
  return (
    <div className={className}>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gold-300/[0.07]">
        <div
          className="h-full rounded-l-full transition-all duration-700"
          style={{
            width: `${longPct}%`,
            background: "linear-gradient(90deg, rgba(79,169,129,0.7), rgba(124,201,164,0.9))",
          }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-700"
          style={{
            width: `${100 - longPct}%`,
            background: "linear-gradient(90deg, rgba(199,157,93,0.7), rgba(233,207,157,0.85))",
          }}
        />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[9px] tracking-[0.18em] text-mist-500 uppercase">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-jade-400" />
          long {total > 0 ? Math.round(longPct) : 0}%
        </span>
        <span className="flex items-center gap-1.5">
          short {total > 0 ? 100 - Math.round(longPct) : 0}%
          <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
        </span>
      </div>
    </div>
  );
}

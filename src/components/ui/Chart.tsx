import { useId, useMemo, useState } from "react";
import type { PortfolioPoint } from "@/lib/types";
import { clockTime, compactUsd, dayLabel } from "@/lib/format";
import { cn } from "@/utils/cn";

interface ChartProps {
  points: PortfolioPoint[];
  className?: string;
  height?: number;
  tone?: "auto" | "neutral" | "gold";
  interactive?: boolean;
  showGrid?: boolean;
  valueFormat?: (v: number) => string;
  baseline?: number;
}

/**
 * Compact area/line chart used for equity and PnL series.
 * Pure SVG, no chart library — keeps the bundle light and the motion custom.
 */
export function Chart({
  points,
  className,
  height = 140,
  tone = "auto",
  interactive = false,
  showGrid = false,
  valueFormat = (v) => compactUsd(v),
  baseline,
}: ChartProps) {
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const model = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => p.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.12 || Math.abs(max || 1) * 0.02;
    const lo = min - pad;
    const hi = max + pad;
    const w = 1000;
    const h = 320;
    const xs = (i: number) => (i / (points.length - 1)) * w;
    const ys = (v: number) => h - ((v - lo) / (hi - lo || 1)) * h;
    const coords = points.map((p, i) => [xs(i), ys(p.v)] as const);

    // Catmull-Rom style smoothing for an elegant, calm line.
    let d = `M ${coords[0][0]} ${coords[0][1]}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x0, y0] = coords[Math.max(0, i - 1)];
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      const [x3, y3] = coords[Math.min(coords.length - 1, i + 2)];
      const c1x = x1 + (x2 - x0) / 6;
      const c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6;
      const c2y = y2 - (y3 - y1) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
    }
    const area = `${d} L ${w} ${h} L 0 ${h} Z`;
    const rising = values[values.length - 1] >= values[0];
    const zeroY = baseline !== undefined ? ys(baseline) : null;
    return { d, area, rising, w, h, coords, lo, hi, zeroY };
  }, [points, baseline]);

  if (!model) {
    return (
      <div
        className={cn("flex items-center justify-center text-[11px] text-mist-600", className)}
        style={{ height }}
      >
        Not enough data yet
      </div>
    );
  }

  const color =
    tone === "gold"
      ? "#dcb87c"
      : tone === "neutral"
        ? "#a8a59e"
        : model.rising
          ? "#7cc9a4"
          : "#e2836c";

  const hoverPoint = hover !== null ? points[hover] : null;
  const hoverCoord = hover !== null ? model.coords[hover] : null;

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${model.w} ${model.h}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
        onMouseMove={
          interactive
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const idx = Math.round(ratio * (points.length - 1));
                setHover(Math.max(0, Math.min(points.length - 1, idx)));
              }
            : undefined
        }
        onTouchMove={
          interactive
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.touches[0].clientX - rect.left) / rect.width;
                const idx = Math.round(ratio * (points.length - 1));
                setHover(Math.max(0, Math.min(points.length - 1, idx)));
              }
            : undefined
        }
      >
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {showGrid &&
          [0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={model.w}
              y1={model.h * g}
              y2={model.h * g}
              stroke="rgba(233,207,157,0.07)"
              strokeWidth="1"
            />
          ))}

        {model.zeroY !== null && (
          <line
            x1="0"
            x2={model.w}
            y1={model.zeroY}
            y2={model.zeroY}
            stroke="rgba(233,207,157,0.2)"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        )}

        <path d={model.area} fill={`url(#fill-${uid})`} />
        <path
          d={model.d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 0,
            animation: "leora-draw 1.4s cubic-bezier(0.22,1,0.36,1) both",
          }}
        />

        {hoverCoord && (
          <line
            x1={hoverCoord[0]}
            x2={hoverCoord[0]}
            y1="0"
            y2={model.h}
            stroke="rgba(233,207,157,0.28)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Markers live in HTML so they stay perfectly round inside the stretched viewBox */}
      <span
        className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "100%",
          top: `${(model.coords[model.coords.length - 1][1] / model.h) * 100}%`,
          background: color,
          boxShadow: `0 0 0 4px ${color}22`,
        }}
      />
      {hoverCoord && (
        <span
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-100"
          style={{
            left: `${(hoverCoord[0] / model.w) * 100}%`,
            top: `${(hoverCoord[1] / model.h) * 100}%`,
          }}
        />
      )}

      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-gold-500/25 bg-ink-900/92 px-2.5 py-1.5 backdrop-blur-md"
          style={{
            left: `${(hover! / (points.length - 1)) * 100}%`,
          }}
        >
          <div className="num text-[12px] text-mist-50">{valueFormat(hoverPoint.v)}</div>
          <div className="num text-[10px] text-mist-500">
            {Date.now() - hoverPoint.t > 86400000
              ? dayLabel(hoverPoint.t)
              : clockTime(hoverPoint.t)}
          </div>
        </div>
      )}
    </div>
  );
}

/** Minimal sparkline for dense layouts (cards, rows, mobile). */
export function Sparkline({
  points,
  className,
  stroke,
  height = 34,
}: {
  points: number[];
  className?: string;
  stroke?: string;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  if (points.length < 2) return <div className={className} style={{ height }} />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const w = 100;
  const h = 32;
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const color = stroke ?? (points[points.length - 1] >= points[0] ? "#63ddb3" : "#f4836c");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#spark-${uid})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

import { useId } from "react";
import { cn } from "@/utils/cn";

/**
 * LEORA mark — a geometric "L": a capped vertical stem resolving into a
 * scooped bowl. Rendered in champagne, optionally inside a thin gold frame.
 */
const L_OUTLINE =
  "M8.8 10.8 A3.1 3.1 0 0 1 15 10.8 L15 19.2 L23.2 19.2 A7.2 5.1 0 0 1 8.8 19.2 Z";
const L_BOWL = "M8.8 19.2 L23.2 19.2 A7.2 5.1 0 0 1 8.8 19.2 Z";

export function LeoraMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, "");
  const body = `lb-${uid}`;
  const shade = `ls-${uid}`;

  return (
    <svg viewBox="0 0 32 32" style={style} className={cn("h-7 w-7", className)} aria-hidden>
      <defs>
        <linearGradient id={body} x1="9" y1="7" x2="22" y2="24.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#faf1de" />
          <stop offset="50%" stopColor="#e9cf9d" />
          <stop offset="100%" stopColor="#c79d5d" />
        </linearGradient>
        <linearGradient id={shade} x1="8.8" y1="0" x2="19" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c5c31" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#a67e45" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#a67e45" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={L_OUTLINE} fill={`url(#${body})`} />
      <path d={L_BOWL} fill={`url(#${shade})`} />
    </svg>
  );
}

/** The mark inside a thin champagne frame — the primary brand lockup element. */
export function LeoraSeal({ className, size = 38 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[9px]",
        "border border-gold-500/45 bg-gradient-to-br from-gold-300/[0.10] to-transparent",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[3px] rounded-[6px] border border-gold-500/20" />
      <LeoraMark style={{ width: size * 0.52, height: size * 0.52 }} className="relative" />
    </span>
  );
}

export function Wordmark({
  className,
  size = 34,
  letter = "text-[15px] tracking-[0.42em]",
  subtitle,
}: {
  className?: string;
  size?: number;
  letter?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LeoraSeal size={size} />
      <div className="leading-none">
        <div className={cn("font-display gold-text font-medium", letter)}>LEORA</div>
        {subtitle ? (
          <div className="mt-1.5 text-[8.5px] font-medium tracking-[0.26em] text-mist-500 uppercase">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

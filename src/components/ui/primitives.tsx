import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ---------------------------------------------------------------- */
/* Surfaces                                                          */
/* ---------------------------------------------------------------- */

export function Panel({
  children,
  className,
  tone = "glass",
  edge = true,
  ...rest
}: {
  children?: ReactNode;
  className?: string;
  tone?: "glass" | "deep" | "soft";
  edge?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "relative overflow-hidden rounded-[20px]",
        tone === "glass" && "glass",
        tone === "deep" && "glass-deep",
        tone === "soft" && "glass-soft",
        edge && "edge-light",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  className,
  gold = false,
}: {
  children: ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return <div className={cn(gold ? "label-gold" : "label-xs", className)}>{children}</div>;
}

/** Serif headline with an optional gold italic second line. */
export function Headline({
  lead,
  accent,
  className,
  size = "lg",
}: {
  lead: ReactNode;
  accent?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <h2
      className={cn(
        "display-xl text-mist-50",
        size === "sm" && "text-[26px] sm:text-[32px]",
        size === "md" && "text-[30px] sm:text-[40px]",
        size === "lg" && "text-[34px] sm:text-[46px]",
        size === "xl" && "text-[38px] sm:text-[56px] lg:text-[64px]",
        className,
      )}
    >
      {lead}
      {accent ? (
        <>
          {" "}
          <span className="gold-text italic">{accent}</span>
        </>
      ) : null}
    </h2>
  );
}

/* ---------------------------------------------------------------- */
/* Buttons                                                           */
/* ---------------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  trailing,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap",
        "font-medium tracking-[0.08em] uppercase transition-all duration-300 ease-out outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-gold-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-1000",
        "disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" && "h-9 px-4 text-[11px]",
        size === "md" && "h-11 px-5 text-[12px]",
        size === "lg" && "h-[52px] px-8 text-[13px]",
        variant === "primary" && [
          "text-ink-1000",
          "bg-[linear-gradient(145deg,#faf1de_0%,#e9cf9d_42%,#d3ab6d_100%)]",
          "shadow-[0_10px_34px_-12px_rgba(220,184,124,0.75)]",
          "hover:shadow-[0_14px_44px_-12px_rgba(233,207,157,0.95)] hover:brightness-[1.04]",
          "active:scale-[0.985]",
        ],
        variant === "outline" &&
          "border border-gold-500/35 text-gold-200 hover:border-gold-400/60 hover:bg-gold-300/[0.06] active:scale-[0.985]",
        variant === "subtle" &&
          "bg-gold-300/[0.06] text-mist-200 hover:bg-gold-300/[0.11] hover:text-gold-100",
        variant === "ghost" && "text-mist-400 hover:text-gold-200",
        className,
      )}
    >
      {icon}
      {children}
      {trailing}
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Pills / chips                                                     */
/* ---------------------------------------------------------------- */

export function Pill({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "gold" | "jade" | "sand" | "ember" | "iris";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-[9.5px] font-medium tracking-[0.2em] uppercase",
        tone === "neutral" && "border-gold-500/20 bg-gold-300/[0.04] text-mist-300",
        tone === "gold" && "border-gold-500/35 bg-gold-300/[0.07] text-gold-200",
        tone === "jade" && "border-jade-400/25 bg-jade-400/10 text-jade-300",
        tone === "sand" && "border-sand-400/28 bg-sand-400/10 text-sand-300",
        tone === "ember" && "border-ember-400/28 bg-ember-400/10 text-ember-300",
        tone === "iris" && "border-iris-400/28 bg-iris-400/10 text-iris-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LiveDot({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <span className={cn("relative flex h-1.5 w-1.5", className)}>
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-60" />
      )}
      <span
        className={cn(
          "relative inline-flex h-1.5 w-1.5 rounded-full",
          active ? "bg-gold-300" : "bg-mist-600",
        )}
      />
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Data display                                                      */
/* ---------------------------------------------------------------- */

export function Metric({
  label,
  value,
  sub,
  align = "left",
  valueClass,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  align?: "left" | "right";
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={cn(align === "right" && "text-right", className)}>
      <div className="label-xs">{label}</div>
      <div className={cn("num mt-1.5 text-[19px] text-mist-50", valueClass)}>
        {value}
      </div>
      {sub ? <div className="num mt-1 text-[11px] text-mist-500">{sub}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-gold-300/[0.05]", className)}>
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-gold-300/[0.09] to-transparent" />
    </div>
  );
}

export function AssetGlyph({
  symbol,
  size = 36,
  className,
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const letters = symbol.replace(/[^A-Z0-9]/gi, "").slice(0, 3).toUpperCase();
  // Deterministic warm hue per asset so each keeps a stable identity.
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) % 360;
  const hue = 28 + (hash % 26);
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-[10px] border border-gold-500/25",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, hsla(${hue},52%,64%,0.20), hsla(${hue - 12},38%,32%,0.05))`,
      }}
    >
      <span
        className="font-mono text-gold-200"
        style={{ fontSize: Math.max(9, size * 0.29), letterSpacing: "0.02em" }}
      >
        {letters}
      </span>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-gold-500/15 bg-gold-300/[0.03] p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full font-medium tracking-[0.1em] uppercase transition-all duration-300",
              size === "sm" ? "px-3 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]",
              active
                ? "bg-gold-300/[0.13] text-gold-100 shadow-[inset_0_1px_0_rgba(250,241,222,0.16)]"
                : "text-mist-500 hover:text-mist-200",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-gold-500/[0.12]", className)} />;
}

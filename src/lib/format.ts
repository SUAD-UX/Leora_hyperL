/** Presentation-only formatting helpers. No business logic lives here. */

const abs = Math.abs;

export function usd(value: number, opts: { decimals?: number; sign?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const decimals = opts.decimals ?? (abs(value) >= 1000 ? 0 : 2);
  const formatted = abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = value < 0 ? "−" : opts.sign ? "+" : "";
  return `${sign}$${formatted}`;
}

export function compactUsd(value: number, opts: { sign?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "—";
  const a = abs(value);
  const sign = value < 0 ? "−" : opts.sign ? "+" : "";
  if (a >= 1_000_000_000) return `${sign}$${(a / 1_000_000_000).toFixed(2)}B`;
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 10_000) return `${sign}$${(a / 1000).toFixed(1)}K`;
  return usd(value, { sign: opts.sign });
}

export function price(value: number, szDecimals = 2): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  const a = abs(value);
  let decimals = 2;
  if (a < 0.01) decimals = 6;
  else if (a < 1) decimals = 4;
  else if (a < 100) decimals = 3;
  else decimals = szDecimals >= 4 ? 2 : 1;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function size(value: number, szDecimals = 4): string {
  if (!Number.isFinite(value)) return "—";
  const decimals = Math.min(szDecimals, abs(value) >= 1000 ? 2 : 6);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function percent(fraction: number, decimals = 2, sign = false): string {
  if (!Number.isFinite(fraction)) return "—";
  const v = fraction * 100;
  const s = v < 0 ? "−" : sign ? "+" : "";
  return `${s}${abs(v).toFixed(decimals)}%`;
}

export function shortAddress(address: string, size = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + size)}···${address.slice(-size)}`;
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function dayLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

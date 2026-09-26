import type { AccountSnapshot, Position, RiskLevel } from "@/lib/types";
import { ACCOUNT_RISK_THRESHOLDS } from "@/services/config";
import { compactUsd, percent } from "@/lib/format";

/**
 * In-session alert engine.
 *
 * Alerts are derived by diffing two consecutive account snapshots, so every
 * alert corresponds to a real transition in live Hyperliquid data. Nothing is
 * scheduled, invented, or persisted server-side — this layer is pure.
 */

export type AlertKind = "risk" | "funding" | "position" | "account";
export type AlertLevel = "info" | "attention" | "critical";

export interface LeoraAlert {
  id: string;
  kind: AlertKind;
  level: AlertLevel;
  title: string;
  detail: string;
  symbol?: string;
  time: number;
  read: boolean;
}

const RANK: Record<RiskLevel, number> = { unknown: 0, healthy: 1, attention: 2, critical: 3 };

function makeId(parts: (string | number)[]) {
  return parts.join(":");
}

function riskAlert(position: Position, from: RiskLevel, to: RiskLevel, now: number): LeoraAlert {
  const worsening = RANK[to] > RANK[from];
  const distance =
    position.liquidation.distanceRatio !== null
      ? percent(position.liquidation.distanceRatio, 1)
      : "—";

  if (!worsening) {
    return {
      id: makeId(["risk", position.id, to, now]),
      kind: "risk",
      level: "info",
      title: `${position.symbol} is back to healthy`,
      detail: `Distance to liquidation recovered to ${distance}.`,
      symbol: position.symbol,
      time: now,
      read: false,
    };
  }

  return {
    id: makeId(["risk", position.id, to, now]),
    kind: "risk",
    level: to === "critical" ? "critical" : "attention",
    title:
      to === "critical"
        ? `${position.symbol} is close to liquidation`
        : `${position.symbol} needs attention`,
    detail: `Only ${distance} of room left on your ${position.side}.`,
    symbol: position.symbol,
    time: now,
    read: false,
  };
}

/** Compare two snapshots and produce alerts for the transitions between them. */
export function deriveAlerts(
  prev: AccountSnapshot | null,
  next: AccountSnapshot,
): LeoraAlert[] {
  // First load establishes a baseline — never fire a burst on connect.
  if (!prev) return [];
  if (prev.address !== next.address) return [];

  const now = next.fetchedAt;
  const out: LeoraAlert[] = [];
  const prevById = new Map(prev.positions.map((p) => [p.id, p]));
  const nextById = new Map(next.positions.map((p) => [p.id, p]));

  for (const position of next.positions) {
    const before = prevById.get(position.id);

    if (!before) {
      out.push({
        id: makeId(["open", position.id, now]),
        kind: "position",
        level: "info",
        title: `Opened ${position.side} ${position.symbol}`,
        detail: `${compactUsd(position.notional)} exposure at ${position.leverage}× ${position.leverageMode}.`,
        symbol: position.symbol,
        time: now,
        read: false,
      });
      continue;
    }

    // Liquidation risk band changed
    const from = before.liquidation.level;
    const to = position.liquidation.level;
    if (from !== to && RANK[from] > 0 && RANK[to] > 0) {
      if (RANK[to] > RANK[from] || to === "healthy") {
        out.push(riskAlert(position, from, to, now));
      }
    }

    // Funding direction flipped on a materially sized position
    const wasPaying = before.funding.projectedDaily < 0;
    const isPaying = position.funding.projectedDaily < 0;
    if (wasPaying !== isPaying && Math.abs(position.funding.projectedDaily) > 1) {
      out.push({
        id: makeId(["funding", position.id, isPaying ? "pay" : "earn", now]),
        kind: "funding",
        level: isPaying ? "attention" : "info",
        title: isPaying
          ? `${position.symbol} now pays funding`
          : `${position.symbol} now earns funding`,
        detail: `${compactUsd(Math.abs(position.funding.projectedDaily))} per day at the current rate.`,
        symbol: position.symbol,
        time: now,
        read: false,
      });
    }
  }

  // Positions that disappeared were closed
  for (const before of prev.positions) {
    if (!nextById.has(before.id)) {
      out.push({
        id: makeId(["close", before.id, now]),
        kind: "position",
        level: "info",
        title: `Closed ${before.symbol}`,
        detail: `The ${before.side} position is no longer open.`,
        symbol: before.symbol,
        time: now,
        read: false,
      });
    }
  }

  // Account-level margin health crossings
  const bands = (ratio: number) =>
    ratio >= ACCOUNT_RISK_THRESHOLDS.critical
      ? 2
      : ratio >= ACCOUNT_RISK_THRESHOLDS.attention
        ? 1
        : 0;
  const beforeBand = bands(prev.summary.marginRatio);
  const afterBand = bands(next.summary.marginRatio);
  if (afterBand !== beforeBand) {
    const worsened = afterBand > beforeBand;
    out.push({
      id: makeId(["account", afterBand, now]),
      kind: "account",
      level: afterBand === 2 ? "critical" : afterBand === 1 ? "attention" : "info",
      title: worsened ? "Account margin is tightening" : "Account margin eased",
      detail: `Maintenance margin is now ${percent(next.summary.marginRatio, 1)} of equity.`,
      time: now,
      read: false,
    });
  }

  return out;
}

export const ALERT_ACCENT: Record<AlertLevel, { text: string; dot: string; border: string }> = {
  info: { text: "text-mist-200", dot: "bg-gold-400", border: "border-gold-500/20" },
  attention: { text: "text-sand-300", dot: "bg-sand-400", border: "border-sand-400/28" },
  critical: { text: "text-ember-300", dot: "bg-ember-400", border: "border-ember-400/30" },
};

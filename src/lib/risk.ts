import type { AccountSummary, Position, RiskLevel } from "@/lib/types";
import { ACCOUNT_RISK_THRESHOLDS } from "@/services/config";

export interface RiskMeta {
  level: RiskLevel;
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  hex: string;
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  healthy: {
    level: "healthy",
    label: "Healthy",
    text: "text-jade-300",
    bg: "bg-jade-400/10",
    border: "border-jade-400/25",
    dot: "bg-jade-400",
    hex: "#7cc9a4",
  },
  attention: {
    level: "attention",
    label: "Attention",
    text: "text-sand-300",
    bg: "bg-sand-400/10",
    border: "border-sand-400/28",
    dot: "bg-sand-400",
    hex: "#dcae6a",
  },
  critical: {
    level: "critical",
    label: "High risk",
    text: "text-ember-300",
    bg: "bg-ember-400/12",
    border: "border-ember-400/30",
    dot: "bg-ember-400",
    hex: "#e2836c",
  },
  unknown: {
    level: "unknown",
    label: "No liq. price",
    text: "text-mist-300",
    bg: "bg-gold-300/[0.06]",
    border: "border-gold-500/15",
    dot: "bg-mist-400",
    hex: "#a8a59e",
  },
};

export function accountRiskLevel(summary: AccountSummary): RiskLevel {
  if (summary.totalNotional <= 0) return "healthy";
  if (summary.marginRatio >= ACCOUNT_RISK_THRESHOLDS.critical) return "critical";
  if (summary.marginRatio >= ACCOUNT_RISK_THRESHOLDS.attention) return "attention";
  return "healthy";
}

/** The position closest to liquidation — Leora's headline risk answer. */
export function mostAtRisk(positions: Position[]): Position | null {
  const withLiq = positions.filter((p) => p.liquidation.distanceRatio !== null);
  if (!withLiq.length) return null;
  return withLiq.reduce((worst, p) =>
    (p.liquidation.distanceRatio ?? 1) < (worst.liquidation.distanceRatio ?? 1) ? p : worst,
  );
}

export function riskHeadline(positions: Position[], summary: AccountSummary): string {
  if (!positions.length) return "No exposure";
  const worst = mostAtRisk(positions);
  if (!worst || worst.liquidation.distanceRatio === null) {
    return summary.accountLeverage > 5 ? "Elevated leverage" : "Comfortable";
  }
  const level = worst.liquidation.level;
  if (level === "critical") return "Close to liquidation";
  if (level === "attention") return "Worth watching";
  return "Comfortable";
}

export function pnlTone(value: number): string {
  if (value > 0) return "text-jade-300";
  if (value < 0) return "text-ember-300";
  return "text-mist-200";
}

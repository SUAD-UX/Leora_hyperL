import type {
  AccountSummary,
  ActivityFill,
  FundingEvent,
  LiquidationRisk,
  MarketQuote,
  PerformanceSeries,
  PortfolioRange,
  Position,
  RiskLevel,
} from "@/lib/types";
import { RISK_THRESHOLDS } from "@/services/config";
import type {
  RawAssetPosition,
  RawClearinghouseState,
  RawFill,
  RawFundingEntry,
  RawMetaAndAssetCtxs,
  RawPortfolio,
} from "./raw";

const num = (v: string | number | null | undefined): number => {
  const n = typeof v === "number" ? v : parseFloat(v ?? "0");
  return Number.isFinite(n) ? n : 0;
};

export function adaptMarkets(raw: RawMetaAndAssetCtxs): Map<string, MarketQuote> {
  const map = new Map<string, MarketQuote>();
  const [meta, ctxs] = raw;
  meta.universe.forEach((asset, i) => {
    const ctx = ctxs[i];
    if (!ctx) return;
    const mark = num(ctx.markPx);
    const prev = num(ctx.prevDayPx);
    map.set(asset.name, {
      symbol: asset.name,
      markPrice: mark,
      oraclePrice: num(ctx.oraclePx),
      prevDayPrice: prev,
      dayChange: prev > 0 ? (mark - prev) / prev : 0,
      dayNotionalVolume: num(ctx.dayNtlVlm),
      openInterest: num(ctx.openInterest) * mark,
      fundingHourly: num(ctx.funding),
      szDecimals: asset.szDecimals,
      maxLeverage: asset.maxLeverage,
    });
  });
  return map;
}

/** Distance-to-liquidation model — the signature Leora computation. */
export function buildLiquidationRisk(
  markPrice: number,
  liquidationPrice: number | null,
): LiquidationRisk {
  if (!liquidationPrice || liquidationPrice <= 0 || markPrice <= 0) {
    return {
      level: "unknown",
      liquidationPrice: liquidationPrice && liquidationPrice > 0 ? liquidationPrice : null,
      priceDistance: null,
      distanceRatio: null,
      proximity: null,
    };
  }
  const priceDistance = Math.abs(markPrice - liquidationPrice);
  const distanceRatio = priceDistance / markPrice;

  let level: RiskLevel = "healthy";
  if (distanceRatio < RISK_THRESHOLDS.critical) level = "critical";
  else if (distanceRatio < RISK_THRESHOLDS.attention) level = "attention";

  // Proximity is normalised against a 50% move so the track stays readable
  // for both calm and stressed positions.
  const proximity = Math.min(1, Math.max(0, 1 - distanceRatio / 0.5));

  return { level, liquidationPrice, priceDistance, distanceRatio, proximity };
}

function adaptPosition(
  raw: RawAssetPosition,
  markets: Map<string, MarketQuote>,
  totalNotional: number,
): Position {
  const p = raw.position;
  const signedSize = num(p.szi);
  const side = signedSize >= 0 ? "long" : "short";
  const size = Math.abs(signedSize);
  const market = markets.get(p.coin);
  const notional = num(p.positionValue);
  const markPrice = market?.markPrice ?? (size > 0 ? notional / size : 0);
  const entryPrice = num(p.entryPx);
  const liq = buildLiquidationRisk(markPrice, p.liquidationPx ? num(p.liquidationPx) : null);

  const hourlyRate = market?.fundingHourly ?? 0;
  const directional = side === "long" ? -1 : 1; // positive rate ⇒ longs pay
  const projectedDaily = notional * hourlyRate * 24 * directional;

  return {
    id: `${p.coin}-${side}`,
    symbol: p.coin,
    side,
    signedSize,
    size,
    entryPrice,
    markPrice,
    notional,
    unrealizedPnl: num(p.unrealizedPnl),
    roe: num(p.returnOnEquity),
    marginUsed: num(p.marginUsed),
    leverage: num(p.leverage?.value),
    leverageMode: p.leverage?.type === "isolated" ? "isolated" : "cross",
    maxLeverage: p.maxLeverage ?? market?.maxLeverage ?? 0,
    liquidation: liq,
    funding: {
      hourlyRate,
      annualRate: hourlyRate * 24 * 365,
      // cumFunding is expressed as funding *paid*; invert for PnL impact.
      netSinceOpen: -num(p.cumFunding?.sinceOpen),
      projectedDaily,
    },
    szDecimals: market?.szDecimals ?? 4,
    exposureShare: totalNotional > 0 ? notional / totalNotional : 0,
    dayChange: market?.dayChange ?? 0,
  };
}

export function adaptPositions(
  state: RawClearinghouseState,
  markets: Map<string, MarketQuote>,
): Position[] {
  const totalNotional = state.assetPositions.reduce(
    (acc, p) => acc + num(p.position.positionValue),
    0,
  );
  return state.assetPositions
    .map((p) => adaptPosition(p, markets, totalNotional))
    .filter((p) => p.size > 0)
    .sort((a, b) => b.notional - a.notional);
}

export function adaptSummary(
  state: RawClearinghouseState,
  positions: Position[],
  fills: ActivityFill[],
): AccountSummary {
  const accountValue = num(state.marginSummary.accountValue);
  const totalNotional = num(state.marginSummary.totalNtlPos);
  const maintenance = num(state.crossMaintenanceMarginUsed);
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = fills.filter((f) => f.time >= dayAgo);

  let longNotional = 0;
  let shortNotional = 0;
  let unrealized = 0;
  let netFunding = 0;
  let projectedFunding = 0;
  for (const p of positions) {
    if (p.side === "long") longNotional += p.notional;
    else shortNotional += p.notional;
    unrealized += p.unrealizedPnl;
    netFunding += p.funding.netSinceOpen;
    projectedFunding += p.funding.projectedDaily;
  }

  return {
    accountValue,
    withdrawable: num(state.withdrawable),
    totalNotional,
    totalMarginUsed: num(state.marginSummary.totalMarginUsed),
    maintenanceMarginUsed: maintenance,
    marginRatio: accountValue > 0 ? maintenance / accountValue : 0,
    accountLeverage: accountValue > 0 ? totalNotional / accountValue : 0,
    unrealizedPnl: unrealized,
    realizedPnl24h: recent.reduce((acc, f) => acc + f.closedPnl, 0),
    fees24h: recent.reduce((acc, f) => acc + f.fee, 0),
    netFundingSinceOpen: netFunding,
    projectedDailyFunding: projectedFunding,
    longNotional,
    shortNotional,
    openPositions: positions.length,
  };
}

export function adaptFills(raw: RawFill[]): ActivityFill[] {
  return raw
    .map((f) => {
      const price = num(f.px);
      const size = num(f.sz);
      return {
        id: `${f.tid}`,
        symbol: f.coin,
        direction: f.dir,
        side: f.side === "B" ? ("buy" as const) : ("sell" as const),
        price,
        size,
        notional: price * size,
        closedPnl: num(f.closedPnl),
        fee: num(f.fee),
        time: f.time,
      };
    })
    .sort((a, b) => b.time - a.time);
}

export function adaptFunding(raw: RawFundingEntry[]): FundingEvent[] {
  return raw
    .map((f, i) => ({
      id: `${f.time}-${f.delta.coin}-${i}`,
      symbol: f.delta.coin,
      amount: num(f.delta.usdc),
      rate: num(f.delta.fundingRate),
      size: num(f.delta.szi),
      time: f.time,
    }))
    .sort((a, b) => b.time - a.time);
}

const RANGES: PortfolioRange[] = ["day", "week", "month", "allTime"];

function emptySeries(range: PortfolioRange): PerformanceSeries {
  return { range, equity: [], pnl: [], volume: 0, netPnl: 0, returnRatio: 0 };
}

export function adaptPerformance(raw: RawPortfolio): Record<PortfolioRange, PerformanceSeries> {
  const byKey = new Map(raw.map(([key, value]) => [key, value]));
  const out = {} as Record<PortfolioRange, PerformanceSeries>;

  for (const range of RANGES) {
    const win = byKey.get(range) ?? byKey.get(`perp${range[0].toUpperCase()}${range.slice(1)}`);
    if (!win) {
      out[range] = emptySeries(range);
      continue;
    }
    const equity = (win.accountValueHistory ?? []).map(([t, v]) => ({ t, v: num(v) }));
    const pnl = (win.pnlHistory ?? []).map(([t, v]) => ({ t, v: num(v) }));
    const netPnl = pnl.length ? pnl[pnl.length - 1].v - pnl[0].v : 0;
    const startEquity = equity.length ? equity[0].v : 0;
    out[range] = {
      range,
      equity,
      pnl,
      volume: num(win.vlm),
      netPnl,
      returnRatio: startEquity > 0 ? netPnl / startEquity : 0,
    };
  }
  return out;
}

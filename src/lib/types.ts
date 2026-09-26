/**
 * LEORA domain models.
 *
 * These types are deliberately decoupled from the raw Hyperliquid API shapes.
 * The adapter layer (services/hyperliquid/adapters.ts) is the only place that
 * knows about raw responses; the UI only ever consumes the models below.
 */

export type HlNetwork = "mainnet" | "testnet";

export type PositionSide = "long" | "short";

export type RiskLevel = "healthy" | "attention" | "critical" | "unknown";

export type AccountSource = "wallet" | "watch" | "sample";

export interface MarketQuote {
  /** Asset symbol, e.g. "BTC" */
  symbol: string;
  markPrice: number;
  oraclePrice: number;
  prevDayPrice: number;
  /** 24h change as a fraction, e.g. 0.0231 = +2.31% */
  dayChange: number;
  dayNotionalVolume: number;
  openInterest: number;
  /** Hourly funding rate as a fraction */
  fundingHourly: number;
  szDecimals: number;
  maxLeverage: number;
}

export interface FundingInfo {
  /** Current hourly funding rate (fraction) */
  hourlyRate: number;
  /** Annualised funding rate (fraction) */
  annualRate: number;
  /** Net funding impact on this position since it was opened (USD, +credit / -cost) */
  netSinceOpen: number;
  /** Projected 24h funding flow for the position (USD, +credit / -cost) */
  projectedDaily: number;
}

export interface LiquidationRisk {
  level: RiskLevel;
  liquidationPrice: number | null;
  /** Absolute distance from mark to liquidation, in quote currency */
  priceDistance: number | null;
  /** Distance as a fraction of mark price (0.18 = 18% away) */
  distanceRatio: number | null;
  /** 0 → safe, 1 → at liquidation. Used for the risk track visualisation. */
  proximity: number | null;
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  /** Signed size in base units */
  signedSize: number;
  /** Absolute size in base units */
  size: number;
  entryPrice: number;
  markPrice: number;
  /** Notional exposure in USD */
  notional: number;
  unrealizedPnl: number;
  /** Return on equity (fraction) */
  roe: number;
  marginUsed: number;
  leverage: number;
  leverageMode: "cross" | "isolated";
  maxLeverage: number;
  liquidation: LiquidationRisk;
  funding: FundingInfo;
  szDecimals: number;
  /** Share of total account exposure (0-1) */
  exposureShare: number;
  dayChange: number;
}

export interface PortfolioPoint {
  t: number;
  v: number;
}

export type PortfolioRange = "day" | "week" | "month" | "allTime";

export interface PerformanceSeries {
  range: PortfolioRange;
  equity: PortfolioPoint[];
  pnl: PortfolioPoint[];
  volume: number;
  /** PnL over the window, derived from the pnl series */
  netPnl: number;
  /** Return over the window as a fraction of starting equity */
  returnRatio: number;
}

export interface AccountSummary {
  accountValue: number;
  withdrawable: number;
  totalNotional: number;
  totalMarginUsed: number;
  maintenanceMarginUsed: number;
  /** maintenance margin / account value (0-1). Liquidation of the account at 1. */
  marginRatio: number;
  /** account leverage = notional / equity */
  accountLeverage: number;
  unrealizedPnl: number;
  /** Realised PnL over the last 24h, derived from fills */
  realizedPnl24h: number;
  fees24h: number;
  /** Net funding across open positions since each was opened */
  netFundingSinceOpen: number;
  projectedDailyFunding: number;
  longNotional: number;
  shortNotional: number;
  openPositions: number;
}

export interface ActivityFill {
  id: string;
  symbol: string;
  direction: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  notional: number;
  closedPnl: number;
  fee: number;
  time: number;
}

export interface FundingEvent {
  id: string;
  symbol: string;
  /** USD amount, positive = received, negative = paid */
  amount: number;
  rate: number;
  size: number;
  time: number;
}

export interface AccountSnapshot {
  address: string;
  network: HlNetwork;
  fetchedAt: number;
  summary: AccountSummary;
  positions: Position[];
  performance: Record<PortfolioRange, PerformanceSeries>;
  fills: ActivityFill[];
  funding: FundingEvent[];
}

export interface LeoraError {
  kind:
    | "network"
    | "api"
    | "invalid-address"
    | "wallet-missing"
    | "wallet-rejected"
    | "wallet-unknown"
    | "unknown";
  message: string;
}

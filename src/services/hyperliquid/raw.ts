/** Raw Hyperliquid `info` response shapes. Only the adapter layer imports these. */

export interface RawMarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

export interface RawAssetPosition {
  type: string;
  position: {
    coin: string;
    szi: string;
    leverage: { type: "cross" | "isolated"; value: number; rawUsd?: string };
    entryPx: string | null;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string | null;
    marginUsed: string;
    maxLeverage: number;
    cumFunding: { allTime: string; sinceOpen: string; sinceChange: string };
  };
}

export interface RawClearinghouseState {
  marginSummary: RawMarginSummary;
  crossMarginSummary: RawMarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: RawAssetPosition[];
  time: number;
}

export interface RawUniverseAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  isDelisted?: boolean;
}

export interface RawAssetCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string | null;
  oraclePx: string;
  markPx: string;
  midPx: string | null;
}

export type RawMetaAndAssetCtxs = [{ universe: RawUniverseAsset[] }, RawAssetCtx[]];

export interface RawFill {
  coin: string;
  px: string;
  sz: string;
  side: "A" | "B";
  time: number;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  fee: string;
  tid: number;
}

export interface RawFundingEntry {
  time: number;
  delta: {
    type: string;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
  };
}

export type RawPortfolioWindow = [
  string,
  {
    accountValueHistory: [number, string][];
    pnlHistory: [number, string][];
    vlm: string;
  },
];

export type RawPortfolio = RawPortfolioWindow[];

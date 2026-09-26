import type { AccountSnapshot, HlNetwork, MarketQuote } from "@/lib/types";
import { READ_NETWORK } from "@/services/config";
import {
  adaptFills,
  adaptFunding,
  adaptMarkets,
  adaptPerformance,
  adaptPositions,
  adaptSummary,
} from "./adapters";
import { LeoraApiError, infoRequest, isValidAddress, normalizeAddress } from "./client";
import type {
  RawClearinghouseState,
  RawFill,
  RawFundingEntry,
  RawMetaAndAssetCtxs,
  RawPortfolio,
} from "./raw";

export { LeoraApiError, isValidAddress, normalizeAddress };

let marketCache: { at: number; data: Map<string, MarketQuote> } | null = null;

/** Recent price history for a single asset — used by the public market layer. */
export async function getCandles(
  coin: string,
  interval = "1h",
  lookbackMs = 24 * 60 * 60 * 1000,
  network: HlNetwork = READ_NETWORK,
  signal?: AbortSignal,
): Promise<{ t: number; v: number }[]> {
  const endTime = Date.now();
  const raw = await infoRequest<{ t: number; c: string }[]>(
    { type: "candleSnapshot", req: { coin, interval, startTime: endTime - lookbackMs, endTime } },
    network,
    signal,
  );
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => ({ t: c.t, v: parseFloat(c.c) })).filter((p) => Number.isFinite(p.v));
}

/** Market context for every perp (mark price, funding, 24h change). */
export async function getMarkets(
  network: HlNetwork = READ_NETWORK,
  signal?: AbortSignal,
): Promise<Map<string, MarketQuote>> {
  if (marketCache && Date.now() - marketCache.at < 5000) return marketCache.data;
  const raw = await infoRequest<RawMetaAndAssetCtxs>({ type: "metaAndAssetCtxs" }, network, signal);
  const data = adaptMarkets(raw);
  marketCache = { at: Date.now(), data };
  return data;
}

/**
 * Full read-only account snapshot for an address.
 * Everything the dashboard renders derives from this single call.
 */
export async function getAccountSnapshot(
  address: string,
  network: HlNetwork = READ_NETWORK,
  signal?: AbortSignal,
): Promise<AccountSnapshot> {
  const user = normalizeAddress(address);
  if (!isValidAddress(user)) {
    throw new LeoraApiError("invalid-address", "That does not look like a valid wallet address.");
  }

  const fundingStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [state, markets, portfolio, fills, funding] = await Promise.all([
    infoRequest<RawClearinghouseState>({ type: "clearinghouseState", user }, network, signal),
    getMarkets(network, signal),
    infoRequest<RawPortfolio>({ type: "portfolio", user }, network, signal).catch(() => []),
    infoRequest<RawFill[]>({ type: "userFills", user, aggregateByTime: true }, network, signal).catch(
      () => [] as RawFill[],
    ),
    infoRequest<RawFundingEntry[]>(
      { type: "userFunding", user, startTime: fundingStart },
      network,
      signal,
    ).catch(() => [] as RawFundingEntry[]),
  ]);

  if (!state || !state.marginSummary) {
    throw new LeoraApiError("api", "Hyperliquid returned no account data for this address.");
  }

  const positions = adaptPositions(state, markets);
  const adaptedFills = adaptFills(Array.isArray(fills) ? fills.slice(0, 200) : []);
  const summary = adaptSummary(state, positions, adaptedFills);

  return {
    address: user,
    network,
    fetchedAt: Date.now(),
    summary,
    positions,
    performance: adaptPerformance(Array.isArray(portfolio) ? portfolio : []),
    fills: adaptedFills.slice(0, 60),
    funding: adaptFunding(Array.isArray(funding) ? funding : []).slice(0, 60),
  };
}

import type { Position } from "@/lib/types";
import { EXECUTION_ENABLED, EXECUTION_NETWORK } from "@/services/config";

/**
 * Execution architecture (intentionally inert in the read-only MVP).
 *
 * Rules encoded here so that turning execution on later is a configuration
 * change, not a redesign:
 *  - every reduce order is reduce-only
 *  - the size always comes from explicit user input (never a fixed 50%)
 *  - the user sees exact reduce / remaining amounts before confirming
 *  - no private keys or seed phrases are ever requested; signing happens in
 *    the user's wallet through the Hyperliquid exchange signing flow
 *  - execution is developed and verified on testnet before mainnet
 */

export interface ReduceIntent {
  symbol: string;
  side: Position["side"];
  /** Fraction of the position being reduced, 0-1 (1 = close) */
  fraction: number;
  /** Absolute base-asset amount being reduced */
  reduceSize: number;
  /** Base-asset amount that will remain open */
  remainingSize: number;
  /** Notional value of the reduction, USD */
  reduceNotional: number;
  reduceOnly: true;
  isFullClose: boolean;
}

export interface ExecutionCapability {
  enabled: boolean;
  network: typeof EXECUTION_NETWORK;
  reason: string;
}

export function buildReduceIntent(position: Position, fraction: number): ReduceIntent {
  const clamped = Math.min(1, Math.max(0, fraction));
  const step = Math.pow(10, position.szDecimals);
  const reduceSize = Math.round(position.size * clamped * step) / step;
  const remainingSize = Math.max(0, Math.round((position.size - reduceSize) * step) / step);
  return {
    symbol: position.symbol,
    side: position.side,
    fraction: clamped,
    reduceSize,
    remainingSize,
    reduceNotional: reduceSize * position.markPrice,
    reduceOnly: true,
    isFullClose: remainingSize === 0 && reduceSize > 0,
  };
}

export function executionCapability(): ExecutionCapability {
  return {
    enabled: EXECUTION_ENABLED,
    network: EXECUTION_NETWORK,
    reason: EXECUTION_ENABLED
      ? `Execution is enabled against ${EXECUTION_NETWORK}.`
      : "Leora is read-only. Execution is being verified on testnet before it ships.",
  };
}

/**
 * Single seam for a future exchange adapter. While the feature flag is off it
 * refuses to do anything — the UI can already be built and reviewed around it.
 */
export async function submitReduce(intent: ReduceIntent): Promise<{ ok: false; message: string }> {
  void intent;
  return {
    ok: false,
    message: executionCapability().reason,
  };
}

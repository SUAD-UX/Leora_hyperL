import type { HlNetwork } from "@/lib/types";

/**
 * Runtime configuration. Values can be overridden with Vite env vars
 * (never put secrets here — everything in this file ships to the browser).
 */

const env = import.meta.env as Record<string, string | undefined>;

export const API_ENDPOINTS: Record<HlNetwork, string> = {
  mainnet: env.VITE_HL_MAINNET_API ?? "https://api.hyperliquid.xyz/info",
  testnet: env.VITE_HL_TESTNET_API ?? "https://api.hyperliquid-testnet.xyz/info",
};

/** Network used for READING account + market data. */
export const READ_NETWORK: HlNetwork = (env.VITE_HL_READ_NETWORK as HlNetwork) ?? "mainnet";

/**
 * Network that execution (reduce / close) would target.
 * Execution is developed against testnet only — never silently against mainnet.
 */
export const EXECUTION_NETWORK: HlNetwork = (env.VITE_HL_EXEC_NETWORK as HlNetwork) ?? "testnet";

/**
 * Master feature flag for order execution.
 * The production MVP is strictly read-only: this stays false.
 */
export const EXECUTION_ENABLED = env.VITE_EXECUTION_ENABLED === "true";

/** Poll interval for live account refresh (ms). */
export const REFRESH_INTERVAL = Number(env.VITE_REFRESH_INTERVAL ?? 15000);

/**
 * A real, public mainnet address used for the "explore with a sample account"
 * entry point. It fetches genuine live data — nothing here is fabricated.
 * Remove this constant (and the sample entry point) to ship wallet-only.
 */
export const SAMPLE_ADDRESS =
  env.VITE_SAMPLE_ADDRESS ?? "0x7b7f72a28fe109fa703eeed7984f2a8a68fedee2";

/** Risk thresholds for distance-to-liquidation, as a fraction of mark price. */
export const RISK_THRESHOLDS = {
  attention: 0.25,
  critical: 0.1,
};

/** Account-level margin ratio thresholds (maintenance margin / equity). */
export const ACCOUNT_RISK_THRESHOLDS = {
  attention: 0.35,
  critical: 0.6,
};

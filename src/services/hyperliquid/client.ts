import type { HlNetwork, LeoraError } from "@/lib/types";
import { API_ENDPOINTS } from "@/services/config";

export class LeoraApiError extends Error implements LeoraError {
  kind: LeoraError["kind"];
  constructor(kind: LeoraError["kind"], message: string) {
    super(message);
    this.kind = kind;
    this.name = "LeoraApiError";
  }
}

const DEFAULT_TIMEOUT = 12000;

/**
 * Minimal typed POST wrapper around the Hyperliquid `info` endpoint.
 * Handles timeouts, HTTP errors and malformed payloads, and converts them
 * into user-safe error kinds. Raw technical detail never reaches the UI.
 */
export async function infoRequest<T>(
  body: Record<string, unknown>,
  network: HlNetwork = "mainnet",
  signal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(API_ENDPOINTS[network], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new LeoraApiError(
        "api",
        res.status >= 500
          ? "Hyperliquid is not responding right now."
          : "Hyperliquid could not process this request.",
      );
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof LeoraApiError) throw err;
    if ((err as Error)?.name === "AbortError") {
      if (signal?.aborted) throw new LeoraApiError("network", "Request cancelled.");
      throw new LeoraApiError("network", "The request took too long. Check your connection.");
    }
    throw new LeoraApiError("network", "Unable to reach Hyperliquid. Check your connection.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function normalizeAddress(value: string): string {
  return value.trim().toLowerCase();
}

import { useCallback, useEffect, useRef, useState } from "react";
import type { AccountSnapshot, AccountSource, LeoraError, MarketQuote } from "@/lib/types";
import { READ_NETWORK, REFRESH_INTERVAL } from "@/services/config";
import { getAccountSnapshot, getMarkets } from "@/services/hyperliquid";

/* ------------------------------------------------------------------ */
/* Viewport                                                            */
/* ------------------------------------------------------------------ */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    el.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    if (el.classList.contains("reveal")) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Account snapshot (read-only, polled)                                */
/* ------------------------------------------------------------------ */

interface SnapshotState {
  data: AccountSnapshot | null;
  loading: boolean;
  refreshing: boolean;
  error: LeoraError | null;
  refresh: () => void;
}

export function useAccountSnapshot(address: string | null, source: AccountSource): SnapshotState {
  const [data, setData] = useState<AccountSnapshot | null>(null);
  const [loading, setLoading] = useState(Boolean(address));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<LeoraError | null>(null);
  const [nonce, setNonce] = useState(0);
  const hasData = useRef(false);

  void source;

  useEffect(() => {
    hasData.current = false;
    setData(null);
    setError(null);
    setLoading(Boolean(address));
  }, [address]);

  useEffect(() => {
    if (!address) return;
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      if (hasData.current) setRefreshing(true);
      else setLoading(true);
      try {
        const snapshot = await getAccountSnapshot(address, READ_NETWORK, controller.signal);
        if (cancelled) return;
        setData(snapshot);
        hasData.current = true;
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const e = err as LeoraError;
        if (e?.kind === "network" && e.message === "Request cancelled.") return;
        // Keep the last good snapshot on screen if a refresh fails.
        if (!hasData.current) setData(null);
        setError({
          kind: e?.kind ?? "unknown",
          message: e?.message ?? "Something went wrong while loading your account.",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [address, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, refreshing, error, refresh };
}

/* ------------------------------------------------------------------ */
/* Live market strip (no wallet required)                              */
/* ------------------------------------------------------------------ */

export function useMarkets(symbols: string[]) {
  const [quotes, setQuotes] = useState<MarketQuote[] | null>(null);
  const [failed, setFailed] = useState(false);
  const key = symbols.join(",");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const markets = await getMarkets(READ_NETWORK, controller.signal);
        if (cancelled) return;
        const list = key
          .split(",")
          .map((s) => markets.get(s))
          .filter(Boolean) as MarketQuote[];
        setQuotes(list);
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 20000);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [key]);

  return { quotes, failed };
}

/* ------------------------------------------------------------------ */
/* Animated numeric transitions                                        */
/* ------------------------------------------------------------------ */

export function useAnimatedNumber(value: number, duration = 700): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const delta = value - from;
    if (Math.abs(delta) < 1e-9) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return display;
}

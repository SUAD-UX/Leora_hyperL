import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AccountSnapshot } from "@/lib/types";
import { deriveAlerts, type LeoraAlert } from "@/lib/alerts";

const MAX_ALERTS = 40;

/**
 * Holds the in-session alert feed. Alerts live for the life of the tab:
 * persistent / push delivery needs a backend and is intentionally out of scope
 * for the read-only MVP.
 */
export function useAlerts(snapshot: AccountSnapshot | null) {
  const [alerts, setAlerts] = useState<LeoraAlert[]>([]);
  const prevRef = useRef<AccountSnapshot | null>(null);
  const addressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) return;

    // Switching accounts clears the feed and re-baselines.
    if (addressRef.current !== snapshot.address) {
      addressRef.current = snapshot.address;
      prevRef.current = snapshot;
      setAlerts([]);
      return;
    }

    const fresh = deriveAlerts(prevRef.current, snapshot);
    prevRef.current = snapshot;
    if (fresh.length) {
      setAlerts((current) => [...fresh, ...current].slice(0, MAX_ALERTS));
    }
  }, [snapshot]);

  const unread = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  const markAllRead = useCallback(() => {
    setAlerts((current) => current.map((a) => (a.read ? a : { ...a, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((current) => current.filter((a) => a.id !== id));
  }, []);

  const clear = useCallback(() => setAlerts([]), []);

  return { alerts, unread, markAllRead, dismiss, clear };
}

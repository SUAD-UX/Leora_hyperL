import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AccountSource, Position } from "@/lib/types";
import { READ_NETWORK } from "@/services/config";
import { getConnectedAddress, onAccountsChanged } from "@/services/wallet";
import { useAccountSnapshot } from "@/hooks/useLeora";
import { useAlerts } from "@/hooks/useAlerts";
import { ConnectScreen } from "./ConnectScreen";
import { PositionSheet } from "./PositionDetail";
import { Shell, type ViewKey } from "./Shell";
import { ErrorState, OverviewSkeleton } from "./states";
import { HistoryView } from "./views/HistoryView";
import { Overview } from "./views/Overview";
import { PositionsView } from "./views/PositionsView";
import { RiskView } from "./views/RiskView";

const STORAGE_KEY = "leora.session.v1";

interface Session {
  address: string;
  source: AccountSource;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.address ? parsed : null;
  } catch {
    return null;
  }
}

export function AppRoot({ onExit }: { onExit: () => void }) {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [view, setView] = useState<ViewKey>("overview");
  const [sheetPosition, setSheetPosition] = useState<Position | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const { data, loading, refreshing, error, refresh } = useAccountSnapshot(
    session?.address ?? null,
    session?.source ?? "watch",
  );
  const { alerts, unread, markAllRead, dismiss, clear } = useAlerts(data);

  /* Silent reconnect + wallet account switching */
  useEffect(() => {
    if (session?.source !== "wallet") return;
    let active = true;
    getConnectedAddress().then((address) => {
      if (!active) return;
      if (!address) {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      } else if (address !== session.address) {
        const next = { address, source: "wallet" as const };
        setSession(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    });
    const off = onAccountsChanged((address) => {
      if (!address) {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const next = { address, source: "wallet" as const };
        setSession(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    });
    return () => {
      active = false;
      off();
    };
  }, [session?.address, session?.source]);

  const connect = useCallback((address: string, source: AccountSource) => {
    const next = { address, source };
    setSession(next);
    setView("overview");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — session simply won't persist */
    }
  }, []);

  const disconnect = useCallback(() => {
    setSession(null);
    setSheetPosition(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const openPosition = useCallback((position: Position) => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setFocusId(position.id);
      setView("positions");
    } else {
      setSheetPosition(position);
    }
  }, []);

  /* Keep the mobile sheet in sync with fresh data */
  const liveSheetPosition = useMemo(() => {
    if (!sheetPosition || !data) return sheetPosition;
    return data.positions.find((p) => p.id === sheetPosition.id) ?? null;
  }, [sheetPosition, data]);

  if (!session) {
    return (
      <>
        <MinimalHeader onExit={onExit} />
        <ConnectScreen onConnected={connect} />
      </>
    );
  }

  const body = () => {
    if (loading && !data) return <OverviewSkeleton />;
    if (error && !data) return <ErrorState error={error} onRetry={refresh} />;
    if (!data) return <OverviewSkeleton />;

    switch (view) {
      case "positions":
        return <PositionsView snapshot={data} onOpenPosition={setSheetPosition} focusId={focusId} />;
      case "risk":
        return <RiskView snapshot={data} onOpenPosition={openPosition} />;
      case "history":
        return <HistoryView snapshot={data} />;
      default:
        return (
          <Overview
            snapshot={data}
            onOpenPosition={openPosition}
            onViewAll={() => {
              setFocusId(null);
              setView("positions");
            }}
          />
        );
    }
  };

  return (
    <>
      <Shell
        view={view}
        onViewChange={(next) => {
          setFocusId(null);
          setView(next);
        }}
        address={session.address}
        source={session.source}
        network={READ_NETWORK}
        fetchedAt={data?.fetchedAt}
        refreshing={refreshing}
        onRefresh={refresh}
        onDisconnect={disconnect}
        onExit={onExit}
        alerts={alerts}
        unread={unread}
        onMarkAllRead={markAllRead}
        onDismissAlert={dismiss}
        onClearAlerts={clear}
      >
        {session.source === "sample" && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold-500/[0.16] bg-gold-300/[0.032] px-4 py-2.5">
            <span className="text-[12px] text-mist-400">
              Viewing a public sample account — live mainnet data, not yours.
            </span>
            <button
              onClick={disconnect}
              className="text-[9.5px] font-medium tracking-[0.2em] text-mist-300 uppercase transition-colors hover:text-mist-50"
            >
              connect your wallet →
            </button>
          </div>
        )}

        {error && data && (
          <div className="mb-3 rounded-xl border border-sand-400/20 bg-sand-400/[0.07] px-4 py-2.5 text-[12px] text-sand-300">
            {error.message} Showing the last values Leora received.
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {body()}
          </motion.div>
        </AnimatePresence>
      </Shell>

      <PositionSheet position={liveSheetPosition} onClose={() => setSheetPosition(null)} />
    </>
  );
}

function MinimalHeader({ onExit }: { onExit: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-8 lg:h-[88px]">
      <button
        onClick={onExit}
        className="font-mono text-[10px] tracking-[0.2em] text-mist-500 uppercase transition-colors hover:text-mist-200"
      >
        ← back to leora
      </button>
      <span className="font-mono text-[10px] tracking-[0.2em] text-mist-600 uppercase">
        {READ_NETWORK} · read-only
      </span>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AccountSource, HlNetwork } from "@/lib/types";
import type { LeoraAlert } from "@/lib/alerts";
import { relativeTime, shortAddress } from "@/lib/format";
import { Wordmark } from "@/components/ui/Brand";
import { AlertsMenu } from "@/components/AlertsMenu";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconHistory,
  IconOverview,
  IconPositions,
  IconRefresh,
  IconRisk,
} from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

export type ViewKey = "overview" | "positions" | "risk" | "history";

export const NAV_ITEMS: { key: ViewKey; label: string; icon: typeof IconOverview }[] = [
  { key: "overview", label: "Overview", icon: IconOverview },
  { key: "positions", label: "Positions", icon: IconPositions },
  { key: "risk", label: "Risk", icon: IconRisk },
  { key: "history", label: "History", icon: IconHistory },
];

interface ShellProps {
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
  address: string;
  source: AccountSource;
  network: HlNetwork;
  fetchedAt?: number;
  refreshing?: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
  onExit: () => void;
  alerts: LeoraAlert[];
  unread: number;
  onMarkAllRead: () => void;
  onDismissAlert: (id: string) => void;
  onClearAlerts: () => void;
  children: React.ReactNode;
}

export function Shell({
  view,
  onViewChange,
  address,
  source,
  network,
  fetchedAt,
  refreshing,
  onRefresh,
  onDisconnect,
  onExit,
  alerts,
  unread,
  onMarkAllRead,
  onDismissAlert,
  onClearAlerts,
  children,
}: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const sourceLabel =
    source === "wallet" ? "Wallet" : source === "sample" ? "Sample account" : "Watching";

  return (
    <div className="min-h-dvh">
      {/* ---------------- Desktop rail ---------------- */}
      <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-[240px] flex-col border-r border-gold-500/[0.12] bg-ink-1000/50 px-5 py-6 backdrop-blur-xl lg:flex">
        <button onClick={onExit} className="text-left transition-opacity hover:opacity-80">
          <Wordmark subtitle="risk terminal" />
        </button>

        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium tracking-[0.14em] uppercase transition-all duration-300",
                  active ? "text-gold-100" : "text-mist-500 hover:text-mist-200",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    className="absolute inset-0 rounded-xl border border-gold-500/25 bg-gold-300/[0.07]"
                  />
                )}
                <item.icon
                  className={cn(
                    "relative h-[17px] w-[17px] transition-colors",
                    active ? "text-gold-300" : "text-mist-500 group-hover:text-mist-300",
                  )}
                />
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="rounded-[16px] border border-gold-500/[0.16] bg-gold-300/[0.03] p-3.5">
          <div className="label-xs">{sourceLabel}</div>
          <div className="num mt-2 font-mono text-[12.5px] text-gold-200">
            {shortAddress(address, 5)}
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <button
              onClick={copy}
              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gold-500/20 text-[10px] tracking-[0.12em] text-mist-400 uppercase transition-colors hover:border-gold-400/40 hover:text-gold-200"
            >
              {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={onDisconnect}
              className="flex h-7 items-center justify-center rounded-lg border border-gold-500/20 px-2.5 text-[10px] tracking-[0.12em] text-mist-400 uppercase transition-colors hover:border-ember-400/40 hover:text-ember-300"
            >
              Exit
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[9px] tracking-[0.2em] text-mist-600 uppercase">
          <span>{network}</span>
          <span>read-only</span>
        </div>
      </aside>

      {/* ---------------- Main column ---------------- */}
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 border-b border-gold-500/[0.12] bg-ink-1000/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-2.5 px-4 sm:px-6 lg:h-[74px] lg:px-8">
            <button onClick={onExit} className="lg:hidden">
              <Wordmark size={30} letter="text-[13px] tracking-[0.34em]" />
            </button>

            <div className="hidden lg:block">
              <h1 className="font-display text-[22px] text-mist-50">
                {NAV_ITEMS.find((n) => n.key === view)?.label}
              </h1>
              <div className="mt-0.5 text-[9px] tracking-[0.2em] text-mist-600 uppercase">
                {fetchedAt ? `updated ${relativeTime(fetchedAt)}` : "connecting"}
              </div>
            </div>

            <div className="flex-1" />

            <span className="hidden items-center gap-1.5 rounded-full border border-gold-500/25 bg-gold-300/[0.05] px-3 py-1.5 text-[9.5px] font-medium tracking-[0.18em] text-gold-200 uppercase sm:inline-flex">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-gold-300",
                  refreshing && "animate-pulse",
                )}
              />
              {network} · read
            </span>

            <AlertsMenu
              alerts={alerts}
              unread={unread}
              onMarkAllRead={onMarkAllRead}
              onDismiss={onDismissAlert}
              onClear={onClearAlerts}
            />

            <button
              onClick={onRefresh}
              aria-label="Refresh data"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/20 text-mist-400 transition-all duration-300 hover:border-gold-400/40 hover:text-gold-200 active:scale-95"
            >
              <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 items-center gap-2 rounded-full border border-gold-500/20 bg-gold-300/[0.03] pr-3 pl-2 transition-colors hover:border-gold-400/40"
              >
                <span className="h-5 w-5 rounded-full bg-[linear-gradient(145deg,#faf1de,#c79d5d)]" />
                <span className="num hidden font-mono text-[11.5px] text-mist-200 sm:inline">
                  {shortAddress(address, 3)}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-deep absolute right-0 z-50 mt-2 w-60 rounded-[16px] p-3"
                  >
                    <div className="label-gold">{sourceLabel}</div>
                    <div className="num mt-1.5 font-mono text-[11px] leading-relaxed break-all text-mist-300">
                      {address}
                    </div>
                    <div className="mt-3 space-y-1">
                      <button
                        onClick={copy}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[12.5px] text-mist-300 transition-colors hover:bg-gold-300/[0.06] hover:text-gold-100"
                      >
                        {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
                        {copied ? "Address copied" : "Copy address"}
                      </button>
                      <button
                        onClick={onDisconnect}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[12.5px] text-mist-300 transition-colors hover:bg-gold-300/[0.06] hover:text-ember-300"
                      >
                        <IconClose className="h-4 w-4" />
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="px-3 pt-4 pb-28 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6 lg:pb-14">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>

      {/* ---------------- Mobile tab bar ---------------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-3 mb-3 rounded-[20px] border border-gold-500/[0.18] bg-ink-900/90 px-1.5 py-1.5 backdrop-blur-2xl">
          <div className="grid grid-cols-4">
            {NAV_ITEMS.map((item) => {
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onViewChange(item.key)}
                  className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-active"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                      className="absolute inset-0 rounded-2xl border border-gold-500/25 bg-gold-300/[0.08]"
                    />
                  )}
                  <item.icon
                    className={cn(
                      "relative h-[18px] w-[18px] transition-colors",
                      active ? "text-gold-200" : "text-mist-500",
                    )}
                  />
                  <span
                    className={cn(
                      "relative text-[9px] font-medium tracking-[0.14em] uppercase transition-colors",
                      active ? "text-gold-100" : "text-mist-600",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}

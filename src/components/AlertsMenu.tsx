import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ALERT_ACCENT, type LeoraAlert } from "@/lib/alerts";
import { relativeTime } from "@/lib/format";
import { IconBell, IconClose, IconInbox } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

interface AlertsMenuProps {
  alerts: LeoraAlert[];
  unread: number;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClear: () => void;
}

/**
 * Header bell + dropdown feed. On mobile the same feed renders as a
 * bottom sheet so it stays reachable and readable.
 */
export function AlertsMenu({
  alerts,
  unread,
  onMarkAllRead,
  onDismiss,
  onClear,
}: AlertsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && unread > 0) {
      const t = setTimeout(onMarkAllRead, 900);
      return () => clearTimeout(t);
    }
  }, [open, unread, onMarkAllRead]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `${unread} new alerts` : "Alerts"}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 active:scale-95",
          open
            ? "border-gold-400/50 bg-gold-300/[0.09] text-gold-200"
            : "border-gold-500/20 text-mist-400 hover:border-gold-400/40 hover:text-gold-200",
        )}
      >
        <IconBell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[linear-gradient(145deg,#faf1de,#dcb87c)] px-1 text-[9px] font-semibold text-ink-1000">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-1000/70 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "glass-deep z-50 overflow-hidden rounded-[18px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]",
                "fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-[340px]",
              )}
            >
              <div className="flex items-center justify-between border-b border-gold-500/[0.14] px-4 py-3">
                <div className="label-gold">Alerts</div>
                {alerts.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-[10px] font-medium tracking-[0.16em] text-mist-500 uppercase transition-colors hover:text-gold-200"
                  >
                    clear
                  </button>
                )}
              </div>

              <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <IconInbox className="h-5 w-5 text-mist-600" />
                    <div className="font-display mt-3 text-[17px] text-mist-200">All quiet</div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-mist-500">
                      Leora watches your positions while this tab is open and tells you when risk,
                      funding or exposure changes.
                    </p>
                  </div>
                ) : (
                  <ul>
                    {alerts.map((alert) => {
                      const accent = ALERT_ACCENT[alert.level];
                      return (
                        <motion.li
                          key={alert.id}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className={cn(
                            "group relative flex gap-3 border-b border-gold-500/[0.08] px-4 py-3 last:border-0",
                            !alert.read && "bg-gold-300/[0.035]",
                          )}
                        >
                          <span
                            className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", accent.dot)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className={cn("text-[13px] leading-snug", accent.text)}>
                              {alert.title}
                            </div>
                            <div className="mt-1 text-[11.5px] leading-relaxed text-mist-500">
                              {alert.detail}
                            </div>
                            <div className="mt-1.5 text-[9.5px] tracking-[0.16em] text-mist-600 uppercase">
                              {relativeTime(alert.time)} · {alert.kind}
                            </div>
                          </div>
                          <button
                            onClick={() => onDismiss(alert.id)}
                            aria-label="Dismiss alert"
                            className="mt-0.5 h-6 w-6 shrink-0 rounded-full text-mist-600 opacity-0 transition-all group-hover:opacity-100 hover:text-mist-200 focus-visible:opacity-100"
                          >
                            <IconClose className="mx-auto h-3.5 w-3.5" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-gold-500/[0.14] px-4 py-2.5 text-[9.5px] tracking-[0.16em] text-mist-600 uppercase">
                session only · no push yet
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

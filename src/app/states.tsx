import type { LeoraError } from "@/lib/types";
import { Button, Panel, Skeleton } from "@/components/ui/primitives";
import { IconAlert, IconLayers, IconRefresh } from "@/components/ui/Icons";

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

export function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <Panel className="p-5 sm:p-7">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-11 w-64" />
        <Skeleton className="mt-3 h-3 w-40" />
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gold-500/[0.12] p-4">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="mt-3 h-6 w-24" />
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Panel key={i} className="p-4 sm:p-5" style={{ opacity: 1 - i * 0.22 }}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="mt-2 h-2.5 w-32" />
                </div>
                <Skeleton className="h-7 w-24" />
              </div>
              <Skeleton className="mt-5 h-[5px] w-full rounded-full" />
            </Panel>
          ))}
        </div>
        <Panel className="p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-[150px] w-full" />
        </Panel>
      </div>
    </div>
  );
}

export function InlineLoader({ label = "Reading Hyperliquid" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-mist-500 uppercase">
      <span className="relative flex h-3 w-3 items-center justify-center">
        <span className="absolute h-3 w-3 animate-ping rounded-full bg-iris-400/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-iris-300" />
      </span>
      {label}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Error                                                               */
/* ------------------------------------------------------------------ */

const ERROR_COPY: Record<LeoraError["kind"], { title: string; hint: string }> = {
  network: {
    title: "We couldn't reach Hyperliquid",
    hint: "The connection timed out. Check your network and try again.",
  },
  api: {
    title: "Hyperliquid is having a moment",
    hint: "The data service responded unexpectedly. This is usually temporary.",
  },
  "invalid-address": {
    title: "That address doesn't look right",
    hint: "Enter a full wallet address starting with 0x.",
  },
  "wallet-missing": {
    title: "No wallet detected",
    hint: "Install a browser wallet, or watch any address in read-only mode.",
  },
  "wallet-rejected": {
    title: "Connection declined",
    hint: "You cancelled the request in your wallet. Nothing was shared.",
  },
  "wallet-unknown": {
    title: "Wallet couldn't connect",
    hint: "Open your wallet extension and try connecting again.",
  },
  unknown: {
    title: "Something went wrong",
    hint: "We couldn't load this view. Try again in a moment.",
  },
};

export function ErrorState({
  error,
  onRetry,
  compact = false,
}: {
  error: LeoraError;
  onRetry?: () => void;
  compact?: boolean;
}) {
  const copy = ERROR_COPY[error.kind] ?? ERROR_COPY.unknown;
  return (
    <Panel className={compact ? "p-5" : "p-8 sm:p-12"}>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sand-400/20 bg-sand-400/[0.08]">
          <IconAlert className="h-5 w-5 text-sand-300" />
        </div>
        <h3 className="mt-5 text-[17px] text-mist-50">{copy.title}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-mist-400">
          {error.message || copy.hint}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={onRetry}
            icon={<IconRefresh className="h-4 w-4" />}
          >
            Try again
          </Button>
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Empty                                                               */
/* ------------------------------------------------------------------ */

export function EmptyPositions({ address }: { address: string }) {
  return (
    <Panel className="overflow-hidden p-8 sm:p-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(122,132,214,0.16), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-[18px] border border-gold-500/[0.16]" />
          <span className="absolute inset-2 animate-breathe rounded-xl border border-gold-500/[0.12]" />
          <IconLayers className="relative h-6 w-6 text-mist-400" />
        </div>
        <h3 className="mt-6 font-display text-[22px] text-mist-50">No open positions</h3>
        <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-mist-400">
          This account currently has no perpetual exposure on Hyperliquid. The moment a position is
          opened, Leora will show its size, PnL, funding and distance to liquidation here.
        </p>
        <div className="mt-6 text-[9.5px] font-medium tracking-[0.2em] text-mist-600 uppercase">
          watching {address.slice(0, 6)}···{address.slice(-4)}
        </div>
      </div>
    </Panel>
  );
}

export function EmptyRow({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold-500/[0.16] px-6 py-10 text-center">
      <div className="text-[14px] text-mist-300">{title}</div>
      {hint ? <div className="mt-1.5 text-[12.5px] text-mist-500">{hint}</div> : null}
    </div>
  );
}

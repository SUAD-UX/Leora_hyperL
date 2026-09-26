import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { Position } from "@/lib/types";
import { percent, price, size as fmtSize, usd } from "@/lib/format";
import { buildReduceIntent, executionCapability, submitReduce } from "@/services/execution";
import { Button, Divider, Pill } from "@/components/ui/primitives";
import { IconAlert, IconLock, IconShield } from "@/components/ui/Icons";
import { cn } from "@/utils/cn";

const PRESETS = [0.1, 0.25, 0.5, 0.75, 1];

/**
 * Reduce / Close interface.
 *
 * The amount is always chosen by the user — presets are shortcuts, never a
 * default. The exact reduce amount and the remaining position are shown before
 * any confirmation. While the execution flag is off, the panel is a fully built
 * but inert surface: nothing can be submitted.
 */
export function ReducePanel({ position, onClose }: { position: Position; onClose: () => void }) {
  const capability = executionCapability();
  const [fraction, setFraction] = useState(0.25);
  const [customSize, setCustomSize] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const effectiveFraction = useMemo(() => {
    const custom = parseFloat(customSize);
    if (customSize !== "" && Number.isFinite(custom) && custom > 0) {
      return Math.min(1, custom / position.size);
    }
    return fraction;
  }, [customSize, fraction, position.size]);

  const intent = useMemo(
    () => buildReduceIntent(position, effectiveFraction),
    [position, effectiveFraction],
  );

  const setPreset = (value: number) => {
    setCustomSize("");
    setFraction(value);
    setConfirming(false);
    setResult(null);
  };

  const handleConfirm = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const res = await submitReduce(intent);
    setResult(res.message);
    setConfirming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[18px] border border-gold-500/[0.18] bg-ink-950/60 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="label-xs">{intent.isFullClose ? "Close position" : "Reduce position"}</div>
          <div className="mt-1 text-[13px] text-mist-300">
            You choose the amount. Nothing is submitted without confirmation.
          </div>
        </div>
        <Pill tone={capability.enabled ? "jade" : "neutral"}>
          <IconShield className="h-3 w-3" />
          reduce-only
        </Pill>
      </div>

      {/* Amount selection */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const active = !customSize && Math.abs(fraction - p) < 0.001;
          return (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={cn(
                "num h-9 min-w-[62px] flex-1 rounded-xl border font-mono text-[12px] transition-all duration-300 sm:flex-none",
                active
                  ? "border-gold-400/45 bg-gold-300/[0.10] text-mist-50"
                  : "border-gold-500/[0.16] text-mist-400 hover:border-gold-400/35 hover:text-mist-100",
              )}
            >
              {p === 1 ? "100% · close" : `${p * 100}%`}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={Math.round(effectiveFraction * 100)}
          onChange={(e) => setPreset(Number(e.target.value) / 100)}
          className="leora-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gold-300/[0.10]"
        />
        <div className="flex items-center gap-2">
          <input
            value={customSize}
            onChange={(e) => {
              setCustomSize(e.target.value.replace(/[^0-9.]/g, ""));
              setConfirming(false);
            }}
            placeholder={fmtSize(position.size, position.szDecimals)}
            inputMode="decimal"
            className="num h-9 w-full rounded-xl border border-gold-500/[0.18] bg-ink-950/70 px-3 font-mono text-[12.5px] text-mist-100 outline-none transition-colors placeholder:text-mist-600 focus:border-gold-400/45 sm:w-32"
          />
          <span className="font-mono text-[11px] text-mist-500">{position.symbol}</span>
        </div>
      </div>

      {/* Outcome preview */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gold-500/[0.16] bg-gold-300/[0.032] p-3.5">
          <div className="label-xs">Reducing</div>
          <div className="num mt-1.5 text-[19px] text-mist-50">
            {fmtSize(intent.reduceSize, position.szDecimals)}{" "}
            <span className="text-[12px] text-mist-500">{position.symbol}</span>
          </div>
          <div className="num mt-1 text-[11.5px] text-mist-500">
            {usd(intent.reduceNotional)} · {percent(intent.fraction, 0)}
          </div>
        </div>
        <div className="rounded-xl border border-gold-500/[0.16] bg-gold-300/[0.032] p-3.5">
          <div className="label-xs">Remaining</div>
          <div className="num mt-1.5 text-[19px] text-mist-50">
            {fmtSize(intent.remainingSize, position.szDecimals)}{" "}
            <span className="text-[12px] text-mist-500">{position.symbol}</span>
          </div>
          <div className="num mt-1 text-[11.5px] text-mist-500">
            {usd(intent.remainingSize * position.markPrice)} ·{" "}
            {intent.isFullClose ? "position closed" : "stays open"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9.5px] font-medium tracking-[0.18em] text-mist-600 uppercase">
        <span>mark {price(position.markPrice, position.szDecimals)}</span>
        <span>{position.side} · {intent.reduceOnly ? "reduce-only" : ""}</span>
        <span>target {capability.network}</span>
      </div>

      <Divider className="my-5" />

      {/* Execution gate */}
      {!capability.enabled ? (
        <div className="flex items-start gap-3 rounded-xl border border-gold-500/[0.16] bg-gold-300/[0.028] p-3.5">
          <IconLock className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" />
          <div>
            <div className="text-[13px] text-mist-200">Execution is off in this release</div>
            <div className="mt-1 text-[12px] leading-relaxed text-mist-500">
              Leora reads mainnet. Reduce and close orders are being verified on testnet first and
              will unlock here once signing is complete. Your keys are never involved.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-sand-400/20 bg-sand-400/[0.06] p-3.5">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-sand-300" />
          <div className="text-[12.5px] leading-relaxed text-sand-200">
            {confirming
              ? `Confirm: reduce ${fmtSize(intent.reduceSize, position.szDecimals)} ${position.symbol} (${percent(intent.fraction, 0)}), leaving ${fmtSize(intent.remainingSize, position.szDecimals)} open.`
              : `This will place a reduce-only order on ${capability.network}.`}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-xl border border-gold-500/[0.16] bg-gold-300/[0.032] px-3.5 py-3 text-[12.5px] text-mist-400">
          {result}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} className="sm:order-1">
          Cancel
        </Button>
        <Button
          size="sm"
          variant={capability.enabled ? "primary" : "outline"}
          disabled={!capability.enabled || intent.reduceSize <= 0}
          onClick={handleConfirm}
          className="sm:order-2"
        >
          {!capability.enabled
            ? "Unavailable in read-only mode"
            : confirming
              ? "Confirm reduce-only order"
              : intent.isFullClose
                ? "Close position"
                : "Review reduction"}
        </Button>
      </div>
    </motion.div>
  );
}

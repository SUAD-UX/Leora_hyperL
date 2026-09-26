import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { AccountSnapshot } from "@/lib/types";
import { clockTime, compactUsd, dayLabel, percent, price, relativeTime, size as fmtSize, usd } from "@/lib/format";
import { pnlTone } from "@/lib/risk";
import { Panel, SectionLabel, Segmented } from "@/components/ui/primitives";
import { EmptyRow } from "../states";
import { cn } from "@/utils/cn";

type Tab = "fills" | "funding";

export function HistoryView({ snapshot }: { snapshot: AccountSnapshot }) {
  const [tab, setTab] = useState<Tab>("fills");
  const { fills, funding } = snapshot;

  const totals = useMemo(
    () => ({
      realized: fills.reduce((a, f) => a + f.closedPnl, 0),
      fees: fills.reduce((a, f) => a + f.fee, 0),
      volume: fills.reduce((a, f) => a + f.notional, 0),
      funding: funding.reduce((a, f) => a + f.amount, 0),
    }),
    [fills, funding],
  );

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8">
            <Figure label="Realised PnL" value={usd(totals.realized, { sign: true })} tone={pnlTone(totals.realized)} />
            <Figure label="Fees" value={usd(totals.fees)} />
            <Figure label="Traded volume" value={compactUsd(totals.volume)} />
            <Figure
              label="Funding · 7d"
              value={usd(totals.funding, { sign: true })}
              tone={pnlTone(totals.funding)}
            />
          </div>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "fills", label: "Trades" },
              { value: "funding", label: "Funding" },
            ]}
          />
        </div>
      </Panel>

      <Panel className="p-3 sm:p-5">
        <div className="hidden px-2 pb-3 lg:grid lg:grid-cols-[130px_1fr_130px_130px_120px_110px]">
          {(tab === "fills"
            ? ["Time", "Action", "Price", "Size", "Value", "PnL"]
            : ["Time", "Asset", "Rate", "Position", "", "Amount"]
          ).map((h, i) => (
            <div key={i} className={cn("label-xs", i >= 2 && "text-right")}>
              {h}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {tab === "fills" ? (
            fills.length === 0 ? (
              <EmptyRow
                title="No trade history"
                hint="Fills from the last sessions will appear here once this account trades."
              />
            ) : (
              fills.map((fill, i) => (
                <motion.div
                  key={fill.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.012, 0.25) }}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-gold-500/[0.10] bg-gold-300/[0.015] px-3 py-3 lg:grid-cols-[130px_1fr_130px_130px_120px_110px] lg:border-transparent lg:bg-transparent lg:px-2 lg:py-2.5 lg:hover:bg-gold-300/[0.032]"
                >
                  <div className="num order-2 font-mono text-[10.5px] text-mist-600 lg:order-none lg:text-[11.5px] lg:text-mist-500">
                    <span className="lg:hidden">{relativeTime(fill.time)}</span>
                    <span className="hidden lg:inline">
                      {dayLabel(fill.time)} {clockTime(fill.time)}
                    </span>
                  </div>
                  <div className="order-1 flex items-center gap-2 lg:order-none">
                    <span
                      className={cn(
                        "h-4 w-[2px] rounded-full",
                        fill.side === "buy" ? "bg-jade-400/80" : "bg-iris-400/80",
                      )}
                    />
                    <span className="truncate text-[13px] text-mist-100">
                      {fill.direction} <span className="text-mist-400">{fill.symbol}</span>
                    </span>
                  </div>
                  <div className="num order-3 text-right font-mono text-[11.5px] text-mist-300 lg:order-none">
                    {price(fill.price, 4)}
                  </div>
                  <div className="num order-4 hidden text-right font-mono text-[11.5px] text-mist-400 lg:order-none lg:block">
                    {fmtSize(fill.size, 4)}
                  </div>
                  <div className="num order-5 hidden text-right font-mono text-[11.5px] text-mist-400 lg:order-none lg:block">
                    {compactUsd(fill.notional)}
                  </div>
                  <div
                    className={cn(
                      "num order-6 text-right font-mono text-[12px] lg:order-none",
                      fill.closedPnl === 0 ? "text-mist-600" : pnlTone(fill.closedPnl),
                    )}
                  >
                    {fill.closedPnl === 0 ? "—" : usd(fill.closedPnl, { sign: true })}
                  </div>
                </motion.div>
              ))
            )
          ) : funding.length === 0 ? (
            <EmptyRow
              title="No funding payments"
              hint="Funding settles hourly while positions are open."
            />
          ) : (
            funding.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.012, 0.25) }}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-gold-500/[0.10] bg-gold-300/[0.015] px-3 py-3 lg:grid-cols-[130px_1fr_130px_130px_120px_110px] lg:border-transparent lg:bg-transparent lg:px-2 lg:py-2.5 lg:hover:bg-gold-300/[0.032]"
              >
                <div className="num order-2 font-mono text-[10.5px] text-mist-600 lg:order-none lg:text-[11.5px] lg:text-mist-500">
                  <span className="lg:hidden">{relativeTime(event.time)}</span>
                  <span className="hidden lg:inline">
                    {dayLabel(event.time)} {clockTime(event.time)}
                  </span>
                </div>
                <div className="order-1 text-[13px] text-mist-100 lg:order-none">
                  {event.symbol}
                </div>
                <div className="num order-3 text-right font-mono text-[11.5px] text-mist-400 lg:order-none">
                  {percent(event.rate, 4, true)}
                </div>
                <div className="num order-4 hidden text-right font-mono text-[11.5px] text-mist-400 lg:order-none lg:block">
                  {fmtSize(event.size, 4)}
                </div>
                <div className="hidden lg:block" />
                <div
                  className={cn(
                    "num order-6 text-right font-mono text-[12px] lg:order-none",
                    pnlTone(event.amount),
                  )}
                >
                  {usd(event.amount, { sign: true, decimals: 4 })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Panel>

      <p className="pb-1 text-center text-[9px] font-medium tracking-[0.2em] text-mist-700 uppercase">
        {tab === "fills"
          ? `${fills.length} most recent fills`
          : `${funding.length} funding events · last 7 days`}
      </p>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className={cn("num mt-1.5 text-[18px] text-mist-50", tone)}>{value}</div>
    </div>
  );
}

import { useMemo, useState } from "react";
import type { AccountSnapshot, Position } from "@/lib/types";
import { compactUsd, percent, usd } from "@/lib/format";
import { pnlTone } from "@/lib/risk";
import { useMediaQuery } from "@/hooks/useLeora";
import { Panel, SectionLabel, Segmented } from "@/components/ui/primitives";
import { PositionCard } from "../PositionCard";
import { EmptyPositions } from "../states";
import { cn } from "@/utils/cn";

type Filter = "all" | "long" | "short";
type Sort = "exposure" | "risk" | "pnl";

export function PositionsView({
  snapshot,
  onOpenPosition,
  focusId,
}: {
  snapshot: AccountSnapshot;
  onOpenPosition: (position: Position) => void;
  focusId?: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("exposure");
  const [expanded, setExpanded] = useState<string | null>(focusId ?? null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const positions = useMemo(() => {
    const list = snapshot.positions.filter((p) => filter === "all" || p.side === filter);
    const sorted = [...list];
    if (sort === "exposure") sorted.sort((a, b) => b.notional - a.notional);
    if (sort === "pnl") sorted.sort((a, b) => b.unrealizedPnl - a.unrealizedPnl);
    if (sort === "risk")
      sorted.sort(
        (a, b) => (a.liquidation.distanceRatio ?? 99) - (b.liquidation.distanceRatio ?? 99),
      );
    return sorted;
  }, [snapshot.positions, filter, sort]);

  const shown = useMemo(
    () => ({
      notional: positions.reduce((a, p) => a + p.notional, 0),
      pnl: positions.reduce((a, p) => a + p.unrealizedPnl, 0),
      margin: positions.reduce((a, p) => a + p.marginUsed, 0),
    }),
    [positions],
  );

  const handleCard = (position: Position) => {
    if (isDesktop) setExpanded((cur) => (cur === position.id ? null : position.id));
    else onOpenPosition(position);
  };

  if (snapshot.positions.length === 0) return <EmptyPositions address={snapshot.address} />;

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <SectionLabel>Showing</SectionLabel>
              <div className="num mt-1.5 text-[20px] text-mist-50">
                {positions.length}
                <span className="ml-1 text-[12px] text-mist-600">
                  of {snapshot.positions.length}
                </span>
              </div>
            </div>
            <div>
              <SectionLabel>Exposure</SectionLabel>
              <div className="num mt-1.5 text-[20px] text-mist-50">
                {compactUsd(shown.notional)}
              </div>
            </div>
            <div>
              <SectionLabel>Unrealised</SectionLabel>
              <div
                className={cn("num mt-1.5 text-[20px]", pnlTone(shown.pnl))}
              >
                {usd(shown.pnl, { sign: true })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "long", label: "Long" },
                { value: "short", label: "Short" },
              ]}
            />
            <Segmented
              size="sm"
              value={sort}
              onChange={setSort}
              options={[
                { value: "exposure", label: "Size" },
                { value: "risk", label: "Risk" },
                { value: "pnl", label: "PnL" },
              ]}
            />
          </div>
        </div>
      </Panel>

      <div className="space-y-3">
        {positions.map((position, i) => (
          <PositionCard
            key={position.id}
            index={i}
            position={position}
            expanded={expanded === position.id}
            dimmed={Boolean(expanded) && expanded !== position.id}
            allowInline={isDesktop}
            onToggle={() => handleCard(position)}
          />
        ))}
      </div>

      <p className="px-1 pt-1 text-center text-[9px] font-medium tracking-[0.2em] text-mist-700 uppercase">
        margin committed {compactUsd(shown.margin)} · values from hyperliquid mainnet ·{" "}
        {percent(snapshot.summary.marginRatio, 1)} maintenance
      </p>
    </div>
  );
}

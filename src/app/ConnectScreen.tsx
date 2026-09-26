import { useState } from "react";
import { motion } from "motion/react";
import type { AccountSource, LeoraError } from "@/lib/types";
import { SAMPLE_ADDRESS } from "@/services/config";
import { isValidAddress } from "@/services/hyperliquid";
import { connectWallet, hasInjectedWallet } from "@/services/wallet";
import { Button, Panel, Pill } from "@/components/ui/primitives";
import { LeoraSeal } from "@/components/ui/Brand";
import { IconArrowRight, IconEye, IconLock, IconShield, IconWallet } from "@/components/ui/Icons";
import { shortAddress } from "@/lib/format";
import { cn } from "@/utils/cn";

export function ConnectScreen({
  onConnected,
}: {
  onConnected: (address: string, source: AccountSource) => void;
}) {
  const [mode, setMode] = useState<"choose" | "watch">("choose");
  const [watchValue, setWatchValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LeoraError | null>(null);

  const handleWallet = async () => {
    setBusy(true);
    setError(null);
    try {
      const address = await connectWallet();
      onConnected(address, "wallet");
    } catch (err) {
      setError(err as LeoraError);
      if ((err as LeoraError).kind === "wallet-missing") setMode("watch");
    } finally {
      setBusy(false);
    }
  };

  const handleWatch = () => {
    const value = watchValue.trim();
    if (!isValidAddress(value)) {
      setError({
        kind: "invalid-address",
        message: "Enter a complete wallet address starting with 0x.",
      });
      return;
    }
    setError(null);
    onConnected(value.toLowerCase(), "watch");
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-64px)] items-center justify-center px-4 py-10 sm:px-6 lg:min-h-[calc(100dvh-88px)]">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[520px]"
      >
        <Panel tone="deep" className="p-6 sm:p-9">
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-52 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 45% 100% at 50% 100%, rgba(122,132,214,0.22), transparent 70%)",
            }}
          />

          <div className="relative">
            <LeoraSeal size={44} className="mb-6" />
            <Pill tone="gold">
              <IconLock className="h-3 w-3" /> read-only access
            </Pill>

            <h1 className="display-xl mt-6 text-[34px] text-mist-50 italic sm:text-[42px]">
              Your risk, at a glance.
            </h1>
            <p className="mt-4 max-w-[400px] text-[14px] leading-[1.75] text-mist-400">
              Connect a Hyperliquid wallet to inspect your positions, PnL, funding and liquidation
              distance. Leora never requests keys and can never move funds.
            </p>

            <div className="mt-7 space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleWallet}
                disabled={busy}
                icon={<IconWallet className="h-[18px] w-[18px]" />}
              >
                {busy ? "Waiting for wallet…" : "Connect Wallet"}
              </Button>

              {mode === "choose" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => setMode("watch")} icon={<IconEye className="h-4 w-4" />}>
                    Watch an address
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => onConnected(SAMPLE_ADDRESS, "sample")}
                    trailing={<IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  >
                    Sample account
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-[18px] border border-gold-500/[0.16] bg-gold-300/[0.028] p-3">
                    <label className="label-xs">Wallet address</label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        autoFocus
                        value={watchValue}
                        onChange={(e) => setWatchValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleWatch()}
                        placeholder="0x…"
                        spellCheck={false}
                        className={cn(
                          "num h-11 min-w-0 flex-1 rounded-full border border-gold-500/[0.18] bg-ink-950/60 px-4",
                          "font-mono text-[13px] text-mist-100 placeholder:text-mist-600",
                          "outline-none transition-colors focus:border-gold-400/45",
                        )}
                      />
                      <Button size="md" onClick={handleWatch} className="sm:w-auto">
                        View
                      </Button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        onClick={() => onConnected(SAMPLE_ADDRESS, "sample")}
                        className="text-[9.5px] font-medium tracking-[0.18em] text-mist-500 uppercase transition-colors hover:text-mist-200"
                      >
                        use sample · {shortAddress(SAMPLE_ADDRESS, 4)}
                      </button>
                      {hasInjectedWallet() && (
                        <button
                          onClick={() => setMode("choose")}
                          className="text-[9.5px] font-medium tracking-[0.18em] text-mist-500 uppercase transition-colors hover:text-mist-200"
                        >
                          back
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-sand-400/20 bg-sand-400/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-sand-300"
              >
                {error.message}
              </motion.div>
            )}

            <div className="mt-7 grid grid-cols-1 gap-2 border-t border-gold-500/[0.14] pt-5 sm:grid-cols-3">
              {[
                { icon: IconShield, label: "No private keys" },
                { icon: IconEye, label: "Read-only data" },
                { icon: IconLock, label: "No custody" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[11.5px] text-mist-500">
                  <Icon className="h-3.5 w-3.5 text-mist-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-mist-600">
          Leora reads public Hyperliquid mainnet data for the address you provide.
          <br className="hidden sm:block" /> Order execution is disabled in this release.
        </p>
      </motion.div>
    </div>
  );
}

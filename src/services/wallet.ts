import type { LeoraError } from "@/lib/types";

/**
 * Wallet access is read-only by design:
 * we request the account address and nothing else.
 * No private keys, no seed phrases, no signatures, no custody.
 */

function getProvider(): Eip1193Provider | undefined {
  const eth = window.ethereum;
  if (!eth) return undefined;
  if (eth.providers?.length) {
    return eth.providers.find((p) => p.isMetaMask || p.isRabby) ?? eth.providers[0];
  }
  return eth;
}

export function hasInjectedWallet(): boolean {
  return Boolean(getProvider());
}

export function walletError(kind: LeoraError["kind"], message: string): LeoraError {
  return { kind, message };
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw walletError(
      "wallet-missing",
      "No browser wallet detected. Install one, or watch any address instead.",
    );
  }
  try {
    const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
    const address = accounts?.[0];
    if (!address) {
      throw walletError("wallet-unknown", "Your wallet did not return an address.");
    }
    return address.toLowerCase();
  } catch (err) {
    const e = err as { code?: number; kind?: string; message?: string };
    if (e?.kind) throw err;
    if (e?.code === 4001) {
      throw walletError("wallet-rejected", "Connection request was declined in your wallet.");
    }
    if (e?.code === -32002) {
      throw walletError("wallet-unknown", "Your wallet already has a pending request. Open it to continue.");
    }
    throw walletError("wallet-unknown", "Your wallet could not complete the connection.");
  }
}

/** Silent reconnect — never prompts. */
export async function getConnectedAddress(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
    return accounts?.[0]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export function onAccountsChanged(handler: (address: string | null) => void): () => void {
  const provider = getProvider();
  if (!provider?.on) return () => {};
  const listener = (accounts: string[]) => handler(accounts?.[0]?.toLowerCase() ?? null);
  provider.on("accountsChanged", listener);
  return () => provider.removeListener?.("accountsChanged", listener);
}

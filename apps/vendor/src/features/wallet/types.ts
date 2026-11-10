import type { Money } from "@/lib/format";

/** One payout (escrow released to the wallet) or withdrawal (to the vendor's own Stellar address). */
export interface WalletEntry {
	id: string;
	kind: "payout" | "withdrawal";
	/** USDC. */
	amount: string;
	orderNumber: string | null;
	destination: string | null;
	status: "awaiting_confirmation" | "queued" | "submitted" | "confirmed" | "failed";
	txHash: string | null;
	explorerUrl: string | null;
	error: string | null;
	createdAt: string;
	/** A withdrawal waiting for its code must be confirmed by then. */
	confirmBy?: string;
}

/** GET /vendor/wallet (PRD V5): created automatically on approval; Fysi holds the keys (no seed phrase). */
export interface VendorWallet {
	address: string | null;
	status: "pending" | "active" | "none";
	available: Money;
	/** Still in escrow. */
	pending: Money;
	/** The daily withdrawal limit left today. */
	withdrawableToday: Money;
	history: WalletEntry[];
}

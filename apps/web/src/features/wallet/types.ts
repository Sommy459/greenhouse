import type { Money } from "@/lib/format";

/** GET /wallet: the customer's custodial Fysi wallet (C9). Amounts are USDC decimal strings. */
export interface Wallet {
	address: string;
	/** `pending` until the account is open on Stellar. */
	status: "pending" | "active";
	balance: string;
	kycTier: number;
	/** The most the wallet may hold at this KYC tier. */
	balanceCap: Money;
	overCap: boolean;
	/** For the deposit QR (SEP-7). */
	depositUri: string;
	activity: WalletActivity[];
}

export interface WalletActivity {
	direction: "in" | "out";
	amount: string;
	assetCode: string;
	counterparty: string;
	memo: string | null;
	txHash: string;
	explorerUrl: string;
	at: string;
}

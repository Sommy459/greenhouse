/** Money moving on Stellar, as the transaction monitor shows it (PRD A4). Amounts are USDC strings. */

export type PaymentStatus = "matched" | "overpaid" | "unmatched" | "refunded";

/** A row of GET /admin/payments: one incoming payment to the settlement account. */
export interface IncomingPayment {
	id: string;
	status: PaymentStatus;
	/** Null when no order matched the memo. */
	orderNumber: string | null;
	payer: string;
	amount: string;
	assetCode: string;
	memo: string | null;
	/** What can still be sent back. */
	refundable: string;
	note: string | null;
	txHash: string;
	explorerUrl: string;
	at: string;
}

export type TransferKind = "payouts" | "refunds" | "withdrawals";

/** A row of GET /admin/transfers/:kind: money Fysi sends out. */
export interface Transfer {
	id: string;
	kind: "payout" | "refund" | "withdrawal";
	destination: string;
	amount: string;
	status: "queued" | "submitted" | "confirmed" | "failed";
	attempts: number;
	lastError: string | null;
	txHash: string | null;
	explorerUrl: string | null;
	createdAt: string;
}

/** Placeholder shapes until matched to the API. */

/**
 * `open`: the period is still running. `unpaid`: it has closed, but its orders' money is still in escrow (PRD: released
 * on delivery confirmation or 7 days after shipping). `paid`: the payout has reached the wallet.
 */
export const STATEMENT_STATUSES = ["open", "paid", "unpaid"] as const;
export type StatementStatus = (typeof STATEMENT_STATUSES)[number];

/** The wallet holds USDC; prices are set in naira (PRD). Every amount comes in both. */
export type Currency = "ngn" | "usdc";
export interface Money {
	ngn: number;
	usdc: number;
}

/** A row of GET /vendor/statements: one settlement period. */
export interface Statement {
	id: string;
	/** e.g. NG1B6G3-20240825. */
	reference: string;
	period_start: string;
	period_end: string;
	status: StatementStatus;
	/** What reached the wallet for this period: zero until it's paid. */
	payout: Money;
}

/** A line of a statement: a sale (+), a refund (−) or Fysi's commission (−). */
export interface StatementEntry {
	id: string;
	at: string;
	kind: "sale" | "refund" | "commission";
	description: string;
	/** Signed: money in is positive. */
	amount: Money;
	order: { id: string; number: string; released: boolean } | null;
}

/** `data` of GET /vendor/statements/:id (Figma "Details"): opening balance + entries = closing balance. */
export interface StatementDetail extends Statement {
	/** Carried over from the period before (e.g. a refund that came in after it was paid). */
	opening_balance: Money;
	closing_balance: Money;
	entries: StatementEntry[];
	gross_sales: Money;
	/** Fysi's commission (5%, 0% for founding vendors in their first 3 months). */
	commission: Money;
	commission_rate: number;
	refunds: Money;
	/** The transfer to the vendor's wallet (PRD payments rule 5), once paid. */
	payout_tx: { hash: string; network: "testnet" | "public"; at: string } | null;
}

export interface StatementListParams {
	/** Comma-separated; one tab = one status. */
	status?: string;
	page: number;
	limit: number;
}

/** A row of GET /vendor/statements/exports (Figma "Transaction Exports"). Exports are built in the background. */
export interface StatementExport {
	id: string;
	requested_at: string;
	/** When the file was ready (null while preparing). */
	created_at: string | null;
	status: "preparing" | "ready" | "failed";
	currency: Currency;
}

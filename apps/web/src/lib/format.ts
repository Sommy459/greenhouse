/**
 * Prices are US dollars in integer cents (API `{ cents, usd }`), paid 1:1 in USDC on Stellar. On-chain amounts (amount
 * due, balances, transactions) come as USDC decimal strings.
 */
export interface Money {
	cents: number;
	usd: string;
}

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** $12.50 */
export const price = (amount: Money | number) => dollars.format((typeof amount === "number" ? amount : amount.cents) / 100);

/** "12.5" → "12.50 USDC" */
export const usdc = (amount: string | number) =>
	`${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 })} USDC`;

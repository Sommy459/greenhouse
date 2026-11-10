/**
 * Prices are US dollars in integer cents (API `{ cents, usd }`), paid 1:1 in USDC on Stellar. On-chain amounts
 * (balances, payouts, withdrawals) come as USDC decimal strings.
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

export const count = (n: number) => n.toLocaleString("en-US");

/** "1st July, 2023" (Figma's date card). */
export function longDate(date: Date) {
	const day = date.getDate();
	const suffix =
		day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
	return `${day}${suffix} ${date.toLocaleString("en-GB", { month: "long" })}, ${date.getFullYear()}`;
}

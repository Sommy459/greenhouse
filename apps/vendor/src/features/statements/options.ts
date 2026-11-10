import type { Currency, Money, StatementStatus } from "@/features/statements/types";
import { naira } from "@/lib/format";

export const STATUS_LABEL: Record<StatementStatus, string> = { open: "Open", paid: "Paid", unpaid: "Unpaid" };

export const STATUS_TONE: Record<StatementStatus, string> = {
	open: "bg-grey-500 text-ink",
	paid: "bg-success-50 text-success-700",
	unpaid: "bg-warning-50 text-warning-700",
};

/** An amount in the chosen currency: ₦12,900.00 or 7.84 USDC. */
export const money = (m: Money, currency: Currency) =>
	currency === "ngn"
		? naira(m.ngn, 2)
		: `${m.usdc.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

/** Figma "Details" style: 12,900.00 NGN or −7.84 USDC. */
export const amount = (m: Money, currency: Currency) => {
	const value = m[currency];
	const digits = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	return `${value < 0 ? "−" : ""}${digits} ${currency.toUpperCase()}`;
};

/** Figma "19 Aug – 31st Aug 2024". */
export function periodLabel(start: string, end: string) {
	const a = new Date(start);
	const b = new Date(end);
	const suffix = (d: number) =>
		d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th";
	const month = (d: Date) => d.toLocaleString("en-GB", { month: "short" });
	return `${a.getDate()} ${month(a)} – ${b.getDate()}${suffix(b.getDate())} ${month(b)} ${b.getFullYear()}`;
}

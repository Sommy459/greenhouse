/** Whole naira with separators: ₦75,500. `decimals` shows kobo places (₦900.00) for table amounts. */
export const naira = (amount: number, decimals = 0) =>
	`₦${amount.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

/** Short naira: ₦20k, ₦1.5k, ₦2.4m. */
export function nairaShort(amount: number) {
	const short = (n: number) => String(Math.round(n * 10) / 10);
	if (amount >= 1_000_000) return `₦${short(amount / 1_000_000)}m`;
	if (amount >= 1000) return `₦${short(amount / 1000)}k`;
	return `₦${amount}`;
}

export const count = (n: number) => n.toLocaleString("en-NG");

/** "1st July, 2023" (Figma's date card). */
export function longDate(date: Date) {
	const day = date.getDate();
	const suffix =
		day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
	return `${day}${suffix} ${date.toLocaleString("en-GB", { month: "long" })}, ${date.getFullYear()}`;
}

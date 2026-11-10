/** ₦12,900 (prices are whole naira); `decimals` for statements and totals. */
export const naira = (amount: number, decimals = 0) =>
	`₦${amount.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

/** 7.84 USDC */
export const usdc = (amount: number) =>
	`${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

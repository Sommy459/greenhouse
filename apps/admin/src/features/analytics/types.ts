/** Placeholder shapes until matched to the API. Money is whole naira. */

/** Figma "Daily / Week / Month": the last 14 days, the last 12 weeks, or January to December. */
export const SALES_PERIODS = ["daily", "weekly", "monthly"] as const;
export type SalesPeriod = (typeof SALES_PERIODS)[number];

/** `data` of GET /admin/analytics?period=… */
export interface SalesAnalytics {
	period: SalesPeriod;
	/** Paid sales over the whole period (the badge beside "Overall Sales" and "Sales Report"). */
	total: number;
	/** One bar each, oldest first; `label` is what the axis shows (e.g. "Jan", "3 Nov", "W45"). */
	sales: { label: string; amount: number }[];
	/** "Sales Report": the same total split by category, largest first. */
	by_category: { category: string; amount: number }[];
}

/** A row of GET /admin/analytics/best-sellers. */
export interface BestSellingProduct {
	id: string;
	name: string;
	image_url: string | null;
	category: string;
	/** Units sold in the chosen dates. */
	sold: number;
	/** Average customer rating, 0–5. */
	rating: number;
	vendor: { id: string; shop_name: string; location: string; avatar_url: string | null };
}

export interface BestSellerParams {
	from?: string;
	to?: string;
	/** Comma-separated category names. */
	category?: string;
	page: number;
	limit: number;
}

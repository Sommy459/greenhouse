/** GET /admin/analytics: marketplace totals over a range, each against the same range before it. Money is US cents. */
import type { Money } from "@/lib/format";

export type Period = "day" | "week" | "month";

/** `change` is a percentage (null without a previous value). */
export interface Metric<T> {
	value: T;
	previous: T;
	change: number | null;
}

export interface Ranked {
	id: string;
	name: string;
	orders: number;
	sales: Money;
}

export interface AdminAnalytics {
	from: string;
	to: string;
	/** Everything customers paid. */
	gmv: Metric<Money>;
	commission: Metric<Money>;
	orders: Metric<number>;
	averageOrder: Metric<Money>;
	newCustomers: Metric<number>;
	newVendors: Metric<number>;
	buyers: Metric<number>;
	/** Buyers who ordered more than once, in %. */
	repeatBuyerRate: number | null;
	refunds: Metric<Money>;
	vendorOrdersByStatus: Record<string, number>;
	series: { period: string; orders: number; gmv: Money; commission: Money; newCustomers: number; newVendors: number }[];
	topVendors: Ranked[];
	topProducts: Ranked[];
	topCategories: Ranked[];
}

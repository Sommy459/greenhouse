import type { VendorOrder } from "@/features/orders/types";

/** `data` of GET /vendor/dashboard (placeholder shape until matched to the API). Money is whole naira. */
export interface VendorDashboard {
	/** Each `change` is a percentage on the previous period, e.g. 10 for +10%. */
	totals: {
		revenue: number;
		revenue_change: number;
		/** Stock-keeping units across the shop's listings. */
		skus: number;
		skus_change: number;
		avg_order_value: number;
		avg_order_value_change: number;
		/** Available wallet balance (PRD V5). */
		balance: number;
		balance_change: number;
	};
	/** January first. Revenue = paid orders; payouts = money released from escrow to the wallet (PRD payments rule 4). */
	sales_by_month: { month: string; revenue: number; payouts: number }[];
	/** Share of this shop's customers who ordered in the last 90 days, 0–100. */
	active_customers: number;
	recent_orders: VendorOrder[];
}

/** `data` of GET /admin/dashboard (placeholder shape until matched to the API). Money is whole naira. */
export interface Dashboard {
	totals: {
		revenue: number;
		/** Percentage change on the previous period, e.g. 10 for +10%. */
		revenue_change: number;
		new_clients: number;
		visited_users: number;
		vendors: number;
		orders: number;
	};
	/** This quarter's revenue against target. */
	sales_progress: {
		target: number;
		revenue: number;
		today: number;
		yesterday: number;
		/** Percentage change on last quarter. */
		change: number;
	};
	/** Orders per month, January first. */
	sales_by_month: { month: string; sales: number }[];
	best_sellers: BestSeller[];
	/** Shares of requests, 0–100. */
	website_health: { speed: number; error: number };
}

export interface BestSeller {
	id: string;
	name: string;
	sold: number;
	price: number;
	profit: number;
}

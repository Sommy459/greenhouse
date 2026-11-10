/** Vendor insights in the Fysi API: dashboard, analytics, product stats, statements, reviews. Money is US cents. */
import type { Money } from "@/lib/format";

/** GET /vendor/dashboard: what needs doing now, and the last 30 days. */
export interface VendorDashboard {
	orders: { toShip: number; inTransit: number; problems: number; awaitingConfirmation: number };
	products: { active: number; hidden: number; outOfStock: number; lowStock: number };
	/** Still in escrow. */
	pendingPayout: Money;
	last30DaysSales: Money;
	last30DaysOrders: number;
	rating: { average: number | null; count: number };
	runningPromotions: number;
	unreadNotifications: number;
}

/** A figure with the same range before it; `change` is a percentage (null without a previous value). */
export interface Metric<T> {
	value: T;
	previous: T;
	change: number | null;
}

export interface SeriesPoint {
	period: string;
	orders: number;
	units: number;
	sales: Money;
	/** After Fysi's commission. */
	net: Money;
}

export type Period = "day" | "week" | "month";

/** GET /vendor/analytics */
export interface VendorAnalytics {
	from: string;
	to: string;
	sales: Metric<Money>;
	net: Metric<Money>;
	orders: Metric<number>;
	units: Metric<number>;
	averageOrder: Metric<Money>;
	views: Metric<number>;
	/** Orders per product view, in %. */
	conversionRate: number | null;
	refunds: Metric<Money>;
	series: SeriesPoint[];
	topProducts: { productId: string; title: string; units: number; sales: Money }[];
}

/** A row of GET /vendor/product-stats */
export interface ProductStat {
	productId: string;
	title: string;
	slug: string;
	price: Money;
	stock: number;
	status: string;
	views: number;
	orders: number;
	units: number;
	sales: Money;
	conversionRate: number | null;
	wishlisted: number;
	rating: { average: number | null; count: number };
}

/** GET /vendor/statements (Figma "Account Statements"): oldest first with a running balance. */
export interface Statement {
	from: string;
	to: string;
	openingBalance: Money;
	grossSales: Money;
	commission: Money;
	refunds: Money;
	netEarnings: Money;
	withdrawals: Money;
	closingBalance: Money;
	entries: {
		at: string;
		type: "sale" | "commission" | "refund" | "withdrawal";
		reference: string;
		description: string;
		/** Signed. */
		amount: Money;
		balance: Money;
		/** For sales: `held` (in escrow) or paid out. */
		status: string;
	}[];
}

/** A row of GET /vendor/reviews */
export interface ProductReview {
	id: string;
	rating: number;
	title: string | null;
	body: string;
	author: string;
	verifiedPurchase: boolean;
	product: { id: string; title: string; slug: string };
	createdAt: string;
	updatedAt: string;
}

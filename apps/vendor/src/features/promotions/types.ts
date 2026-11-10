/** Placeholder shapes until matched to the API. Discounts and promotions are outside the PRD's MVP (release step 4). */

/** `open`: products can still be enrolled; `ongoing`: the discount is live; then it ends (`expired`) or is `cancelled`. */
export const PROMOTION_STATUSES = ["open", "ongoing", "cancelled", "expired"] as const;
export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export const DISCOUNT_TYPES = ["percent", "fixed"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

/** A row of GET /vendor/promotions (Figma "Promotion Management"). */
export interface Promotion {
	id: string;
	name: string;
	/** The window for enrolling products (Figma "Registration End Date" shows the range). */
	registration_start: string;
	registration_end: string;
	/** How long the discount runs once it starts. */
	duration_days: number;
	/** Figma "Discount Criteria": the rule. `value` is a percentage, or whole naira off. */
	discount: { type: DiscountType; value: number; min_order: number | null };
	status: PromotionStatus;
	products_count: number;
}

export interface PromotionListParams {
	status?: PromotionStatus;
	search?: string;
	/** Comma-separated discount types. */
	type?: string;
	page: number;
	limit: number;
}

/** A row of GET /vendor/promotions/performance (Figma "Monitor Promotions"): one product in one promotion. */
export interface PromotionSale {
	id: string;
	product: { id: string; name: string; sku: string };
	promotion: { id: string; name: string; status: PromotionStatus };
	items_sold: number;
	/** Whole naira, after the discount. */
	revenue: number;
	duration_days: number;
}

/** The cards above the table, for the same filters as the rows. `*_change` compare with the previous period (%). */
export interface PromotionSummary {
	/** "Total Sales from Promotions". */
	sales: number;
	sales_change: number;
	/** "Avg. Sales before campaign": the products' sales over the same length of time before each promotion. */
	baseline: number;
	baseline_change: number;
	/** (sales − baseline) / baseline, in %. */
	uplift: number;
	uplift_change: number;
}

export interface PromotionPerformance {
	summary: PromotionSummary;
	/** Set when the list is narrowed to one promotion (`?promotion=`). */
	promotion: { id: string; name: string } | null;
	items: PromotionSale[];
	meta: { page: number; total_pages: number; total: number };
}

export interface PerformanceParams {
	promotion?: string;
	status?: PromotionStatus;
	page: number;
	limit: number;
}

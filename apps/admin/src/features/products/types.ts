/** A product as the admin sees it, across every shop (placeholder shape until matched to the API). Prices are whole naira. */
export interface AdminProduct {
	id: string;
	name: string;
	category: string;
	price: number;
	description: string;
	image_url: string | null;
	sold: number;
	/** Units in stock. */
	quantity: number;
	created_at: string;
	/** Moderation (PRD A5): hidden products stay in the console but customers don't see them. */
	visibility: ProductVisibility;
	/** Why an admin hid it; the vendor sees this. */
	hidden_reason: string | null;
	/** The shop selling it; null for a product Fysi added itself. */
	vendor: { id: string; shop_name: string } | null;
}

export const PRODUCT_VISIBILITIES = ["visible", "hidden"] as const;
export type ProductVisibility = (typeof PRODUCT_VISIBILITIES)[number];

export type ProductSort = "newest" | "best_selling" | "price_low" | "price_high";

export interface ProductListParams {
	search?: string;
	sort?: ProductSort;
	/** Comma-separated visibilities. */
	visibility?: string;
	page: number;
	limit: number;
	/** ISO dates, inclusive. */
	from?: string;
	to?: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	thumbnail_url: string | null;
}

export interface Paginated<T> {
	items: T[];
	meta: { page: number; total_pages: number; total: number };
}

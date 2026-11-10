/** Placeholder shapes until matched to the API. Prices are whole naira. */

/** `active` = on sale; `inactive` = hidden by the vendor (PRD V7). */
export type ProductStatus = "active" | "inactive";

/** What the Figma status pill says: worked out from status, stock and admin moderation. */
export const STOCK_STATES = ["in_stock", "out_of_stock", "inactive", "hidden_by_fysi"] as const;
export type StockState = (typeof STOCK_STATES)[number];

/** A row of GET /vendor/products (Figma "Manage Products"). */
export interface VendorProduct {
	id: string;
	name: string;
	/** Variants beyond the base listing ("3 Variants"); 0 when there's only one. */
	variants_count: number;
	/** The vendor's own stock code (Figma "Seller SKU"). */
	sku: string;
	price: number;
	category: string;
	/** Units in stock, across variants. */
	quantity: number;
	status: ProductStatus;
	/** Set when a Fysi admin hid the listing (PRD A5); the vendor sees why. */
	moderation: { reason: string; at: string } | null;
	image_url: string | null;
	created_at: string;
}

export type ProductSortKey = "name" | "sku" | "quantity";
export type ProductSort = `${ProductSortKey}_${"asc" | "desc"}`;

export interface ProductListParams {
	search?: string;
	/** Comma-separated stock states. */
	state?: string;
	from?: string;
	to?: string;
	sort?: ProductSort;
	page: number;
	limit: number;
}

/** `data` of GET /vendor/products/stats; each `change` is a percentage on the previous period. */
export interface ProductStats {
	total: number;
	total_change: number;
	sold: number;
	sold_change: number;
	refunded: number;
	refunded_change: number;
	cancelled: number;
	cancelled_change: number;
}

export interface Paginated<T> {
	items: T[];
	meta: { page: number; total_pages: number; total: number };
}

/** The pill for a row. Admin moderation wins, then the vendor's own hide, then stock. */
export function stockState(p: VendorProduct): StockState {
	if (p.moderation) return "hidden_by_fysi";
	if (p.status === "inactive") return "inactive";
	return p.quantity > 0 ? "in_stock" : "out_of_stock";
}

/** A storefront category (GET /categories). */
export interface Category {
	id: string;
	name: string;
	slug: string;
}

/** One of the shop's own certificates (GET /vendor/certifications), for tagging a product. */
export interface ShopCertification {
	id: string;
	name: string;
	badge: "certified" | "fysi_reviewed";
	status: "pending" | "verified" | "rejected" | "revoked";
}

/** Shapes of the Fysi API's catalogue (https://fysi-backend-production.up.railway.app/docs). */
import type { Money } from "@/lib/format";

export type { Paginated } from "@/lib/api/client";

/** Recognised labels (PRD) and Nigeria's SON. */
export type CertificationId =
	"gots" | "oeko_tex" | "fsc" | "fairtrade" | "rainforest_alliance" | "eu_ecolabel" | "usda_organic" | "son";

/**
 * PRD badges, from admin decisions only: "Certified" (a verified recognised label) or "Fysi Reviewed" (evidence the
 * Fysi team checked). Null when neither applies.
 */
export type Badge = "certified" | "fysi_reviewed";

export interface Certification {
	id: CertificationId;
	name: string;
}

/** GET /categories */
export interface Category {
	id: string;
	name: string;
	slug: string;
	productCount: number;
}

export interface CategoryRef {
	id: string;
	name: string;
	slug: string;
}

export interface ProductVendor {
	slug: string;
	businessName: string;
	verified: boolean;
	badge: Badge | null;
	/** Product page only. */
	logoUrl?: string | null;
	city?: string | null;
	state?: string | null;
}

/** A row of GET /products. */
export interface Product {
	id: string;
	slug: string;
	title: string;
	/** What the customer pays now, after any vendor promotion. */
	price: Money;
	/** The price before the promotion (struck through); null when not on sale. */
	originalPrice: Money | null;
	discountPercent: number | null;
	inStock: boolean;
	imageUrl: string | null;
	badge: Badge | null;
	certifications: Certification[];
	category: CategoryRef | null;
	vendor: ProductVendor;
	createdAt: string;
}

/** GET /products/:slug */
export interface ProductDetail extends Product {
	description: string;
	stock: number;
	/** Customer reviews: average stars (null before the first) and how many. */
	rating: { average: number | null; count: number };
	images: { id: string; url: string | null; position: number }[];
}

/** GET /vendors/:slug (store page). */
export interface Store {
	slug: string;
	businessName: string;
	description: string | null;
	logoUrl: string | null;
	city: string | null;
	state: string | null;
	category: CategoryRef | null;
	badge: Badge | null;
	certifications: Certification[];
	productCount: number;
	verifiedSince: string;
}

export type SortValue = "relevance" | "newest" | "price_asc" | "price_desc";

/** GET /products query (C2, C3). Prices are in cents. */
export interface ProductQuery {
	q?: string;
	/** A category slug. */
	category?: string;
	/** A store slug. */
	vendor?: string;
	minPriceCents?: number;
	maxPriceCents?: number;
	/** Only products with the "Certified" badge. */
	certified?: boolean;
	inStock?: boolean;
	sort?: SortValue;
	page?: number;
	limit?: number;
}

export const BADGE_LABEL: Record<Badge, string> = { certified: "Certified", fysi_reviewed: "Fysi Reviewed" };

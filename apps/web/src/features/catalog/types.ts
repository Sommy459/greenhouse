export type Collection = "new-in" | "on-demand" | "hot-deals" | "sustainability";

export interface Category {
	id: string;
	slug: string;
	name: string;
	description: string;
}

export interface VendorSummary {
	id: string;
	shop_name: string;
	slug: string;
	city: string;
	state: string;
	logo_url: string | null;
}

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	status: "pending" | "verified" | "rejected" | "revoked";
}

/** Prices are whole naira. */
export interface Product {
	id: string;
	slug: string;
	/** Stock-keeping unit, shown on the product page. */
	sku: string;
	name: string;
	description: string;
	price: number;
	compare_at_price: number | null;
	images: string[];
	materials: string[];
	sourcing: string;
	stock: number;
	/** Main colours, lower-case (e.g. ["green", "brown"]), for the Filter menu's Color section. */
	colors: string[];
	/** Short product attributes shown as chips on the product page (e.g. "Non toxic", "Biodegradable"). */
	tags: string[];
	/** 0–100, from admin-verified data only. */
	sustainability_score: number | null;
	/** The eco-certification badge (C4). */
	eco_verified: boolean;
	collections: Collection[];
	featured: boolean;
	rating: number;
	review_count: number;
	created_at: string;
	vendor: VendorSummary | null;
	category: Pick<Category, "id" | "slug" | "name"> | null;
}

export interface ProductDetail extends Product {
	certifications: Certification[];
}

/** A customer review (C9): only customers whose order was delivered can leave one. */
export interface Review {
	id: string;
	author: { name: string; avatar_url: string | null };
	/** 1–5. */
	rating: number;
	comment: string;
	/** A photo the customer added, if any. */
	photo_url?: string | null;
	created_at: string;
}

/** What "Leave a review" sends (Figma "Your Opinion is Important to us"). Sent as multipart when there's a photo. */
export interface ReviewInput {
	name: string;
	email: string;
	rating: number;
	comment: string;
	photo: File | null;
}

export interface Paginated<T> {
	items: T[];
	meta: { page: number; limit: number; total: number; total_pages: number };
}

/** Filter ▾ → Availability (Figma): popular products, products on sale. Neither means all. */
export type Availability = "popular" | "sale";

/** GET /products query (C2, C3). List filters are comma-separated: category=clothing,kitchen. */
export interface ProductQuery {
	category?: string;
	collection?: Collection;
	/** Comma-separated colours (Filter ▾ → Color). */
	colors?: string;
	/** Comma-separated: popular, sale (Filter ▾ → Availability). Either one matches; omitted means all. */
	availability?: string;
	q?: string;
	min_price?: number;
	max_price?: number;
	min_rating?: number;
	verified?: boolean;
	featured?: boolean;
	sort?: "newest" | "price_asc" | "price_desc" | "rating";
	page?: number;
	limit?: number;
}

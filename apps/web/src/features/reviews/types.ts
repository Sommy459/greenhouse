/** Reviews in the Fysi API: customers review products from delivered orders (one review per order line). */

/** A row of GET /reviews/pending (Figma "Reviews"): a delivered product the customer hasn't rated yet. */
export interface PendingReview {
	orderLineId: string;
	orderNumber: string;
	product: { id: string; title: string; slug: string };
	imageUrl: string | null;
	vendorName: string | null;
	quantity: number;
	deliveredAt: string | null;
}

/** A published review (product page). */
export interface Review {
	id: string;
	/** 1–5 */
	rating: number;
	title: string | null;
	body: string;
	author: string;
	verifiedPurchase: boolean;
	product: { id: string; title: string; slug: string };
	createdAt: string;
	updatedAt: string;
}

/** The customer's own review (GET /reviews), with moderation. */
export interface MyReview extends Review {
	status: "visible" | "hidden";
	/** Why Fysi hid it. */
	moderationReason: string | null;
	orderLineId: string;
}

/** GET /products/:slug/reviews/summary. `distribution` counts reviews per star ("1"–"5"). */
export interface RatingSummary {
	average: number | null;
	count: number;
	distribution: Record<string, number>;
}

export interface ReviewInput {
	rating: number;
	title: string | null;
	body: string;
}

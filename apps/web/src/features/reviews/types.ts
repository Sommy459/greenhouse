/** A row of GET /reviews/pending (Figma "Reviews"): a delivered product the customer hasn't rated yet. */
export interface PendingReview {
	id: string;
	product: { slug: string; name: string; image_url: string | null };
	order: { id: string; number: string };
	delivered_at: string;
}

/** Placeholders until matched to the external API (docs/PLAN.md). */

/** A row of GET /inbox (Figma "Messages"): an order update or a note from Fysi. Newest first. */
export interface InboxMessage {
	id: string;
	created_at: string;
	kind: "payment" | "shipped" | "delivered" | "closed" | "general";
	/** First line, e.g. "Package delivered!". */
	title: string;
	body: string;
	/** "View Details" opens this order. */
	order: { id: string; number: string } | null;
	/** The product card under the message. */
	product: { name: string; slug: string; image_url: string | null } | null;
}

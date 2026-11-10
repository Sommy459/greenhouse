/** A row of GET /inbox (Figma "Messages"): an order update, a review nudge or a Fysi announcement. Newest first. */
export interface InboxMessage {
	id: string;
	/** e.g. order_paid, order_shipped, order_delivered, review_request, announcement. */
	kind: string;
	title: string;
	body: string;
	/** Where "View Details" goes (an app path or a full URL), if anywhere. */
	link: string | null;
	data: Record<string, unknown>;
	read: boolean;
	readAt: string | null;
	createdAt: string;
}

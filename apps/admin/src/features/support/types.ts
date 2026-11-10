/** Placeholder shapes until matched to the API. */

/** A report's progress. The Figma pill reads "Online" (placeholder copy); these are the states support works with. */
export const TICKET_STATUSES = ["open", "in_progress", "resolved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** A row of GET /admin/support/tickets: a customer's "Report a Product / Problem" (storefront /help/report, PRD C8). */
export interface SupportTicket {
	id: string;
	/** The product's code, e.g. EC2010631 (null when the report isn't about a product). */
	product_code: string | null;
	/** The customer's code, e.g. AE642096. */
	customer_code: string;
	subject: string;
	status: TicketStatus;
	/** The product's category (Figma "Item category"). */
	category: string | null;
	created_at: string;
}

export interface TicketListParams {
	/** Comma-separated statuses. */
	status?: string;
	page: number;
	limit: number;
}

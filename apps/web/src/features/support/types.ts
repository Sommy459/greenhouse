/** Support tickets in the Fysi API ("Report a problem / contact support"). */

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

export interface TicketSummary {
	id: string;
	/** e.g. TK-1042 */
	number: string;
	category: "order" | "payment" | "delivery" | "product" | "account" | "vendor" | "other";
	subject: string;
	/** `pending` = waiting for the customer's reply. */
	status: TicketStatus;
	priority: "low" | "normal" | "high" | "urgent";
	orderNumber: string | null;
	vendorOrderId: string | null;
	productId: string | null;
	lastMessageAt: string;
	createdAt: string;
}

export interface Ticket extends TicketSummary {
	messages: { id: string; authorType: "requester" | "staff"; authorName: string; body: string; createdAt: string }[];
	canReply: boolean;
}

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
	open: "Open",
	pending: "Waiting for you",
	resolved: "Resolved",
	closed: "Closed",
};

export const TICKET_STATUS_TONE: Record<TicketStatus, string> = {
	open: "bg-info-50 text-info-500",
	pending: "bg-warning-50 text-warning-700",
	resolved: "bg-success-50 text-success-700",
	closed: "bg-grey-500 text-grey-900",
};

/** Help desk tickets in the Fysi API (GET /admin/tickets): from customers, vendors and visitors. */

export const TICKET_STATUSES = ["open", "pending", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export const TICKET_CATEGORIES = ["order", "payment", "delivery", "product", "account", "vendor", "other"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export interface Ticket {
	id: string;
	number: string;
	category: TicketCategory;
	subject: string;
	status: TicketStatus;
	priority: TicketPriority;
	orderNumber: string | null;
	vendorOrderId: string | null;
	productId: string | null;
	lastMessageAt: string;
	createdAt: string;
	name: string;
	email: string;
	userId: string | null;
	userRole: string | null;
	assignedTo: string | null;
	assignedToName: string | null;
	messageCount: number;
}

export interface TicketDetail extends Ticket {
	messages: { id: string; authorType: "requester" | "staff"; authorName: string; body: string; createdAt: string }[];
	resolvedAt: string | null;
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
	open: "Open",
	pending: "Waiting on them",
	resolved: "Resolved",
	closed: "Closed",
};
export const STATUS_TONE: Record<TicketStatus, string> = {
	open: "bg-info-50 text-info-500",
	pending: "bg-warning-50 text-warning-700",
	resolved: "bg-success-50 text-success-700",
	closed: "bg-grey-500 text-grey-900",
};
export const PRIORITY_LABEL: Record<TicketPriority, string> = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" };
export const PRIORITY_TONE: Record<TicketPriority, string> = {
	low: "text-grey-800",
	normal: "text-ink",
	high: "text-warning-700",
	urgent: "text-error-500 font-semibold",
};
export const CATEGORY_LABEL: Record<TicketCategory, string> = {
	order: "Order",
	payment: "Payment",
	delivery: "Delivery",
	product: "Product",
	account: "Account",
	vendor: "Selling on Fysi",
	other: "Other",
};

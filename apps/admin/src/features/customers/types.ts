/** Placeholder shapes until matched to the API. Money is whole naira. */

export const CUSTOMER_STATUSES = ["active", "blocked"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

/** Figma tabs: everyone, or customers who joined in the last 30 days. */
export type CustomerTab = "all" | "new";

export interface AdminCustomer {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	avatar_url: string | null;
	orders_count: number;
	/** The customer's wallet / store-credit balance (Figma "Balance"). */
	balance: number;
	created_at: string;
	status: CustomerStatus;
}

/** `data` of GET /admin/customers/:id: the Customers Details page. */
export interface CustomerDetail extends AdminCustomer {
	/** The ID shown to staff, e.g. ID-011221. */
	code: string;
	/** Shown as @username. */
	username: string;
	/** Default delivery address. */
	address: string | null;
	/** "Latest Transaction": when they last ordered. */
	last_order_at: string | null;
	/** Has an active subscription (the "Subscribed" pill). */
	subscribed: boolean;
	rewards_points: number;
	/** Percentage change on the previous period, per total card (e.g. -25). */
	changes: { balance: number; orders: number; rewards_points: number };
}

export interface CustomerListParams {
	tab?: CustomerTab;
	search?: string;
	/** Comma-separated statuses. */
	status?: string;
	page: number;
	limit: number;
}

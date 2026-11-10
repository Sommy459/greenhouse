/** Placeholder shapes until matched to the API. Money is whole naira. */

/**
 * PRD V8 (Paid → Processing → Shipped → Delivered, or Cancelled), plus the Figma tabs' Delivery Failed and Returned.
 * Orders reach the vendor already paid on Stellar, so there's no "pending" state here.
 */
export const ORDER_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled", "delivery_failed", "returned"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** PRD C6: every order is paid in USDC on Stellar, one of four ways. */
export const PAYMENT_METHODS = ["fysi_wallet", "external_wallet", "qr_code", "payment_link"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Figma tabs above the list. */
export const ORDER_TABS = ["all", "shipped", "cancelled", "delivery_failed", "returned"] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export type OrderSort = "newest" | "product_asc" | "product_desc";

/** A row of GET /vendor/orders (and the dashboard's Recent Orders). */
export interface VendorOrder {
	id: string;
	/** The number customers see, e.g. FY3020123495. */
	number: string;
	/** The first item; the rest are counted in `other_items`. */
	first_item: { name: string; image_url: string | null };
	other_items: number;
	items_count: number;
	created_at: string;
	/** This shop's share of the order, in naira. */
	total: number;
	payment_method: PaymentMethod;
	status: OrderStatus;
	/** Set once shipped: who carries it and their tracking number. */
	shipment: { courier: string; tracking_number: string } | null;
}

/** One line of Order Tracking. Done steps carry when they happened; upcoming ones the time they're expected from. */
export interface TrackingStep {
	label: string;
	state: "done" | "upcoming" | "stopped";
	at: string | null;
}

/** `data` of GET /vendor/orders/:id: the Order Details dialog. */
export interface OrderDetail {
	id: string;
	number: string;
	created_at: string;
	recipient: { name: string; phone_number: string; email: string; address: string };
	items: { id: string; name: string; image_url: string | null; quantity: number; price: number }[];
	subtotal: number;
	/** e.g. 7.5 for 7.5%. */
	vat_rate: number;
	vat: number;
	shipping: number;
	total: number;
	payment_method: PaymentMethod;
	shipping_method: "door_delivery" | "pickup";
	status: OrderStatus;
	tracking: TrackingStep[];
	/** Set when the vendor marks it Shipped (PRD V8). */
	shipment: { courier: string; tracking_number: string } | null;
	/** The Stellar payment (PRD payments rule 5). */
	payment: { tx_hash: string; network: "testnet" | "public" };
	/** e.g. 5 for 5%; 0 for founding vendors in their first 3 months. */
	commission_rate: number;
	commission: number;
	/** What reaches the vendor's wallet: the order total minus commission. */
	payout: number;
	/** Escrow (PRD decision): held until delivery is confirmed (or 7 days after Shipped), then released. */
	payout_status: "held" | "released" | "refunded";
	/** Why it was cancelled, when it was. */
	cancel_reason: string | null;
}

export interface OrderListParams {
	tab?: Exclude<OrderTab, "all">;
	/** Order number or product name. */
	search?: string;
	from?: string;
	to?: string;
	/** Comma-separated statuses. */
	status?: string;
	sort?: Exclude<OrderSort, "newest">;
	page: number;
	limit: number;
}

/** POST /vendor/orders/:id/status. */
export interface StatusUpdate {
	status: OrderStatus;
	courier?: string;
	tracking_number?: string;
	reason?: string;
}

/** Placeholders until matched to the external API (docs/PLAN.md). Prices are whole naira. */

/**
 * `paid`: the USDC payment is confirmed and held in escrow. `shipped`: on the way. `delivered`: the customer confirmed
 * (or 7 days passed since shipping), which releases the money to the vendor.
 */
export const ORDER_STATUSES = [
	"pending_payment",
	"paid",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"delivery_failed",
	"returned",
] as const;
export type CustomerOrderStatus = (typeof ORDER_STATUSES)[number];

/** Orders that ended without the customer keeping them: the USDC goes back to their wallet. */
export type ClosedStatus = Extract<CustomerOrderStatus, "cancelled" | "delivery_failed" | "returned">;

/** Figma "Status History" steps. */
export const ORDER_STEPS = ["received", "processing", "on_the_way", "delivered"] as const;
export type OrderStep = (typeof ORDER_STEPS)[number];

/** How the order was paid (PRD: USDC on Stellar only). */
export type StellarPaymentMethod = "fysi_wallet" | "external_wallet" | "qr_code" | "payment_link";

export interface CustomerOrderItem {
	id: string;
	product_id: string;
	/** For "Buy Again" and the product link. */
	slug: string;
	name: string;
	image_url: string | null;
	quantity: number;
	/** Unit price paid. */
	price: number;
	vendor_name: string | null;
}

/** `data` of GET /orders/:id (Figma "Order Detail"). */
export interface CustomerOrder {
	id: string;
	/** e.g. FY3020123495. */
	number: string;
	created_at: string;
	status: CustomerOrderStatus;
	items: CustomerOrderItem[];
	delivery: {
		method: "door_delivery" | "pickup";
		recipient: string;
		phone_number: string;
		address: string;
	};
	payment: {
		method: StellarPaymentMethod;
		/** The USDC actually paid (locked quote). */
		amount_usdc: number;
		tx_hash: string;
		network: "testnet" | "public";
		paid_at: string;
	} | null;
	subtotal: number;
	discount: number;
	shipping: number;
	total: number;
	/** When each step happened (null: not yet). */
	timeline: Record<OrderStep, string | null>;
	/** Set when it was cancelled, couldn't be delivered or was returned. */
	closed: { status: ClosedStatus; at: string; reason: string; refund_tx_hash: string | null } | null;
	/** Problems can be reported until 7 days after delivery (PRD C8); null before delivery. */
	report_until: string | null;
	/** Still inside that window (the API decides, so the browser clock doesn't matter). */
	can_report: boolean;
}

/** A row of GET /orders (Figma "Orders" / "Order History"). */
export interface CustomerOrderRow {
	id: string;
	number: string;
	created_at: string;
	status: CustomerOrderStatus;
	total: number;
	items_count: number;
	/** The first product, for the phone cards. */
	first_item: { name: string; image_url: string | null };
}

export interface OrderListParams {
	/** Comma-separated statuses (a tab). */
	status?: string;
	page: number;
	limit: number;
}

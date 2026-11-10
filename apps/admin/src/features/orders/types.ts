/** Placeholder shapes until matched to the API. Money is whole naira. */

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "failed", "returned"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["visa", "mastercard", "verve", "transfer", "ussd", "pay_on_delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** The quick ranges above the table (Figma): all time, or the last 12 months, 30 days, 7 days or 24 hours. */
export const ORDER_PERIODS = ["all", "12m", "30d", "7d", "24h"] as const;
export type OrderPeriod = (typeof ORDER_PERIODS)[number];

export type OrderSort = "newest" | "product_asc" | "product_desc";

export interface AdminOrder {
	id: string;
	/** The number customers see, e.g. 3020123495. */
	number: string;
	/** The first item; the rest are counted in `other_items`. */
	first_item: { name: string; image_url: string | null };
	other_items: number;
	customer: { id: string; name: string };
	created_at: string;
	total: number;
	payment_method: PaymentMethod;
	status: OrderStatus;
}

/** `data` of GET /admin/orders/:id: the Order Details dialog. */
export interface OrderDetail {
	id: string;
	number: string;
	created_at: string;
	customer_id: string;
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
}

/** One line of Order Tracking. Done steps carry when they happened; upcoming ones the time they're expected from. */
export interface TrackingStep {
	label: string;
	state: "done" | "upcoming" | "stopped";
	/** When it happened (done, stopped) or is expected from (upcoming). Null if unknown. */
	at: string | null;
}

export interface OrderListParams {
	period?: OrderPeriod;
	/** ISO days; they replace `period` when set. */
	from?: string;
	to?: string;
	/** Comma-separated. */
	status?: string;
	payment?: string;
	/** One customer's orders (Customers Details → Order History). */
	customer?: string;
	sort?: OrderSort;
	page: number;
	limit: number;
}

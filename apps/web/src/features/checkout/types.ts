/** Placeholders until matched to the external API (docs/PLAN.md). Prices are whole naira. */

export type PaymentMethod = "card" | "pay_on_delivery";

export interface CheckoutLine {
	product_id: string;
	quantity: number;
}

/** POST /checkout/quote body: the API prices the cart (the browser's prices are display only). */
export interface QuoteRequest {
	items: CheckoutLine[];
	coupon_code?: string;
}

/** `data` of POST /checkout/quote. `coupon_error` explains a code that didn't apply (the rest is still priced). */
export interface CheckoutQuote {
	subtotal: number;
	discount: number;
	shipping: number;
	total: number;
	coupon: { code: string; description: string } | null;
	coupon_error?: string;
}

export interface DeliveryAddress {
	first_name: string;
	last_name: string;
	address: string;
	city: string;
	zip_code: string;
	phone_number: string;
	email: string;
}

/**
 * POST /orders body. No card details: card payments go through the payment provider's own secure form, which the
 * API starts and returns as `payment_url`.
 */
export interface PlaceOrderRequest extends QuoteRequest {
	delivery: DeliveryAddress;
	payment_method: PaymentMethod;
}

export interface Order {
	id: string;
	status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
	total: number;
	payment_method: PaymentMethod;
	created_at: string;
}

/** `data` of POST /orders: the order, and where to pay for card orders (null for pay on delivery). */
export interface PlaceOrderResult {
	order: Order;
	payment_url: string | null;
}

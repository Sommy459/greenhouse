import type { OrderStatus, OrderTab, PaymentMethod } from "@/features/orders/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	delivery_failed: "Failed",
	returned: "Returned",
};

/** Paid = waiting on you (Figma's amber "Pending" pill). */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
	paid: "bg-warning-50 text-warning-700",
	processing: "bg-info-50 text-info-500",
	shipped: "bg-lime-100 text-lime-900",
	delivered: "bg-success-50 text-success-700",
	cancelled: "bg-error-50 text-error-500",
	delivery_failed: "bg-error-50 text-error-700",
	returned: "bg-info-50 text-info-700",
};

export const TAB_LABEL: Record<OrderTab, string> = {
	all: "All Orders",
	shipped: "Shipped",
	cancelled: "Cancelled",
	delivery_failed: "Delivery Failed",
	returned: "Returned",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
	fysi_wallet: "Fysi wallet",
	external_wallet: "External wallet",
	qr_code: "QR code",
	payment_link: "Payment link",
};

export const SHIPPING_METHOD_LABEL = { door_delivery: "Door Delivery", pickup: "Pickup" } as const;

/**
 * What a vendor can move an order to (PRD V8). Delivered, Cancelled and Returned are final; Returned is set by Fysi
 * when it refunds. A failed delivery can go out again.
 */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
	paid: ["processing", "cancelled"],
	processing: ["shipped", "cancelled"],
	shipped: ["delivered", "delivery_failed"],
	delivery_failed: ["shipped", "cancelled"],
	delivered: [],
	cancelled: [],
	returned: [],
};

/** How each choice reads in Update status. */
export const NEXT_LABEL: Partial<Record<OrderStatus, { title: string; hint: string }>> = {
	processing: { title: "Accept and start packing", hint: "The customer sees the order was accepted." },
	shipped: { title: "Mark as shipped", hint: "Add the courier and tracking number so the customer can follow it." },
	delivered: {
		title: "Mark as delivered",
		hint: "Your payout is released when the customer confirms, or 7 days after shipping.",
	},
	delivery_failed: { title: "Delivery failed", hint: "The courier couldn't deliver. You can ship it again." },
	cancelled: { title: "Cancel order", hint: "Fysi refunds the customer. Give a reason." },
};

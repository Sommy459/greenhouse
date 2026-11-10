import type { OrderPeriod, OrderStatus, PaymentMethod } from "@/features/orders/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
	pending: "Pending",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	failed: "Failed",
	returned: "Returned",
};

/** Figma status pills: tinted background, darker text. */
export const STATUS_TONE: Record<OrderStatus, string> = {
	pending: "bg-grey-500 text-grey-900",
	processing: "bg-info-50 text-info-500",
	shipped: "bg-warning-50 text-warning-700",
	delivered: "bg-success-50 text-success-700",
	cancelled: "bg-error-50 text-error-500",
	failed: "bg-error-50 text-error-700",
	returned: "bg-info-50 text-info-700",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
	visa: "Visa",
	mastercard: "Mastercard",
	verve: "Verve",
	transfer: "Transfer",
	ussd: "USSD",
	pay_on_delivery: "Pay on delivery",
};

export const SHIPPING_METHOD_LABEL = { door_delivery: "Door Delivery", pickup: "Pickup" } as const;

export const PERIOD_LABEL: Record<OrderPeriod, string> = {
	all: "All Time",
	"12m": "12 Months",
	"30d": "30 Days",
	"7d": "7 Days",
	"24h": "24 Hour",
};

/** How far back each quick range reaches, in milliseconds. */
export const PERIOD_MS: Record<Exclude<OrderPeriod, "all">, number> = {
	"12m": 365 * 86400000,
	"30d": 30 * 86400000,
	"7d": 7 * 86400000,
	"24h": 86400000,
};

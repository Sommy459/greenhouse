import type { CustomerOrderStatus } from "@/features/orders/types";

/** Figma badges: Shipped (amber), Delivered (green), Cancelled and Failed (red). */
export const ORDER_STATUS_LABEL: Record<CustomerOrderStatus, string> = {
	pending_payment: "Awaiting payment",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	delivery_failed: "Failed",
	returned: "Returned",
};

export const ORDER_STATUS_TONE: Record<CustomerOrderStatus, string> = {
	pending_payment: "bg-grey-600 text-grey-900",
	paid: "bg-info-50 text-info-500",
	processing: "bg-info-50 text-info-500",
	shipped: "bg-warning-50 text-warning-700",
	delivered: "bg-success-50 text-success-700",
	cancelled: "bg-error-50 text-error-500",
	delivery_failed: "bg-error-50 text-error-500",
	returned: "bg-grey-600 text-grey-900",
};

/** Figma "May 11, 2023". */
export const orderDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

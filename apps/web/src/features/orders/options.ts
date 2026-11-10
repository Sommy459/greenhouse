import type { Order, VendorOrderStatus } from "@/features/orders/types";

/** What a list shows for an order: its payment state, or once paid, how far its parcels have got. */
export type DisplayStatus = "awaiting_payment" | "expired" | "cancelled" | VendorOrderStatus | "problem";

export const STATUS_LABEL: Record<DisplayStatus, string> = {
	awaiting_payment: "Awaiting payment",
	expired: "Expired",
	cancelled: "Cancelled",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	problem: "Problem reported",
};

/** Figma badges: Shipped (amber), Delivered (green), Cancelled (red). */
export const STATUS_TONE: Record<DisplayStatus, string> = {
	awaiting_payment: "bg-warning-50 text-warning-700",
	expired: "bg-grey-600 text-grey-900",
	cancelled: "bg-error-50 text-error-500",
	paid: "bg-info-50 text-info-500",
	processing: "bg-info-50 text-info-500",
	shipped: "bg-warning-50 text-warning-700",
	delivered: "bg-success-50 text-success-700",
	problem: "bg-error-50 text-error-500",
};

/** The least advanced parcel decides (all delivered → Delivered); a reported problem shows first. */
export function displayStatus(order: Order): DisplayStatus {
	if (order.status !== "paid") return order.status;
	const parts = order.vendorOrders.filter((v) => v.status !== "cancelled");
	if (parts.some((v) => v.problemReason)) return "problem";
	if (parts.length === 0) return "cancelled";
	const rank: VendorOrderStatus[] = ["awaiting_payment", "paid", "processing", "shipped", "delivered"];
	return parts.reduce<VendorOrderStatus>((min, v) => (rank.indexOf(v.status) < rank.indexOf(min) ? v.status : min), "delivered");
}

/** Figma "May 11, 2023". */
export const orderDate = (iso: string) =>
	new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "Bamboo toothbrush + 2 more" */
export function orderTitle(order: Order) {
	const lines = order.vendorOrders.flatMap((v) => v.lines);
	return lines.length ? `${lines[0]!.title}${lines.length > 1 ? ` + ${lines.length - 1} more` : ""}` : `Order ${order.number}`;
}

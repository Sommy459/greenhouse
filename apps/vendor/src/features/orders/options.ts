import type { EscrowStatus, OrderStatus, VendorOrder } from "@/features/orders/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
	awaiting_payment: "Awaiting payment",
	paid: "To process",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
	awaiting_payment: "bg-grey-500 text-grey-900",
	paid: "bg-info-50 text-info-500",
	processing: "bg-warning-50 text-warning-700",
	shipped: "bg-primary-50 text-primary-500",
	delivered: "bg-success-50 text-success-700",
	cancelled: "bg-error-50 text-error-500",
};

export const ESCROW_LABEL: Record<EscrowStatus, string> = {
	pending: "Awaiting payment",
	held: "Held in escrow",
	disputed: "On hold: problem reported",
	released: "Released",
	paid_out: "Paid to your wallet",
	refunded: "Refunded to the customer",
	void: "Void",
};

/** The next step a vendor can take (PRD V8). */
export const NEXT_STATUS: Partial<Record<OrderStatus, "processing" | "shipped" | "delivered">> = {
	paid: "processing",
	processing: "shipped",
	shipped: "delivered",
};

export const day = (iso: string) =>
	new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** "Bamboo toothbrush + 2 more" */
export const itemsLabel = (o: VendorOrder) =>
	o.lines.length ? `${o.lines[0]!.title}${o.lines.length > 1 ? ` + ${o.lines.length - 1} more` : ""}` : "—";

/** 500 → "5%" */
export const percent = (bps: number) => `${Math.round(bps) / 100}%`;

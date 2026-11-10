/** The shop's orders in the Fysi API (PRD V8). Money is US cents; only paid orders reach the vendor. */
import type { Money } from "@/lib/format";

export const ORDER_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number] | "awaiting_payment";

/**
 * Escrow (PRD): `held` until the customer confirms delivery or 7 days pass after shipping, then `released` and
 * `paid_out` to the wallet. `disputed` while a reported problem is looked into; `refunded` if Fysi refunded the customer.
 */
export type EscrowStatus = "pending" | "held" | "disputed" | "released" | "paid_out" | "refunded" | "void";

export interface OrderLine {
	productId: string;
	title: string;
	unitPrice: Money;
	quantity: number;
	lineTotal: Money;
}

export interface DeliveryAddress {
	recipientName: string;
	phone: string;
	line1: string;
	line2?: string | null;
	city: string;
	state: string;
	notes?: string | null;
}

/** A row of GET /vendor/orders, and GET /vendor/orders/:id. */
export interface VendorOrder {
	id: string;
	/** The order number customers see (also the payment memo). */
	orderNumber: string;
	status: OrderStatus;
	lines: OrderLine[];
	subtotal: Money;
	/** Fysi's commission in basis points (500 = 5%; 0 for founding vendors). */
	commissionBps: number;
	commission: Money;
	/** What reaches the wallet: subtotal minus commission. */
	payout: Money;
	escrowStatus: EscrowStatus;
	/** When escrow releases on its own (7 days after shipping), if it hasn't been confirmed. */
	autoReleaseAt: string | null;
	customerName: string;
	deliveryAddress: DeliveryAddress;
	carrier: string | null;
	trackingNumber: string | null;
	/** Set when the customer reported a problem. */
	problemReason: string | null;
	paidAt: string | null;
	shippedAt: string | null;
	deliveredAt: string | null;
	/** Paid or processing, not yet shipped: the vendor can cancel (the customer is refunded). */
	canCancel: boolean;
	cancelReason: string | null;
}

/** PATCH /vendor/orders/:id/status: shipping needs the tracking number (the customer is emailed). */
export interface StatusUpdate {
	status: "processing" | "shipped" | "delivered";
	carrier?: string;
	trackingNumber?: string;
}

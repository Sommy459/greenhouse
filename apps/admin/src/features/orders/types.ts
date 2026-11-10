/** Vendor orders, escrow and disputes as admins see them (Fysi API). Money is US cents. */
import type { Money } from "@/lib/format";

export type EscrowStatus = "pending" | "held" | "disputed" | "released" | "paid_out" | "refunded" | "void";
export const ESCROW_STATUSES: EscrowStatus[] = ["held", "disputed", "released", "paid_out", "refunded", "pending", "void"];

export const ESCROW_LABEL: Record<EscrowStatus, string> = {
	pending: "Awaiting payment",
	held: "Held",
	disputed: "Disputed",
	released: "Released",
	paid_out: "Paid out",
	refunded: "Refunded",
	void: "Void",
};

export const ESCROW_TONE: Record<EscrowStatus, string> = {
	pending: "bg-grey-500 text-grey-900",
	held: "bg-info-50 text-info-500",
	disputed: "bg-error-50 text-error-500",
	released: "bg-success-50 text-success-700",
	paid_out: "bg-success-50 text-success-700",
	refunded: "bg-warning-50 text-warning-700",
	void: "bg-grey-500 text-grey-900",
};

/** A row of GET /admin/vendor-orders. */
export interface AdminVendorOrder {
	id: string;
	orderNumber: string;
	vendorName: string | null;
	customerEmail: string;
	/** The vendor's fulfilment status (paid, processing, shipped, delivered, cancelled). */
	status: string;
	escrowStatus: EscrowStatus;
	subtotal: Money;
	payout: Money;
	/** What the customer reported, when disputed. */
	problemReason: string | null;
	trackingNumber: string | null;
	updatedAt: string;
}

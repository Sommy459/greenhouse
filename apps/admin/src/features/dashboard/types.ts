import type { Money } from "@/lib/format";

/** `data` of GET /admin/dashboard (PRD A4): activity per day or week, and the work queues. */
export interface Dashboard {
	/** Oldest first. `period` is the day or week start (ISO date). */
	series: {
		period: string;
		newVendors: number;
		newCustomers: number;
		paidOrders: number;
		volume: Money;
		failedPayments: number;
	}[];
	queues: {
		vendorsPending: number;
		paymentsToRefund: number;
		disputes: number;
		transfersFailed: number;
	};
}

export type DashboardPeriod = "day" | "week";

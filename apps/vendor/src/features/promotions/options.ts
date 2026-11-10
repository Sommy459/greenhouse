import type { PromotionStatus } from "@/features/promotions/types";

export const STATUS_LABEL: Record<PromotionStatus, string> = {
	open: "Open",
	ongoing: "Ongoing",
	cancelled: "Cancelled",
	expired: "Expired",
};

export const STATUS_TONE: Record<PromotionStatus, string> = {
	open: "bg-error-50 text-warning-700",
	ongoing: "bg-success-50 text-success-700",
	cancelled: "bg-error-50 text-error-500",
	expired: "bg-warning-50 text-warning-700",
};

/** Figma "20 Days", or "1 month". */
export const period = (days: number) =>
	days % 30 === 0 ? `${days / 30} month${days === 30 ? "" : "s"}` : `${days} Day${days === 1 ? "" : "s"}`;

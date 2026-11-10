import type { VendorStatus } from "@/features/vendors/types";

/** Figma pills: "Active" and "Blocked"; the PRD adds the verification states. */
export const VENDOR_STATUS_LABEL: Record<VendorStatus, string> = {
	pending: "Pending",
	approved: "Active",
	suspended: "Blocked",
	rejected: "Rejected",
};

export const VENDOR_STATUS_TONE: Record<VendorStatus, string> = {
	pending: "bg-warning-50 text-warning-700",
	approved: "bg-success-50 text-success-700",
	suspended: "bg-error-50 text-error-500",
	rejected: "bg-grey-500 text-grey-900",
};

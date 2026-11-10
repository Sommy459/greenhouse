import type { DocumentKind, VendorStatus } from "@/features/vendors/types";

export const VENDOR_STATUS_LABEL: Record<VendorStatus, string> = {
	draft: "Not submitted",
	pending: "Pending review",
	approved: "Active",
	rejected: "Rejected",
	suspended: "Suspended",
};

export const VENDOR_STATUS_TONE: Record<VendorStatus, string> = {
	draft: "bg-grey-500 text-grey-900",
	pending: "bg-warning-50 text-warning-700",
	approved: "bg-success-50 text-success-700",
	rejected: "bg-grey-500 text-grey-900",
	suspended: "bg-error-50 text-error-500",
};

export const DOCUMENT_LABEL: Record<DocumentKind, string> = {
	cac_certificate: "CAC certificate",
	director_id: "Director's ID",
	proof_of_address: "Proof of address",
	sustainability_certificate: "Eco certificate",
	sustainability_evidence: "Sustainability evidence",
};

export const day = (iso: string) =>
	new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** 30 → "30h", 50 → "2d 2h" */
export const waited = (hours: number) =>
	hours < 24 ? `${Math.round(hours)}h` : `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`;

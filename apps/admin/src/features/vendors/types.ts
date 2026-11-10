/** Vendors in the Fysi API (PRD A1–A2): the verification queue and each application. */

export const VENDOR_STATUSES = ["pending", "approved", "rejected", "suspended", "draft"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export type CertificationId =
	"gots" | "oeko_tex" | "fsc" | "fairtrade" | "rainforest_alliance" | "eu_ecolabel" | "usda_organic" | "son";

export const CERTIFICATION_NAMES: Record<CertificationId, string> = {
	gots: "GOTS",
	oeko_tex: "OEKO-TEX",
	fsc: "FSC",
	fairtrade: "Fairtrade",
	rainforest_alliance: "Rainforest Alliance",
	eu_ecolabel: "EU Ecolabel",
	usda_organic: "USDA Organic",
	son: "SON",
};

/** A row of GET /admin/vendors. */
export interface AdminVendor {
	id: string;
	status: VendorStatus;
	businessName: string | null;
	email: string;
	ownerName: string;
	city: string | null;
	state: string | null;
	categoryName: string | null;
	/** How many times it was submitted (resubmissions after a rejection count). */
	submissionCount: number;
	submittedAt: string | null;
	/** How long it has waited in the queue. */
	waitingHours: number | null;
	reviewedAt: string | null;
	createdAt: string;
}

export type DocumentKind =
	"cac_certificate" | "director_id" | "proof_of_address" | "sustainability_certificate" | "sustainability_evidence";

/** `data` of GET /admin/vendors/:id and every decision call. */
export interface VendorDetail {
	id: string;
	status: VendorStatus;
	businessName: string | null;
	slug: string | null;
	description: string | null;
	phone: string | null;
	addressLine: string | null;
	city: string | null;
	state: string | null;
	category: { id: string; name: string; slug: string } | null;
	cacNumber: string | null;
	directorIdType: "nin" | "bvn" | null;
	directorIdLast4: string | null;
	logoUrl: string | null;
	/** Labels an admin confirmed (they earn the "Certified" badge). */
	verifiedCertifications: { id: CertificationId; name: string }[];
	/** Labels the vendor uploaded certificates for. */
	claimedCertifications: { id: CertificationId; name: string }[];
	badge: "certified" | "fysi_reviewed" | null;
	decisionReason: string | null;
	missing: string[];
	documents: {
		id: string;
		kind: DocumentKind;
		certification: CertificationId | null;
		fileName: string;
		contentType: string;
		sizeBytes: number;
		url: string | null;
		createdAt: string;
	}[];
	owner: { id: string; name: string; email: string; phone: string | null; twoFactorEnabled: boolean; suspended: boolean };
	/** 0% commission for their first 3 months (PRD). */
	foundingVendor: boolean;
	submissionCount: number;
	history: { action: string; actorId: string | null; actorName: string | null; reason: string | null; at: string }[];
	submittedAt: string | null;
	reviewedAt: string | null;
	approvedAt: string | null;
}

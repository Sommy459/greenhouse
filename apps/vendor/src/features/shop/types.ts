/** The vendor's business profile in the Fysi API (onboarding, PRD V2–V3). */

export type VendorStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";

export type CertificationId =
	"gots" | "oeko_tex" | "fsc" | "fairtrade" | "rainforest_alliance" | "eu_ecolabel" | "usda_organic" | "son";

export const CERTIFICATIONS: { id: CertificationId; name: string }[] = [
	{ id: "gots", name: "GOTS (organic textiles)" },
	{ id: "oeko_tex", name: "OEKO-TEX" },
	{ id: "fsc", name: "FSC (forests)" },
	{ id: "fairtrade", name: "Fairtrade" },
	{ id: "rainforest_alliance", name: "Rainforest Alliance" },
	{ id: "eu_ecolabel", name: "EU Ecolabel" },
	{ id: "usda_organic", name: "USDA Organic" },
	{ id: "son", name: "SON (Standards Organisation of Nigeria)" },
];

export type DocumentKind =
	"cac_certificate" | "director_id" | "proof_of_address" | "sustainability_certificate" | "sustainability_evidence";

export interface VendorDocument {
	id: string;
	kind: DocumentKind;
	certification: CertificationId | null;
	fileName: string;
	contentType: string;
	sizeBytes: number;
	/** A private download link (vendor and admins only). */
	url: string | null;
	createdAt: string;
}

/** `data` of GET /vendor/profile: the onboarding wizard's state. */
export interface VendorProfile {
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
	/** The director's NIN/BVN is stored encrypted; only its last 4 digits come back. */
	directorIdLast4: string | null;
	logoUrl: string | null;
	verifiedCertifications: { id: CertificationId; name: string }[];
	badge: "certified" | "fysi_reviewed" | null;
	/** Why it was rejected or suspended. */
	decisionReason: string | null;
	/** Business identity can change only in `draft` or after a rejection. */
	canEdit: boolean;
	/** What still blocks submitting (field and document names). */
	missing: string[];
	documents: VendorDocument[];
	submittedAt: string | null;
	reviewedAt: string | null;
	approvedAt: string | null;
}

/** PATCH /vendor/profile (send only what changes). */
export interface ProfileUpdate {
	businessName?: string;
	description?: string | null;
	phone?: string;
	addressLine?: string;
	city?: string;
	state?: string;
	categoryId?: string;
	cacNumber?: string;
	directorIdType?: "nin" | "bvn";
	directorId?: string;
}

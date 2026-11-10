/** Placeholder shapes until matched to the API. Money is whole naira. */

/**
 * A vendor's account (PRD A1, V3): `pending` until an admin decides; `approved` sells (Figma "Active"); `suspended`
 * can't sell or sign in (Figma "Blocked"); `rejected` sees the reason and may fix and resubmit.
 */
export const VENDOR_STATUSES = ["pending", "approved", "suspended", "rejected"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

/** Figma tabs: every vendor, or vendors who signed up in the last 30 days. */
export type VendorTab = "all" | "new";

/** A row of GET /admin/vendors. */
export interface AdminVendor {
	id: string;
	shop_name: string;
	/** The account owner (Figma "Vendor Name"). */
	owner_name: string;
	email: string;
	avatar_url: string | null;
	/** The newest listing, with how many more the shop has. Null before the first listing. */
	first_product: { name: string; image_url: string | null } | null;
	other_products: number;
	/** Stock-keeping units across all listings (Figma "SKU"). */
	sku_count: number;
	/** Available wallet balance, in naira (the wallet holds USDC; PRD V5). */
	balance: number;
	created_at: string;
	status: VendorStatus;
}

export interface VendorListParams {
	tab?: VendorTab;
	/** Shop name, owner name or e-mail. */
	search?: string;
	/** Comma-separated statuses. */
	status?: string;
	page: number;
	limit: number;
}

export type CertificationStatus = "pending" | "verified" | "rejected" | "revoked";

/**
 * PRD decision: recognised labels (GOTS, OEKO-TEX, FSC, Fairtrade, Rainforest Alliance, EU Ecolabel, USDA Organic) or
 * SON certification earn "Certified"; evidence from small makers without a label (materials, sourcing, photos) earns
 * "Fysi Reviewed".
 */
export type BadgeType = "certified" | "fysi_reviewed";

export interface Certification {
	id: string;
	vendor_id: string;
	/** Null when it covers the whole shop. */
	product_id: string | null;
	/** e.g. "GOTS organic textile", or "Sourcing evidence" for a Fysi Reviewed submission. */
	name: string;
	issuer: string;
	badge: BadgeType;
	document_url: string | null;
	status: CertificationStatus;
	reviewed_at: string | null;
	created_at: string;
}

/** `data` of GET /admin/vendors/:id: the list row plus what the vendor submitted at onboarding (PRD V2, KYB). */
export interface VendorDetail extends AdminVendor {
	/** The ID shown to staff, e.g. VND-000231. */
	code: string;
	phone_number: string;
	business_address: string;
	/** Main category the shop sells in. */
	category: string;
	account_type: "business" | "individual";
	/** CAC registration, business accounts only. */
	cac: { number: string; certificate_url: string | null } | null;
	/** Director's ID for KYB; only the last four digits ever reach the client. */
	director_id: { type: "nin" | "bvn"; last4: string } | null;
	certifications: Certification[];
	/** Custodial wallet (created on approval, PRD V4); naira. `pending` is escrow awaiting delivery. */
	wallet: { available: number; pending: number } | null;
	products_count: number;
	recent_products: { id: string; name: string; image_url: string | null; price: number; stock: number }[];
	submitted_at: string;
	/** When the latest approve / reject / suspend happened. */
	decided_at: string | null;
	/** Shown to the vendor on their pending page (PRD V3). */
	rejection_reason: string | null;
	suspension_reason: string | null;
}

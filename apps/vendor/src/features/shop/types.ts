import type { AccountType } from "@/features/shop/options";

export type ShopStatus = "pending" | "approved" | "suspended" | "rejected";

/** `data` of GET /vendor/me (null before onboarding). */
export interface Shop {
	id: string;
	user_id: string;
	shop_name: string;
	slug: string;
	account_type: AccountType;
	/** A value from SHIPPING_ZONES. */
	shipping_zone: string;
	/** Business sellers only: CAC registration number and the uploaded certificate. */
	cac_id: string | null;
	cac_certificate_url: string | null;
	/** ISO 3166-1 alpha-2, e.g. "NG" (from sign-up). */
	country: string;
	/** The shop's contact e-mail (the account's, verified at sign-up). */
	email: string;
	/** Not asked at sign-up; filled in later from the seller centre settings. */
	description: string | null;
	city: string | null;
	state: string | null;
	status: ShopStatus;
	logo_url: string | null;
	created_at: string;
}

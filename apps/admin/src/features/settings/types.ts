/** Placeholder shapes until matched to the API. */

export const GENDERS = ["female", "male"] as const;
export type Gender = (typeof GENDERS)[number];

/** `data` of GET /admin/profile: the signed-in admin's own details (Figma "Settings"). */
export interface AdminProfile {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	gender: Gender | null;
	/** The staff ID shown on the page (read-only), e.g. ADM-0001. */
	admin_code: string;
	address: string;
	avatar_url: string | null;
}

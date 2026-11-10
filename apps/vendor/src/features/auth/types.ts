export type Role = "customer" | "vendor" | "admin" | "super_admin";

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	/** ISO 3166-1 alpha-2, chosen at sign-up (step 1). */
	country?: string;
	/** Profile photo, when one is set. */
	avatar_url?: string | null;
	role: Role;
	email_verified: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

/** `data` of POST /auth/login and /auth/signup. `expires_in` is a Unix time in seconds. */
export interface AuthSession {
	access_token: string;
	expires_in: number;
	user: User;
}

/** `data` of POST /auth/email/verify: proves the code was entered; sent with POST /auth/signup. */
export interface EmailVerification {
	verification_token: string;
}

/** POST /auth/signup body for a seller (sign-up step 4). */
export interface VendorSignUpBody {
	email: string;
	password: string;
	phone_number: string;
	country: string;
	verification_token: string;
	role: "vendor";
}

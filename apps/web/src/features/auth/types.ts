export type Role = "customer" | "vendor" | "admin" | "super_admin";

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	/** Profile photo (Settings); null until one is uploaded. */
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

/**
 * `data` of POST /auth/otp/verify (assumed shape, to match against the external API): a session for a returning
 * customer, or `is_new_user` with a token for "Create your account".
 */
export interface VerifyCodeResult extends Partial<AuthSession> {
	is_new_user: boolean;
	verification_token?: string;
}

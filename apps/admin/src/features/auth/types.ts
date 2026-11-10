export type Role = "customer" | "vendor" | "admin" | "super_admin";

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	/** Profile photo, when one is set (Settings). */
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

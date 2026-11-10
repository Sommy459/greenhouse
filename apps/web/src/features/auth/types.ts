/** Shapes of the Fysi API (https://fysi-backend-production.up.railway.app/docs). */

export type Role = "customer" | "vendor" | "admin" | "super_admin";

/** `data` of GET /auth/me (and PATCH /auth/me, PUT /auth/me/avatar). */
export interface User {
	id: string;
	email: string;
	role: Role;
	name: string;
	phone: string | null;
	avatarUrl: string | null;
	twoFactorEnabled: boolean;
	twoFactorRequired: boolean;
	vendor: { status: "draft" | "pending" | "approved" | "rejected" | "suspended"; businessName: string | null } | null;
	createdAt: string;
}

/** Tokens from verify-email, login, login/2fa and refresh. `expiresIn` is in seconds. */
export interface TokenSet {
	accessToken: string;
	refreshToken: string;
	tokenType: "Bearer";
	expiresIn: number;
	role: Role;
	mfa: boolean;
	twoFactorSetupRequired: boolean;
}

/** `data` of POST /auth/login: tokens, or an `mfaToken` when two-factor sign-in is on. */
export type LoginResult =
	({ mfaRequired: false } & TokenSet) | { mfaRequired: true; mfaToken: string; mfaTokenExpiresIn: number };

/** `data` of POST /auth/register, /auth/resend-otp and /auth/forgot-password. */
export interface CodeSent {
	otpExpiresInSeconds: number;
	resendAfterSeconds: number;
}

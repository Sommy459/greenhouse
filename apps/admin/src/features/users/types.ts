/** Accounts in the Fysi API (customers, vendors, admins). */
import type { Role } from "@/features/auth/types";

/** A row of GET /admin/users. */
export interface AdminUser {
	id: string;
	email: string;
	name: string;
	role: Role;
	avatarUrl: string | null;
	emailVerified: boolean;
	suspended: boolean;
	createdAt: string;
}

/** GET /admin/users/:id and the account actions. */
export interface UserDetail extends AdminUser {
	emailVerifiedAt: string | null;
	/** Set once an admin deleted the account (personal data is erased; orders stay for the records). */
	deletedAt: string | null;
	updatedAt: string;
	lastLoginAt: string | null;
	activeSessions: number;
	phone: string | null;
	twoFactorEnabled: boolean;
	vendor: { status: string; businessName: string | null; slug: string | null; decisionReason: string | null } | null;
	suspension: { reason: string; suspendedBy: string; suspendedByName: string | null; suspendedAt: string } | null;
}

export const ROLE_LABEL: Record<Role, string> = {
	customer: "Customer",
	vendor: "Vendor",
	admin: "Admin",
	super_admin: "Super admin",
};

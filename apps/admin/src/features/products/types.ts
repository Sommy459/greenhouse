/** The catalogue as admins see it (PRD A5). Prices are US cents. */
import type { Money } from "@/lib/format";

export type { Paginated } from "@/lib/api/client";

export type ModerationStatus = "visible" | "hidden" | "removed";

/** A row of GET /admin/products, and every moderation call's answer. */
export interface AdminProduct {
	id: string;
	slug: string;
	title: string;
	description: string;
	price: Money;
	stock: number;
	category: { id: string; name: string; slug: string } | null;
	certifications: { id: string; name: string }[];
	badge: "certified" | "fysi_reviewed" | null;
	/** The vendor's own switch. */
	status: "active" | "hidden";
	moderationStatus: ModerationStatus;
	/** Shown to the vendor. */
	moderationReason: string | null;
	isPublic: boolean;
	images: { id: string; url: string | null; position: number }[];
	createdAt: string;
	updatedAt: string;
	vendorId: string;
	vendorName: string | null;
	vendorSlug: string | null;
	/** Set when the vendor deleted it (listed only with includeDeleted). */
	deletedAt: string | null;
}

/** GET /admin/categories (all, including inactive ones). */
export interface AdminCategory {
	id: string;
	name: string;
	slug: string;
	isActive: boolean;
	sortOrder: number;
	productCount: number;
}

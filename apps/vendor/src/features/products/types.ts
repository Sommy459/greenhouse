/** The shop's products in the Fysi API (PRD V7). Prices are US cents, paid 1:1 in USDC. */
import type { Money } from "@/lib/format";
import type { CertificationId } from "@/features/shop/types";

export type { Paginated } from "@/lib/api/client";

/** `active` = on sale; `hidden` = taken off the store by the vendor. */
export type ProductStatus = "active" | "hidden";

export interface ProductImage {
	id: string;
	url: string | null;
	/** 0 is the cover. */
	position: number;
}

/** A row of GET /vendor/products, and every product call's answer. */
export interface VendorProduct {
	id: string;
	slug: string;
	title: string;
	description: string;
	price: Money;
	stock: number;
	category: { id: string; name: string; slug: string } | null;
	certifications: { id: CertificationId; name: string }[];
	badge: "certified" | "fysi_reviewed" | null;
	status: ProductStatus;
	/** Admin moderation (PRD A5): `hidden` or `removed` by Fysi, with the reason the vendor sees. */
	moderationStatus: "visible" | "hidden" | "removed";
	moderationReason: string | null;
	/** Whether customers can see it right now. */
	isPublic: boolean;
	images: ProductImage[];
	createdAt: string;
	updatedAt: string;
}

/** POST /vendor/products and PATCH /vendor/products/:id (send only what changes). */
export interface ProductBody {
	title: string;
	description: string;
	priceCents: number;
	stock: number;
	categoryId: string;
	certifications: CertificationId[];
	status: ProductStatus;
}

export interface ProductListParams {
	status?: ProductStatus;
	q?: string;
	page: number;
	limit: number;
}

/** The pill a vendor sees: Fysi's moderation first, then their own hide, then stock. */
export type ProductState = "removed" | "hidden_by_fysi" | "hidden" | "out_of_stock" | "live";

export function productState(p: VendorProduct): ProductState {
	if (p.moderationStatus === "removed") return "removed";
	if (p.moderationStatus === "hidden") return "hidden_by_fysi";
	if (p.status === "hidden") return "hidden";
	return p.stock > 0 ? "live" : "out_of_stock";
}

export const STATE_LABEL: Record<ProductState, string> = {
	live: "On sale",
	out_of_stock: "Out of stock",
	hidden: "Hidden",
	hidden_by_fysi: "Hidden by Fysi",
	removed: "Removed by Fysi",
};

export const STATE_TONE: Record<ProductState, string> = {
	live: "bg-success-50 text-success-700",
	out_of_stock: "bg-warning-50 text-warning-700",
	hidden: "bg-grey-500 text-grey-900",
	hidden_by_fysi: "bg-error-50 text-error-500",
	removed: "bg-error-50 text-error-500",
};

/** Shop promotions in the Fysi API: a percentage off chosen products (or the whole shop) between two dates. */
import type { Money } from "@/lib/format";

export const PROMOTION_STATES = ["running", "scheduled", "paused", "expired", "ended"] as const;
export type PromotionState = (typeof PROMOTION_STATES)[number];

export interface Promotion {
	id: string;
	name: string;
	/** 1–90. */
	discountPercent: number;
	appliesToAll: boolean;
	products: { id: string; title: string; slug: string; price: Money; salePrice: Money }[];
	startsAt: string;
	endsAt: string;
	state: PromotionState;
	stats: { orders: number; unitsSold: number; revenue: Money; discountGiven: Money };
	createdAt: string;
}

/** POST /vendor/promotions; PATCH sends only what changes. At most 180 days long. */
export interface PromotionBody {
	name: string;
	discountPercent: number;
	startsAt: string;
	endsAt: string;
	appliesToAll?: boolean;
	productIds?: string[];
}

export type PromotionAction = "pause" | "resume" | "end";

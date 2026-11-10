"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductDetail } from "@/features/catalog/types";

const LIMIT = 8;

/**
 * Products this shopper opened recently (Figma "Recently Viewed" on the thank-you page). Kept in this browser only,
 * newest first, at most 8; signed out too.
 */
interface RecentlyViewed {
	products: Product[];
	record: (product: Product | ProductDetail) => void;
}

export const useRecentlyViewed = create<RecentlyViewed>()(
	persist(
		(set) => ({
			products: [],
			record: (product) =>
				set((state) => {
					// A list card doesn't need the certifications; keep the stored copy small.
					const item: Partial<ProductDetail> = { ...product };
					delete item.certifications;
					return { products: [item as Product, ...state.products.filter((p) => p.id !== product.id)].slice(0, LIMIT) };
				}),
		}),
		{ name: "greenhouse-recently-viewed" },
	),
);

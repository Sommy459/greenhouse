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
					// Keep only what a list card shows (the product page adds description, stock and photos).
					const {
						id,
						slug,
						title,
						price,
						originalPrice,
						discountPercent,
						inStock,
						imageUrl,
						badge,
						certifications,
						category,
						vendor,
						createdAt,
					} = product;
					const item: Product = {
						id,
						slug,
						title,
						price,
						originalPrice,
						discountPercent,
						inStock,
						imageUrl,
						badge,
						certifications,
						category,
						vendor,
						createdAt,
					};
					return { products: [item, ...state.products.filter((p) => p.id !== product.id)].slice(0, LIMIT) };
				}),
		}),
		{ name: "fysi-recently-viewed" },
	),
);

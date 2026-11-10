"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/features/catalog/types";

/**
 * The cart lives in the browser, so it works signed out (C5); checkout needs a session. Prices here are for display
 * only: the API reprices every order at checkout.
 */
export interface CartItem {
	product_id: string;
	slug: string;
	name: string;
	price: number;
	image: string | null;
	vendor_id: string | null;
	quantity: number;
	/** Chosen variant, e.g. { Color: "Black", Size: "39" } (Figma cart). Products have no variants yet. */
	options?: Record<string, string>;
}

interface CartState {
	items: CartItem[];
	add: (product: Product, quantity?: number) => void;
	setQuantity: (productId: string, quantity: number) => void;
	remove: (productId: string) => void;
	clear: () => void;
}

export const useCart = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			add: (product, quantity = 1) =>
				set((state) => {
					const existing = state.items.find((i) => i.product_id === product.id);
					if (existing) {
						return {
							items: state.items.map((i) => (i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i)),
						};
					}
					const item: CartItem = {
						product_id: product.id,
						slug: product.slug,
						name: product.name,
						price: product.price,
						image: product.images[0] ?? null,
						vendor_id: product.vendor?.id ?? null,
						quantity,
					};
					return { items: [...state.items, item] };
				}),
			setQuantity: (productId, quantity) =>
				set((state) => ({
					items:
						quantity <= 0
							? state.items.filter((i) => i.product_id !== productId)
							: state.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)),
				})),
			remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) })),
			clear: () => set({ items: [] }),
		}),
		{ name: "greenhouse-cart" },
	),
);

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

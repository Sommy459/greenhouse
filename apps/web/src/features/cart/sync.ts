"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Money } from "@/lib/format";
import type { Product } from "@/features/catalog/types";
import { useCart, type CartItem } from "@/features/cart/store";

/** A priced cart (POST /cart/preview, GET /cart, POST /cart/merge). */
export interface PricedCart {
	items: {
		productId: string;
		quantity: number;
		product: Product;
		lineTotal: Money;
		/** The most this shopper can buy now. */
		maxQuantity: number;
		issue?: "unavailable" | "out_of_stock" | "insufficient_stock";
	}[];
	subtotal: Money;
	itemCount: number;
	vendorCount: number;
	/** False while any line has an issue. */
	readyForCheckout: boolean;
	/** Merge only: lines the API couldn't add. */
	skipped?: { productId: string; reason: "unavailable" | "out_of_stock" }[];
}

const lines = (items: CartItem[]) => items.map((i) => ({ productId: i.product_id, quantity: i.quantity }));

/** The API's price and stock check for this browser's cart (guests too). Asked again whenever the cart changes. */
export function useCartPreview(items: CartItem[]) {
	return useQuery({
		queryKey: ["cart-preview", lines(items)],
		queryFn: async () => (await api.post(backendRoutes.CART_PREVIEW, { items: lines(items) })).data.data as PricedCart,
		enabled: items.length > 0,
		placeholderData: keepPreviousData,
	});
}

/** After signing in: what's in the account's cart (another device, an earlier visit) joins this browser's cart. */
export async function pullServerCart() {
	const { data } = await api.get(backendRoutes.CART);
	const server = data.data as PricedCart;
	const { items, add } = useCart.getState();
	for (const line of server.items) {
		if (!items.some((i) => i.product_id === line.productId) && !line.issue) add(line.product, line.quantity);
	}
}

/**
 * Before checkout: the account's cart becomes exactly this browser's cart (emptied, then filled with these lines).
 * Returns the priced result, including anything the API skipped.
 */
export async function pushCartToServer(items: CartItem[]) {
	await api.delete(backendRoutes.CART);
	return (await api.post(backendRoutes.CART_MERGE, { items: lines(items) })).data.data as PricedCart;
}

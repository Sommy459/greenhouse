"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { isSignedIn, useSession } from "@/features/auth/session";
import type { Product } from "@/features/catalog/types";

const KEY = ["wishlist"];

/** Saved products (C10), newest first. Only asked for when signed in. */
export function useWishlist() {
	const signedIn = useSession(isSignedIn);
	return useQuery({
		queryKey: KEY,
		queryFn: async () =>
			(await getPage<{ productId: string; product: Product; addedAt: string }>(backendRoutes.WISHLIST, { limit: 100 })).items.map(
				(i) => i.product,
			),
		enabled: signedIn,
	});
}

/** Save or remove a product. The list updates straight away and goes back if the API says no. */
export function useToggleWishlist() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ product, saved }: { product: Product; saved: boolean }) => {
			if (saved) await api.delete(backendRoutes.WISHLIST_ITEM(product.id));
			else await api.put(backendRoutes.WISHLIST_ITEM(product.id));
		},
		onMutate: async ({ product, saved }) => {
			await queryClient.cancelQueries({ queryKey: KEY });
			const before = queryClient.getQueryData<Product[]>(KEY);
			queryClient.setQueryData<Product[]>(KEY, (list = []) =>
				saved ? list.filter((p) => p.id !== product.id) : [product, ...list],
			);
			return { before };
		},
		onSuccess: (_, { product, saved }) =>
			toast.success(saved ? `${product.title} removed from your wishlist` : `${product.title} saved to your wishlist`),
		onError: (error, _, context) => {
			queryClient.setQueryData(KEY, context?.before);
			toast.error(errorMessage(error, "Couldn't update your wishlist. Try again."));
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Category, Paginated, Product, ProductDetail, ProductQuery, Review, ReviewInput } from "@/features/catalog/types";

export const catalogKeys = {
	categories: ["categories"] as const,
	products: (query: ProductQuery) => ["products", query] as const,
	product: (slug: string) => ["product", slug] as const,
	reviews: (slug: string) => ["product", slug, "reviews"] as const,
};

export function useCategories() {
	return useQuery({
		queryKey: catalogKeys.categories,
		queryFn: () => getData<Category[]>(backendRoutes.CATEGORIES),
		staleTime: 10 * 60_000,
	});
}

/** Browse, collections, search and filters all read this one list endpoint. */
export function useProducts(query: ProductQuery = {}) {
	return useQuery({
		queryKey: catalogKeys.products(query),
		queryFn: () => getData<Paginated<Product>>(backendRoutes.PRODUCTS, { ...query }),
	});
}

export function useProduct(slug: string) {
	return useQuery({
		queryKey: catalogKeys.product(slug),
		queryFn: () => getData<ProductDetail>(backendRoutes.PRODUCT(slug)),
		enabled: !!slug,
	});
}

/**
 * Sends a review (C9). The API decides who may review (customers whose order was delivered) and says so in its error.
 * Not retried automatically; the reviews list refreshes after.
 */
export function useSubmitReview(slug: string, { onSent }: { onSent: () => void }) {
	const queryClient = useQueryClient();
	const toast = useToast();
	return useMutation({
		// Multipart, so a photo can come along. The explicit type stops axios turning the FormData into JSON.
		mutationFn: async ({ name, email, rating, comment, photo }: ReviewInput) => {
			const data = new FormData();
			data.set("name", name);
			data.set("email", email);
			data.set("rating", String(rating));
			data.set("comment", comment);
			if (photo) data.set("photo", photo);
			return (await api.post(backendRoutes.PRODUCT_REVIEWS(slug), data, { headers: { "Content-Type": "multipart/form-data" } }))
				.data.data as Review;
		},
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: catalogKeys.reviews(slug) });
			onSent();
		},
		onError: (error) => toast.error(errorMessage(error, "We couldn't send your review. Please try again.")),
	});
}

/** Customer reviews of a product, newest first (C9). */
export function useProductReviews(slug: string) {
	return useQuery({
		queryKey: catalogKeys.reviews(slug),
		queryFn: () => getData<Review[]>(backendRoutes.PRODUCT_REVIEWS(slug)),
		enabled: !!slug,
	});
}

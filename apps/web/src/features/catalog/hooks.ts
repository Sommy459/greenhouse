"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import type { Category, Product, ProductDetail, ProductQuery, Store } from "@/features/catalog/types";

export const catalogKeys = {
	categories: ["categories"] as const,
	products: (query: ProductQuery) => ["products", query] as const,
	product: (slug: string) => ["product", slug] as const,
	store: (slug: string) => ["store", slug] as const,
};

export function useCategories() {
	return useQuery({
		queryKey: catalogKeys.categories,
		queryFn: () => getData<Category[]>(backendRoutes.CATEGORIES),
		staleTime: 10 * 60_000,
	});
}

/** Browse, search, filters and store pages all read this one list endpoint. */
export function useProducts(query: ProductQuery = {}) {
	return useQuery({
		queryKey: catalogKeys.products(query),
		queryFn: () => getPage<Product>(backendRoutes.PRODUCTS, { ...query }),
		placeholderData: keepPreviousData,
	});
}

export function useProduct(slug: string) {
	return useQuery({
		queryKey: catalogKeys.product(slug),
		queryFn: () => getData<ProductDetail>(backendRoutes.PRODUCT(slug)),
		enabled: !!slug,
	});
}

/** A verified vendor's store page. */
export function useStore(slug: string) {
	return useQuery({
		queryKey: catalogKeys.store(slug),
		queryFn: () => getData<Store>(backendRoutes.STORE(slug)),
		enabled: !!slug,
	});
}

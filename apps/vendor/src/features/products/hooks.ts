"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { toProductBody, type ProductValues } from "@/features/products/schema";
import type {
	Category,
	Paginated,
	ProductListParams,
	ProductStats,
	ProductStatus,
	ShopCertification,
	VendorProduct,
} from "@/features/products/types";

const KEY = ["vendor", "products"];

/** V7: the shop's listings, with search, stock filter, dates, sort and pages. */
export function useMyProducts(params: ProductListParams) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getData<Paginated<VendorProduct>>(backendRoutes.MY_PRODUCTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** The four totals above Manage Products. */
export function useProductStats() {
	return useQuery({ queryKey: [...KEY, "stats"], queryFn: () => getData<ProductStats>(backendRoutes.MY_PRODUCT_STATS) });
}

/** V7 hide / show: `inactive` takes listings off the store; `active` puts them back. One request per listing. */
export function useSetProductsStatus() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ ids, status }: { ids: string[]; status: ProductStatus }) => {
			await Promise.all(ids.map((id) => api.patch(backendRoutes.MY_PRODUCT(id), { status })));
			return { count: ids.length, status };
		},
		retry: false,
		onSuccess: ({ count, status }) => {
			const what = count === 1 ? "1 product" : `${count} products`;
			toast.success(status === "inactive" ? `${what} hidden from the store` : `${what} back in the store`);
		},
		onError: (error) => toast.error(errorMessage(error)),
		// Some may have saved before one failed: refresh either way.
		onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

/** V7 delete. */
export function useDeleteProduct() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (product: VendorProduct) => {
			await api.delete(backendRoutes.MY_PRODUCT(product.id));
			return product;
		},
		retry: false,
		onSuccess: (product) => {
			toast.success(`${product.name} was deleted`);
			queryClient.invalidateQueries({ queryKey: KEY });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Export": the ticked products, or every product matching the search and filters. */
export function useExportProducts() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<ProductListParams, "page" | "limit" | "sort"> & { ids?: string }) =>
			downloadCsv(backendRoutes.MY_PRODUCTS_EXPORT, params, "fysi-my-products"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export your products. Try again.")),
	});
}

/** The Category list on Add Products. */
export function useCategories() {
	return useQuery({ queryKey: ["categories"], queryFn: () => getData<Category[]>(backendRoutes.CATEGORIES) });
}

/** The shop's certificates that can tag a product: verified ones, and ones still awaiting review. */
export function useMyCertifications() {
	return useQuery({
		queryKey: ["vendor", "certifications"],
		queryFn: async () =>
			(await getData<ShopCertification[]>(backendRoutes.MY_CERTIFICATIONS)).filter(
				(c) => c.status === "verified" || c.status === "pending",
			),
	});
}

/** "Submit" on Add Products. Multipart (the photos are files); never retried, so a slow answer can't list it twice. */
export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (values: ProductValues) =>
			(await api.post(backendRoutes.MY_PRODUCTS, toProductBody(values), { headers: { "Content-Type": "multipart/form-data" } }))
				.data.data as VendorProduct,
		retry: false,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

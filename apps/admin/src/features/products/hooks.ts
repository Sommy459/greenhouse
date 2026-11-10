"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { toProductBody, type CategoryValues, type ProductValues } from "@/features/products/schema";
import type { AdminProduct, Category, Paginated, ProductListParams, ProductVisibility } from "@/features/products/types";

/** Every product on the platform. The previous page stays on screen while the next loads. */
export function useAdminProducts(params: ProductListParams) {
	return useQuery({
		queryKey: ["admin", "products", params],
		queryFn: () => getData<Paginated<AdminProduct>>(backendRoutes.PRODUCTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Categories for the Add Product form's Category list. */
export function useCategories() {
	return useQuery({ queryKey: ["admin", "categories"], queryFn: () => getData<Category[]>(backendRoutes.CATEGORIES) });
}

/** "Add Product". Multipart (the photos are files); never retried, so a slow answer can't create it twice. */
export function useCreateProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (values: ProductValues) => {
			const { data } = await api.post(backendRoutes.PRODUCTS, toProductBody(values), {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return data.data as AdminProduct;
		},
		retry: false,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
	});
}

/** PRD A5: hide a listing from the store (with a reason the vendor sees), or show it again. */
export function useSetProductVisibility() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, visibility, reason }: { id: string; visibility: ProductVisibility; reason?: string }) =>
			(await api.post(backendRoutes.PRODUCT_VISIBILITY(id), { visibility, reason })).data.data as AdminProduct,
		retry: false,
		onSuccess: (product) => {
			toast.success(
				product.visibility === "hidden" ? `${product.name} is hidden from the store` : `${product.name} is back in the store`,
			);
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** PRD A5: remove a listing for good, with a reason the vendor sees. */
export function useRemoveProduct() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ product, reason }: { product: AdminProduct; reason: string }) => {
			await api.delete(backendRoutes.PRODUCT(product.id), { data: { reason } });
			return product;
		},
		retry: false,
		onSuccess: (product) => {
			toast.success(`${product.name} was removed`);
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Add Category": a storefront category vendors can list under. Sent as multipart/form-data (the thumbnail is a file). */
export function useCreateCategory() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (values: CategoryValues) => {
			const body = new FormData();
			body.append("name", values.name);
			if (values.description) body.append("description", values.description);
			if (values.thumbnail) body.append("thumbnail", values.thumbnail);
			const { data } = await api.post(backendRoutes.CATEGORIES, body, { headers: { "Content-Type": "multipart/form-data" } });
			return data.data as Category;
		},
		retry: false,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

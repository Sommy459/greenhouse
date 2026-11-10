"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { ProductBody, ProductListParams, ProductStatus, VendorProduct } from "@/features/products/types";

const KEY = ["vendor", "products"];
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

/** V7: the shop's products, newest first, by status and search. */
export function useMyProducts(params: ProductListParams) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<VendorProduct>(backendRoutes.MY_PRODUCTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useMyProduct(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<VendorProduct>(backendRoutes.MY_PRODUCT(id)) });
}

/** Hide / show (PRD V7): `hidden` takes products off the store; `active` puts them back. One request each. */
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
			toast.success(status === "hidden" ? `${what} hidden from the store` : `${what} back in the store`);
		},
		onError: (error) => toast.error(errorMessage(error)),
		// Some may have saved before one failed: refresh either way.
		onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

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
			toast.success(`${product.title} was deleted`);
			queryClient.invalidateQueries({ queryKey: KEY });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export interface SaveProduct {
	/** Absent when creating. */
	id?: string;
	body: Partial<ProductBody>;
	/** New photos to add (in order, after the existing ones). */
	newImages: File[];
	/** Existing photos to delete. */
	removedImageIds: string[];
	/** The kept photos' order, when it changed. */
	imageOrder?: string[];
}

/**
 * Create or edit (PRD V7): the details first, then photo deletions, uploads (one per request, JPEG/PNG/WebP up to 5 MB,
 * 8 at most) and the new order. Never retried: a slow answer can't create it twice.
 */
export function useSaveProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, body, newImages, removedImageIds, imageOrder }: SaveProduct) => {
			let product = id
				? ((await api.patch(backendRoutes.MY_PRODUCT(id), body)).data.data as VendorProduct)
				: ((await api.post(backendRoutes.MY_PRODUCTS, body)).data.data as VendorProduct);
			for (const imageId of removedImageIds) {
				product = (await api.delete(backendRoutes.PRODUCT_IMAGE(product.id, imageId))).data.data as VendorProduct;
			}
			if (imageOrder?.length) {
				product = (await api.put(backendRoutes.PRODUCT_IMAGE_ORDER(product.id), { imageIds: imageOrder })).data
					.data as VendorProduct;
			}
			for (const file of newImages) {
				const data = new FormData();
				data.set("image", file);
				product = (await api.post(backendRoutes.PRODUCT_IMAGES(product.id), data, multipart)).data.data as VendorProduct;
			}
			return product;
		},
		retry: false,
		onSuccess: (product) => {
			queryClient.setQueryData([...KEY, product.id], product);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
		},
	});
}

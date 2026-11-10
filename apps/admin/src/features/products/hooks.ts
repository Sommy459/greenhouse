"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { AdminCategory, AdminProduct, ModerationStatus } from "@/features/products/types";

const KEY = ["admin", "products"];
const CATEGORIES = ["admin", "categories"];

/** PRD A5: every product, by moderation state, vendor and search. */
export function useAdminProducts(params: {
	q?: string;
	vendorId?: string;
	moderationStatus?: ModerationStatus;
	includeDeleted?: boolean;
	page: number;
	limit: number;
}) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getPage<AdminProduct>(backendRoutes.PRODUCTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export type Moderation = { action: "hide" | "remove"; reason: string } | { action: "unhide" };

/** Hide or remove (the vendor sees the reason), or put a hidden product back. */
export function useModerateProduct() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ product, moderation }: { product: AdminProduct; moderation: Moderation }) => {
			const url =
				moderation.action === "hide"
					? backendRoutes.HIDE_PRODUCT(product.id)
					: moderation.action === "remove"
						? backendRoutes.REMOVE_PRODUCT(product.id)
						: backendRoutes.UNHIDE_PRODUCT(product.id);
			const body = moderation.action === "unhide" ? undefined : { reason: moderation.reason };
			return (await api.post(url, body)).data.data as AdminProduct;
		},
		retry: false,
		onSuccess: (product, { moderation }) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success(
				moderation.action === "hide"
					? `${product.title} is hidden from the store`
					: moderation.action === "remove"
						? `${product.title} was removed`
						: `${product.title} is back in the store`,
			);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useAdminCategories() {
	return useQuery({ queryKey: CATEGORIES, queryFn: () => getData<AdminCategory[]>(backendRoutes.CATEGORIES) });
}

function useCategoryMutation<V>(request: (vars: V) => Promise<AdminCategory>, success: (c: AdminCategory) => string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (category) => {
			queryClient.invalidateQueries({ queryKey: CATEGORIES });
			toast.success(success(category));
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useCreateCategory() {
	return useCategoryMutation(
		async (body: { name: string; slug?: string; sortOrder?: number }) =>
			(await api.post(backendRoutes.CATEGORIES, body)).data.data as AdminCategory,
		(c) => `${c.name} added`,
	);
}

/** Rename, reorder, or switch a category on or off. */
export function useUpdateCategory() {
	return useCategoryMutation(
		async ({ id, ...body }: { id: string; name?: string; isActive?: boolean; sortOrder?: number }) =>
			(await api.patch(backendRoutes.CATEGORY(id), body)).data.data as AdminCategory,
		(c) => `${c.name} saved`,
	);
}

export interface AdminProductBody {
	title: string;
	description: string;
	priceCents: number;
	stock: number;
	categoryId: string;
	certifications: string[];
	status: "active" | "hidden";
	/** Only when adding. */
	vendorId?: string;
}

/**
 * Add a product to a vendor's shop, or edit one, then delete removed photos and upload new ones (one request each).
 * Never retried: a retried create could list it twice.
 */
export function useSaveAdminProduct() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			body,
			newImages,
			removedImageIds,
		}: {
			id?: string;
			body: AdminProductBody;
			newImages: File[];
			removedImageIds: string[];
		}) => {
			let product = (id ? await api.patch(backendRoutes.PRODUCT(id), body) : await api.post(backendRoutes.PRODUCTS, body)).data
				.data as AdminProduct;
			for (const imageId of removedImageIds)
				product = (await api.delete(backendRoutes.PRODUCT_IMAGE(product.id, imageId))).data.data as AdminProduct;
			for (const file of newImages) {
				const form = new FormData();
				form.append("image", file);
				product = (
					await api.post(backendRoutes.PRODUCT_IMAGES(product.id), form, { headers: { "Content-Type": "multipart/form-data" } })
				).data.data as AdminProduct;
			}
			return { product, created: !id };
		},
		retry: false,
		onSuccess: ({ product, created }) => toast.success(created ? `${product.title} is listed` : `${product.title} saved`),
		onError: (error) => toast.error(errorMessage(error, "Couldn't save the product. Try again.")),
		onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

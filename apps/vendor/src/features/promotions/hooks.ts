"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { PerformanceParams, Promotion, PromotionListParams, PromotionPerformance } from "@/features/promotions/types";

const KEY = ["vendor", "promotions"];

export function usePromotions(params: PromotionListParams) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getData<Paginated<Promotion>>(backendRoutes.PROMOTIONS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Stop a promotion that hasn't ended: enrolled products go back to full price. */
export function useCancelPromotion() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (promotion: Promotion) =>
			(await api.post(backendRoutes.PROMOTION_CANCEL(promotion.id))).data.data as Promotion,
		retry: false,
		onSuccess: (promotion) => {
			toast.success(`${promotion.name} is cancelled`);
			queryClient.invalidateQueries({ queryKey: KEY });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Monitor Promotions: sales of each product in a promotion, and the totals above them. */
export function usePromotionPerformance(params: PerformanceParams) {
	return useQuery({
		queryKey: [...KEY, "performance", params],
		queryFn: () => getData<PromotionPerformance>(backendRoutes.PROMOTION_PERFORMANCE, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useExportPerformance() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<PerformanceParams, "page" | "limit"> & { ids?: string }) =>
			downloadCsv(backendRoutes.PROMOTION_PERFORMANCE_EXPORT, params, "fysi-promotion-sales"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the promotion sales. Try again.")),
	});
}

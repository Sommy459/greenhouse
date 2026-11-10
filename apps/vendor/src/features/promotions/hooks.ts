"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Promotion, PromotionAction, PromotionBody, PromotionState } from "@/features/promotions/types";

const KEY = ["vendor", "promotions"];

export function usePromotions(params: { state?: PromotionState; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<Promotion>(backendRoutes.PROMOTIONS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function usePromotion(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<Promotion>(backendRoutes.PROMOTION(id)) });
}

/** Create (no id) or edit. Never retried. */
export function useSavePromotion(id?: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: Partial<PromotionBody>) =>
			(id ? await api.patch(backendRoutes.PROMOTION(id), body) : await api.post(backendRoutes.PROMOTIONS, body)).data
				.data as Promotion,
		retry: false,
		onSuccess: (promotion) => {
			queryClient.setQueryData([...KEY, promotion.id], promotion);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			queryClient.invalidateQueries({ queryKey: ["vendor", "products"] });
			toast.success(id ? "Promotion saved" : "Promotion created");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't save the promotion. Try again.")),
	});
}

const DONE: Record<PromotionAction, string> = { pause: "Promotion paused", resume: "Promotion resumed", end: "Promotion ended" };

export function usePromotionAction() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, action }: { id: string; action: PromotionAction }) =>
			(await api.post(backendRoutes.PROMOTION_ACTION(id, action))).data.data as Promotion,
		retry: false,
		onSuccess: (promotion, { action }) => {
			queryClient.setQueryData([...KEY, promotion.id], promotion);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(DONE[action]);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

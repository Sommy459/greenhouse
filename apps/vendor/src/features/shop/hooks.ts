"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { toOnboardingFormData, type OnboardingValues } from "@/features/shop/schema";
import type { Shop } from "@/features/shop/types";

export const shopKeys = { mine: ["my-shop"] as const };

/** The vendor's shop; null until onboarding is done. Its status gates the console (ShopGate). */
export function useMyShop() {
	return useQuery({ queryKey: shopKeys.mine, queryFn: () => getData<Shop | null>(backendRoutes.MY_SHOP) });
}

/** The last sign-up step: creates the shop (pending approval). The caller shows "Your shop is ready!". */
export function useOnboardShop({ onCreated }: { onCreated: (shop: Shop) => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		// Multipart (it can carry the CAC certificate). The explicit type stops axios turning the FormData into JSON;
		// the browser then sets it with the boundary.
		mutationFn: async (values: OnboardingValues) =>
			(
				await api.post(backendRoutes.ONBOARDING, toOnboardingFormData(values), {
					headers: { "Content-Type": "multipart/form-data" },
				})
			).data.data as Shop,
		onSuccess: (shop) => {
			queryClient.setQueryData(shopKeys.mine, shop);
			onCreated(shop);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

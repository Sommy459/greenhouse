"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { CheckoutQuote, PlaceOrderRequest, PlaceOrderResult, QuoteRequest } from "@/features/checkout/types";

/**
 * The API's price for the cart: subtotal, coupon discount, shipping and total (C5, C15). Re-asked whenever the items or
 * the coupon change; the previous numbers stay on screen meanwhile.
 */
export function useCheckoutQuote(request: QuoteRequest, enabled: boolean) {
	return useQuery({
		queryKey: ["checkout-quote", request],
		queryFn: async () => (await api.post(backendRoutes.CHECKOUT_QUOTE, request)).data.data as CheckoutQuote,
		enabled,
		placeholderData: keepPreviousData,
	});
}

/**
 * Places the order (C5, C6). Never retried automatically: a retried order or payment could go through twice. The button
 * is disabled while this runs.
 */
export function usePlaceOrder({ onPlaced }: { onPlaced: (result: PlaceOrderResult) => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (body: PlaceOrderRequest) => (await api.post(backendRoutes.ORDERS, body)).data.data as PlaceOrderResult,
		retry: false,
		onSuccess: onPlaced,
		onError: (error) => toast.error(errorMessage(error, "We couldn't place your order. Check your orders before trying again.")),
	});
}

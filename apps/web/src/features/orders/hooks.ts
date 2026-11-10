"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Order } from "@/features/orders/types";

export { useOrder } from "@/features/checkout/hooks";

/** Order History (C8): the customer's orders, newest first. */
export function useOrders(page: number, limit = 10) {
	return useQuery({
		queryKey: ["orders", "list", page, limit],
		queryFn: () => getPage<Order>(backendRoutes.ORDERS, { page, limit }),
		placeholderData: keepPreviousData,
	});
}

function useVendorOrderAction<V>(request: (vars: V) => Promise<Order>, success: string, fallback: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData(["orders", order.id], order);
			queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
			toast.success(success);
		},
		onError: (error) => toast.error(errorMessage(error, fallback)),
	});
}

/** "Confirm delivery" (C8): releases that vendor's payout from escrow. Never retried. */
export function useConfirmDelivery(orderId: string) {
	return useVendorOrderAction(
		async (vendorOrderId: string) => (await api.post(backendRoutes.CONFIRM_DELIVERY(orderId, vendorOrderId))).data.data as Order,
		"Thanks! We've let the seller know it arrived.",
		"Couldn't confirm the delivery. Try again.",
	);
}

/** "Report a problem" (C8): up to 7 days after delivery. Holds the payout while Fysi looks into it. */
export function useReportProblem(orderId: string) {
	return useVendorOrderAction(
		async ({ vendorOrderId, reason }: { vendorOrderId: string; reason: string }) =>
			(await api.post(backendRoutes.REPORT_PROBLEM(orderId, vendorOrderId), { reason })).data.data as Order,
		"Problem reported. Fysi will look into it and get back to you by email.",
		"Couldn't send your report. Try again.",
	);
}

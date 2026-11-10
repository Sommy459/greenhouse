"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { OrderStatus, StatusUpdate, VendorOrder } from "@/features/orders/types";

const KEY = ["vendor", "orders"];

/** PRD V8: the shop's paid orders, newest first, by status. */
export function useMyOrders(params: { status?: OrderStatus; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<VendorOrder>(backendRoutes.MY_ORDERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useMyOrder(id: string | null) {
	return useQuery({
		queryKey: [...KEY, id],
		queryFn: () => getData<VendorOrder>(backendRoutes.MY_ORDER(id!)),
		enabled: !!id,
	});
}

/** Processing → Shipped (carrier and tracking number; starts the 7-day escrow timer) → Delivered. Never retried. */
export function useUpdateOrderStatus(id: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (update: StatusUpdate) =>
			(await api.patch(backendRoutes.MY_ORDER_STATUS(id), update)).data.data as VendorOrder,
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData([...KEY, id], order);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(
				order.status === "shipped"
					? "Marked as shipped. The customer has the tracking number."
					: order.status === "delivered"
						? "Marked as delivered. You're paid when the customer confirms, or 7 days after shipping."
						: "Order updated",
			);
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't update the order. Try again.")),
	});
}

/** Cancel before shipping, with a reason the customer sees; Fysi refunds the customer. Never retried. */
export function useCancelOrder(id: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (reason: string) => (await api.post(backendRoutes.CANCEL_ORDER(id), { reason })).data.data as VendorOrder,
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData([...KEY, id], order);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success("Order cancelled. The customer is refunded.");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't cancel the order. Try again.")),
	});
}

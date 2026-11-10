"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Paginated } from "@/features/products/types";
import type { AdminOrder, OrderDetail, OrderListParams } from "@/features/orders/types";

/** Every order on the platform. The previous page stays on screen while the next loads. */
export function useAdminOrders(params: OrderListParams) {
	return useQuery({
		queryKey: ["admin", "orders", params],
		queryFn: () => getData<Paginated<AdminOrder>>(backendRoutes.ORDERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** The Order Details dialog. Off until there's an order to show. */
export function useAdminOrder(orderId: string | null) {
	return useQuery({
		queryKey: ["admin", "orders", "detail", orderId],
		queryFn: () => getData<OrderDetail>(backendRoutes.ORDER(orderId!)),
		enabled: !!orderId,
	});
}

export function useDeleteOrder() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (order: AdminOrder) => {
			await api.delete(backendRoutes.ORDER(order.id));
			return order;
		},
		retry: false,
		onSuccess: (order) => {
			toast.success(`Order ${order.number} deleted`);
			queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/**
 * "Export": a CSV of the ticked orders, or of every order matching the filters when none are ticked. The API builds
 * the file, so it isn't limited to the page on screen.
 */
export function useExportOrders() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<OrderListParams, "page" | "limit"> & { ids?: string }) =>
			downloadCsv(backendRoutes.ORDERS_EXPORT, params, "fysi-orders"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export the orders. Try again.")),
	});
}

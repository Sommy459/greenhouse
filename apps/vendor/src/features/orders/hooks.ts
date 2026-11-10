"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api, errorMessage, getData } from "@/lib/api/client";
import { downloadCsv } from "@/lib/api/download";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { ORDER_STATUS_LABEL } from "@/features/orders/options";
import type { Paginated } from "@/features/products/types";
import type { OrderDetail, OrderListParams, StatusUpdate, VendorOrder } from "@/features/orders/types";

const KEY = ["vendor", "orders"];

/** V8: the shop's orders, with tabs, search, dates, a status filter, sort and pages. */
export function useMyOrders(params: OrderListParams) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getData<Paginated<VendorOrder>>(backendRoutes.MY_ORDERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** The Order Details dialog. */
export function useMyOrder(orderId: string | null) {
	return useQuery({
		queryKey: [...KEY, "detail", orderId],
		queryFn: () => getData<OrderDetail>(backendRoutes.MY_ORDER(orderId!)),
		enabled: !!orderId,
	});
}

/** V8: move an order on (with courier and tracking number when shipping). Never retried. */
export function useUpdateOrderStatus(orderId: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (update: StatusUpdate) =>
			(await api.post(backendRoutes.MY_ORDER_STATUS(orderId), update)).data.data as OrderDetail,
		retry: false,
		onSuccess: (order) => {
			queryClient.setQueryData([...KEY, "detail", orderId], order);
			queryClient.invalidateQueries({ queryKey: KEY, predicate: (q) => q.queryKey[2] !== "detail" });
			queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
			toast.success(`Order ${order.number} is now ${ORDER_STATUS_LABEL[order.status].toLowerCase()}`);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Export": the ticked orders, or every order matching the tab, search and filters. */
export function useExportOrders() {
	const toast = useToast();
	return useMutation({
		mutationFn: (params: Omit<OrderListParams, "page" | "limit" | "sort"> & { ids?: string }) =>
			downloadCsv(backendRoutes.MY_ORDERS_EXPORT, params, "fysi-my-orders"),
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't export your orders. Try again.")),
	});
}

/** Track Orders: one package by tracking number or order ID. `null` when nothing matches (the API's 404). */
export function useTrackOrder(q: string) {
	return useQuery({
		queryKey: [...KEY, "track", q],
		queryFn: async () => {
			try {
				return await getData<OrderDetail>(backendRoutes.TRACK_ORDER, { q });
			} catch (error) {
				if (isAxiosError(error) && error.response?.status === 404) return null;
				throw error;
			}
		},
		enabled: q.trim().length > 0,
		retry: false,
	});
}

"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { AdminVendorOrder, EscrowStatus } from "@/features/orders/types";

const KEY = ["admin", "vendor-orders"];

export function useVendorOrders(params: { escrowStatus?: EscrowStatus; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, params],
		queryFn: () => getPage<AdminVendorOrder>(backendRoutes.VENDOR_ORDERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/**
 * Settle a vendor order by hand (both audited, never retried): release the escrow to the vendor, or cancel it and refund
 * the customer.
 */
export function useSettleVendorOrder() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ order, action, reason }: { order: AdminVendorOrder; action: "release" | "refund"; reason: string }) =>
			api.post(action === "release" ? backendRoutes.RELEASE_ESCROW(order.id) : backendRoutes.REFUND_VENDOR_ORDER(order.id), {
				reason,
			}),
		retry: false,
		onSuccess: (_, { order, action }) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success(
				action === "release" ? `Released ${order.orderNumber} to the vendor` : `Refunding ${order.orderNumber} to the customer`,
			);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

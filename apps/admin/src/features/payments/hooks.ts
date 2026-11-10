"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { IncomingPayment, PaymentStatus, Transfer, TransferKind } from "@/features/payments/types";

export function usePayments(params: { status?: PaymentStatus; needsRefund?: boolean; q?: string; page: number; limit: number }) {
	return useQuery({
		queryKey: ["admin", "payments", params],
		queryFn: () => getPage<IncomingPayment>(backendRoutes.PAYMENTS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

/** Sends an over- or unmatched payment back to the payer (audited, never retried). */
export function useRefundPayment() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ payment, reason }: { payment: IncomingPayment; reason: string }) =>
			api.post(backendRoutes.REFUND_PAYMENT(payment.id), { reason }),
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
			toast.success("Refund queued. It shows under Transfers → Refunds.");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useTransfers(kind: TransferKind, params: { status?: Transfer["status"]; page: number; limit: number }) {
	return useQuery({
		queryKey: ["admin", "transfers", kind, params],
		queryFn: () => getPage<Transfer>(backendRoutes.TRANSFERS(kind), { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useRetryTransfer(kind: TransferKind) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => api.post(backendRoutes.RETRY_TRANSFER(kind, id)),
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
			toast.success("Sent again");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { VendorWallet, WalletEntry } from "@/features/wallet/types";

const KEY = ["vendor", "wallet"];

export function useVendorWallet() {
	return useQuery({ queryKey: KEY, queryFn: () => getData<VendorWallet>(backendRoutes.WALLET) });
}

/** PRD V6, step 1: where and how much (cents). The API emails a 6-digit code to confirm it. */
export function useStartWithdrawal() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: { destination: string; amountCents: number }) =>
			(await api.post(backendRoutes.WITHDRAWALS, body)).data.data as WalletEntry,
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success("We've emailed you a code to confirm the withdrawal.");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't start the withdrawal. Check the address and amount.")),
	});
}

/** Step 2: password plus the emailed code. The USDC is sent at once. Never retried. */
export function useConfirmWithdrawal() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, password, code }: { id: string; password: string; code: string }) =>
			(await api.post(backendRoutes.CONFIRM_WITHDRAWAL(id), { password, code })).data.data as WalletEntry,
		retry: false,
		onSuccess: (entry) => {
			queryClient.invalidateQueries({ queryKey: KEY });
			if (entry.status === "failed") toast.error(entry.error ?? "The withdrawal failed. Your USDC is still in your wallet.");
			else toast.success("Withdrawal sent");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't confirm. Check your password and the code.")),
	});
}

export function useCancelWithdrawal() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => api.delete(backendRoutes.WITHDRAWAL(id)),
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success("Withdrawal cancelled");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

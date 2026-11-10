"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Wallet } from "@/features/wallet/types";

const KEY = ["wallet"];

/** The Fysi wallet, or null when the customer hasn't created one yet (the API answers 404). */
export function useWallet({ enabled = true }: { enabled?: boolean } = {}) {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			try {
				return await getData<Wallet>(backendRoutes.WALLET);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) return null;
				throw error;
			}
		},
		enabled,
		// A deposit shows up without reloading.
		refetchInterval: (query) => (query.state.data ? 15_000 : false),
	});
}

/** "Create my wallet": the PIN that approves payments from it. */
export function useCreateWallet() {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (pin: string) => (await api.post(backendRoutes.WALLET, { pin })).data.data as Wallet,
		retry: false,
		onSuccess: (wallet) => {
			queryClient.setQueryData(KEY, wallet);
			toast.success("Your Fysi wallet is ready. Add USDC to start paying with it.");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't create your wallet. Try again.")),
	});
}

/** Change the PIN (the account password proves it's you). */
export function useChangePin({ onChanged }: { onChanged: () => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: { password: string; newPin: string }) => api.put(backendRoutes.WALLET_PIN, values),
		retry: false,
		onSuccess: () => {
			toast.success("PIN changed");
			onChanged();
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't change your PIN. Try again.")),
	});
}

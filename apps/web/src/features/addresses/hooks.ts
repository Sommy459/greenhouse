"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { AddressBody, SavedAddress } from "@/features/addresses/types";

const KEY = ["addresses"];

/** Saved addresses, the default first. */
export function useAddresses({ enabled = true }: { enabled?: boolean } = {}) {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const list = await getData<SavedAddress[]>(backendRoutes.ADDRESSES);
			return [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
		},
		enabled,
	});
}

function useAddressAction<V>(request: (vars: V) => Promise<unknown>, success: string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			toast.success(success);
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't save the address. Try again.")),
	});
}

/** Add (no id) or edit an address. */
export const useSaveAddress = () =>
	useAddressAction(
		async ({ id, ...body }: AddressBody & { id?: string }) =>
			id
				? (await api.patch(backendRoutes.ADDRESS(id), body)).data.data
				: (await api.post(backendRoutes.ADDRESSES, body)).data.data,
		"Address saved",
	);

export const useDeleteAddress = () => useAddressAction((id: string) => api.delete(backendRoutes.ADDRESS(id)), "Address removed");

export const useMakeDefaultAddress = () =>
	useAddressAction((id: string) => api.post(backendRoutes.ADDRESS_DEFAULT(id)), "Default address changed");

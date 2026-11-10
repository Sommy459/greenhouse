"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { normalisePhone, type AddressValues } from "@/features/checkout/schema";
import type { DeliveryAddress } from "@/features/checkout/types";
import type { ChangePasswordValues, PersonalInfoValues } from "@/features/account/schema";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

const KEY = ["account", "address"];

/** The saved address (My Account "Billing Address"). Null until one is saved. */
export function useAddress() {
	return useQuery({ queryKey: KEY, queryFn: () => getData<DeliveryAddress | null>(backendRoutes.ADDRESS) });
}

export function useSaveAddress({ onSaved }: { onSaved: () => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (values: AddressValues) =>
			(await api.put(backendRoutes.ADDRESS, { ...values, phone_number: normalisePhone(values.phone_number) })).data
				.data as DeliveryAddress,
		retry: false,
		onSuccess: (address) => {
			queryClient.setQueryData(KEY, address);
			toast.success("Address saved");
			onSaved();
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't save your address. Try again.")),
	});
}

/** Settings "Save changes": name and email, then the new photo if one was chosen. Not retried. */
export function useUpdateProfile({ onSaved }: { onSaved: () => void }) {
	const toast = useToast();
	const setUser = useSession((s) => s.setUser);
	return useMutation({
		mutationFn: async ({ values, photo }: { values: PersonalInfoValues; photo: File | null }) => {
			let user = (await api.put(backendRoutes.PROFILE, values)).data.data as User;
			if (photo) {
				const data = new FormData();
				data.set("photo", photo);
				user = (await api.post(backendRoutes.AVATAR, data, { headers: { "Content-Type": "multipart/form-data" } })).data
					.data as User;
			}
			return user;
		},
		retry: false,
		onSuccess: (user) => {
			setUser(user);
			toast.success("Your details are saved");
			onSaved();
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't save your details. Try again.")),
	});
}

/** Settings "Update password". Never retried. */
export function useChangePassword({ onChanged }: { onChanged: () => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: ChangePasswordValues) =>
			api.post(backendRoutes.CHANGE_PASSWORD, {
				current_password: values.current_password,
				new_password: values.new_password,
			}),
		retry: false,
		onSuccess: () => {
			toast.success("Password updated");
			onChanged();
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't update your password. Try again.")),
	});
}

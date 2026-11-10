"use client";

import { useMutation } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { normalisePhone } from "@/features/checkout/schema";
import type { ChangePasswordValues, PersonalInfoValues } from "@/features/account/schema";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

/** Settings "Save changes": name and phone (PATCH /auth/me), then the new photo if one was chosen. Not retried. */
export function useUpdateProfile({ onSaved }: { onSaved: () => void }) {
	const toast = useToast();
	const setUser = useSession((s) => s.setUser);
	return useMutation({
		mutationFn: async ({ values, photo }: { values: PersonalInfoValues; photo: File | null }) => {
			let user = (
				await api.patch(backendRoutes.ME, { name: values.name, phone: values.phone ? normalisePhone(values.phone) : null })
			).data.data as User;
			if (photo) {
				const data = new FormData();
				data.set("avatar", photo);
				user = (await api.put(backendRoutes.AVATAR, data, { headers: { "Content-Type": "multipart/form-data" } })).data
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

/** Removes the profile photo (back to initials). */
export function useRemoveAvatar() {
	const toast = useToast();
	const setUser = useSession((s) => s.setUser);
	return useMutation({
		mutationFn: async () => (await api.delete(backendRoutes.AVATAR)).data.data as User,
		retry: false,
		onSuccess: (user) => {
			setUser(user);
			toast.success("Photo removed");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't remove your photo. Try again.")),
	});
}

/** Settings "Update password". Never retried. */
export function useChangePassword({ onChanged }: { onChanged: () => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: ChangePasswordValues) =>
			api.post(backendRoutes.CHANGE_PASSWORD, { currentPassword: values.current_password, newPassword: values.new_password }),
		retry: false,
		onSuccess: () => {
			toast.success("Password updated");
			onChanged();
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't update your password. Check your current password.")),
	});
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useSession } from "@/features/auth/session";
import type { ProfileValues } from "@/features/settings/schema";
import type { AdminProfile } from "@/features/settings/types";

const KEY = ["admin", "profile"];

/** Keeps the sidebar and top bar (which read the session) in step with the saved profile. */
function useSyncSession() {
	const user = useSession((s) => s.user);
	const setUser = useSession((s) => s.setUser);
	return (profile: AdminProfile) => {
		if (user)
			setUser({
				...user,
				first_name: profile.first_name,
				last_name: profile.last_name,
				email: profile.email,
				phone_number: profile.phone_number,
				avatar_url: profile.avatar_url,
			});
	};
}

export function useAdminProfile() {
	return useQuery({ queryKey: KEY, queryFn: () => getData<AdminProfile>(backendRoutes.PROFILE) });
}

/** Figma "Submit". */
export function useUpdateProfile() {
	const toast = useToast();
	const queryClient = useQueryClient();
	const sync = useSyncSession();
	return useMutation({
		mutationFn: async (values: ProfileValues) => (await api.put(backendRoutes.PROFILE, values)).data.data as AdminProfile,
		retry: false,
		onSuccess: (profile) => {
			queryClient.setQueryData(KEY, profile);
			sync(profile);
			toast.success("Your details are saved");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Figma "Update new avatar": multipart `avatar`. */
export function useUploadAvatar() {
	const toast = useToast();
	const queryClient = useQueryClient();
	const sync = useSyncSession();
	return useMutation({
		mutationFn: async (file: File) => {
			const body = new FormData();
			body.append("avatar", file);
			return (await api.post(backendRoutes.PROFILE_AVATAR, body)).data.data as AdminProfile;
		},
		retry: false,
		onSuccess: (profile) => {
			queryClient.setQueryData(KEY, profile);
			sync(profile);
			toast.success("Photo updated");
		},
		onError: (error) => toast.error(errorMessage(error, "Couldn't upload the photo. Try again.")),
	});
}

/** Figma "Delete Avatar". */
export function useDeleteAvatar() {
	const toast = useToast();
	const queryClient = useQueryClient();
	const sync = useSyncSession();
	return useMutation({
		mutationFn: async () => (await api.delete(backendRoutes.PROFILE_AVATAR)).data.data as AdminProfile,
		retry: false,
		onSuccess: (profile) => {
			queryClient.setQueryData(KEY, profile);
			sync(profile);
			toast.success("Photo removed");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

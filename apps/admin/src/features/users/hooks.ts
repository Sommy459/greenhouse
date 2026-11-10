"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage, getData, getPage } from "@/lib/api/client";
import { backendRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import type { Role } from "@/features/auth/types";
import type { AdminUser, UserDetail } from "@/features/users/types";

const KEY = ["admin", "users"];

export function useUsers(params: { q?: string; role?: Role; suspended?: boolean; page: number; limit: number }) {
	return useQuery({
		queryKey: [...KEY, "list", params],
		queryFn: () => getPage<AdminUser>(backendRoutes.USERS, { ...params }),
		placeholderData: keepPreviousData,
	});
}

export function useUser(id: string) {
	return useQuery({ queryKey: [...KEY, id], queryFn: () => getData<UserDetail>(backendRoutes.USER(id)) });
}

function useUserAction<V>(request: (vars: V) => Promise<UserDetail>, success: (u: UserDetail) => string) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: request,
		retry: false,
		onSuccess: (user) => {
			queryClient.setQueryData([...KEY, user.id], user);
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(success(user));
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Suspend (signs them out everywhere; they can't sign in) with a reason, or restore. */
export function useSuspendUser(id: string) {
	return useUserAction(
		async (reason: string | null) =>
			(reason ? await api.post(backendRoutes.SUSPENSION(id), { reason }) : await api.delete(backendRoutes.SUSPENSION(id))).data
				.data as UserDetail,
		(u) => (u.suspended ? `${u.name} is suspended` : `${u.name} can sign in again`),
	);
}

/** For someone who lost their authenticator: they set it up again at next sign-in. */
export function useResetTwoFactor(id: string) {
	return useUserAction(
		async (reason: string) => (await api.post(backendRoutes.RESET_2FA(id), { reason })).data.data as UserDetail,
		(u) => `${u.name}'s two-factor sign-in was reset`,
	);
}

/** Deletes a customer's account for good, with a reason for the audit log. */
export function useDeleteUser(id: string) {
	return useUserAction(
		async (reason: string) => (await api.delete(backendRoutes.USER(id), { data: { reason } })).data.data as UserDetail,
		(u) => `${u.name}'s account was deleted`,
	);
}

/** Super admins only: the new admin gets an email to set their password (PRD A7). */
export function useCreateAdmin({ onCreated }: { onCreated: () => void }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body: { email: string; name: string }) =>
			(await api.post(backendRoutes.USERS, body)).data.data as { name: string },
		retry: false,
		onSuccess: (admin) => {
			queryClient.invalidateQueries({ queryKey: [...KEY, "list"] });
			toast.success(`${admin.name} was invited. They'll get an email to finish setting up.`);
			onCreated();
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

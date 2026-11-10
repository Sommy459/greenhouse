"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api/client";
import { authRoutes, backendRoutes, consoleRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useSession } from "@/features/auth/session";
import type { SignInValues } from "@/features/auth/schema";
import type { AuthSession } from "@/features/auth/types";

/** A1: admin rights are checked at sign-in; accounts without them are refused (escalation goes to a super admin). */
export function useSignIn() {
	const router = useRouter();
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);

	return useMutation({
		mutationFn: async (values: SignInValues) => (await api.post(backendRoutes.SIGN_IN, values)).data.data as AuthSession,
		onSuccess: (session) => {
			if (session.user.role !== "admin" && session.user.role !== "super_admin") {
				toast.error("This account has no admin rights. Ask a super admin for access.");
				return;
			}
			signIn(session);
			router.replace(consoleRoutes.OVERVIEW);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

export function useSignOut() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const signOut = useSession((s) => s.signOut);

	return () => {
		signOut();
		queryClient.clear();
		router.replace(authRoutes.SIGN_IN);
	};
}

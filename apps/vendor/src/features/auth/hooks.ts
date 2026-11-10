"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api/client";
import { authRoutes, backendRoutes, consoleRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useSession } from "@/features/auth/session";
import type { SignInValues } from "@/features/auth/schema";
import type { AuthSession, EmailVerification, VendorSignUpBody } from "@/features/auth/types";

/** Only vendor accounts get into the seller centre; ShopGate then routes to onboarding or approval as needed. */
export function useSignIn() {
	const router = useRouter();
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);

	return useMutation({
		mutationFn: async (values: SignInValues) => (await api.post(backendRoutes.SIGN_IN, values)).data.data as AuthSession,
		onSuccess: (session) => {
			if (session.user.role !== "vendor") {
				toast.error("This is not a vendor account. Create a seller account to sell on Fysi.");
				return;
			}
			signIn(session);
			router.replace(consoleRoutes.OVERVIEW);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Sign-up step 2 → 3: e-mails a verification code. Also used by "Resend Code". */
export function useRequestEmailCode({ onSent }: { onSent?: (message?: string) => void } = {}) {
	const toast = useToast();

	return useMutation({
		mutationFn: async (email: string) =>
			(await api.post(backendRoutes.EMAIL_CODE, { email, role: "vendor" })).data as { message?: string },
		onSuccess: (data) => onSent?.(data?.message),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Sign-up step 3: checks the code and returns a short-lived token for creating the account. */
export function useVerifyEmail({ onVerified }: { onVerified: (verification_token: string) => void }) {
	const toast = useToast();

	return useMutation({
		mutationFn: async (values: { email: string; code: string }) =>
			(await api.post(backendRoutes.EMAIL_VERIFY, values)).data.data as EmailVerification,
		onSuccess: ({ verification_token }) => onVerified(verification_token),
		onError: (error) => toast.error(errorMessage(error, "That code didn't work. Check it and try again.")),
	});
}

/** Sign-up step 4: creates the seller account and signs in. The wizard then continues to the shop details. */
export function useSignUp({ onSignedUp }: { onSignedUp: () => void }) {
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);

	return useMutation({
		mutationFn: async (body: VendorSignUpBody) => (await api.post(backendRoutes.SIGN_UP, body)).data.data as AuthSession,
		onSuccess: (session) => {
			signIn(session);
			onSignedUp();
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

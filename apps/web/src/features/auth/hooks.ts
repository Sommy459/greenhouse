"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { create } from "zustand";
import { api, errorMessage } from "@/lib/api/client";
import { authRoutes, backendRoutes, shopRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { pullServerCart } from "@/features/cart/sync";
import { useSession } from "@/features/auth/session";
import type { SignInValues } from "@/features/auth/schema";
import type { CodeSent, LoginResult, TokenSet, User } from "@/features/auth/types";

/** Where to go after signing in: the `next` param RequireAuth set, when it is a path on this site. */
function useNextPath(fallback: string) {
	const next = useSearchParams().get("next");
	return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/**
 * Sign-up details carried across "Welcome to Fysi" → "Create your account" → "Personal Details" until they're sent with
 * POST /auth/register. Memory only (never stored): a reload starts sign-up again.
 */
export const useSignUpDraft = create<{
	email: string;
	password: string;
	set: (draft: Partial<{ email: string; password: string }>) => void;
	clear: () => void;
}>()((set) => ({
	email: "",
	password: "",
	set: (draft) => set(draft),
	clear: () => set({ email: "", password: "" }),
}));

/**
 * Finishes any sign-in: loads the profile with the new token, keeps the session, and adds what's in the account's cart
 * to this browser's cart. The storefront is for customers; vendor and admin accounts are pointed to their own apps.
 */
async function startSession(tokens: TokenSet) {
	if (tokens.role !== "customer") {
		throw new Error(
			tokens.role === "vendor"
				? "This is a vendor account. Sign in on Fysi Vendor Hub (Sell on Fysi)."
				: "This is an admin account. Sign in on the admin console.",
		);
	}
	const { data } = await api.get(backendRoutes.ME, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
	useSession.getState().signIn(tokens, data.data as User);
	await pullServerCart().catch(() => undefined);
}

const messageOf = (error: unknown, fallback: string) =>
	error instanceof Error && !("isAxiosError" in error) ? error.message : errorMessage(error, fallback);

/** "Welcome back": email and password. Then back to where they were going, or the home page. */
export function useSignIn() {
	const router = useRouter();
	const toast = useToast();
	const next = useNextPath(shopRoutes.HOME);

	return useMutation({
		mutationFn: async (values: SignInValues) => {
			const result = (await api.post(backendRoutes.SIGN_IN, values)).data.data as LoginResult;
			if (result.mfaRequired) {
				throw new Error("This account uses two-factor sign-in, which the shop doesn't support yet.");
			}
			await startSession(result);
		},
		retry: false,
		onSuccess: () => router.replace(next),
		onError: (error) => toast.error(messageOf(error, "That email and password don't match.")),
	});
}

/**
 * Last sign-up step ("Personal Details"): creates the account with everything gathered so far. The API emails a
 * 6-digit code; the verify screen comes next. Signing up again with an unverified email replaces that attempt.
 */
export function useRegister() {
	const router = useRouter();
	const toast = useToast();
	const next = useSearchParams().get("next");
	const draft = useSignUpDraft();

	return useMutation({
		mutationFn: async ({ name, phone }: { name: string; phone: string }) =>
			(
				await api.post(backendRoutes.REGISTER, {
					accountType: "customer",
					name,
					email: draft.email,
					password: draft.password,
					phone,
				})
			).data.data as CodeSent,
		retry: false,
		onSuccess: () => router.push(authRoutes.VERIFY(draft.email, next)),
		onError: (error) => toast.error(errorMessage(error, "We couldn't create your account. Try again.")),
	});
}

/** The emailed code: verifies the address and signs the new customer in. */
export function useVerifyEmail() {
	const router = useRouter();
	const toast = useToast();
	const next = useNextPath(shopRoutes.HOME);
	const clearDraft = useSignUpDraft((s) => s.clear);

	return useMutation({
		mutationFn: async (values: { email: string; otp: string }) => {
			const tokens = (await api.post(backendRoutes.VERIFY_EMAIL, values)).data.data as TokenSet;
			await startSession(tokens);
		},
		retry: false,
		onSuccess: () => {
			clearDraft();
			toast.success("Welcome to Fysi");
			router.replace(next);
		},
		onError: (error) => toast.error(messageOf(error, "That code didn't work. Check it and try again.")),
	});
}

/** "Resend code" on the verify screen. */
export function useResendCode() {
	const toast = useToast();
	return useMutation({
		mutationFn: async (email: string) => (await api.post(backendRoutes.RESEND_CODE, { email })).data.data as CodeSent,
		retry: false,
		onSuccess: () => toast.success("A new code is on its way."),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** "Forgot password": emails a reset code, then opens the reset screen. */
export function useForgotPassword() {
	const router = useRouter();
	const toast = useToast();
	return useMutation({
		mutationFn: async (email: string) => (await api.post(backendRoutes.FORGOT_PASSWORD, { email })).data.data as CodeSent,
		retry: false,
		onSuccess: (_, email) => router.push(authRoutes.RESET_PASSWORD_FOR(email)),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** The reset code and a new password; then sign in with it. */
export function useResetPassword() {
	const router = useRouter();
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: { email: string; otp: string; newPassword: string }) =>
			api.post(backendRoutes.RESET_PASSWORD, values),
		retry: false,
		onSuccess: () => {
			toast.success("Password changed. Sign in with your new password.");
			router.replace(authRoutes.SIGN_IN());
		},
		onError: (error) => toast.error(errorMessage(error, "That code didn't work. Check it and try again.")),
	});
}

export function useSignOut() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return () => {
		const { refreshToken, signOut } = useSession.getState();
		// Ends the session on the server too; signing out here doesn't wait for it.
		if (refreshToken) api.post(backendRoutes.LOGOUT, { refreshToken }).catch(() => undefined);
		signOut();
		queryClient.clear();
		router.replace(shopRoutes.HOME);
	};
}

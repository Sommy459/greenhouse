"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api/client";
import { authRoutes, backendRoutes, shopRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useSession } from "@/features/auth/session";
import type { SignInValues } from "@/features/auth/schema";
import type { AuthSession, User, VerifyCodeResult } from "@/features/auth/types";

/** Where to go after signing in: the `next` param RequireAuth set, when it is a path on this site. */
function useNextPath(fallback: string) {
	const next = useSearchParams().get("next");
	return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/** "Welcome back": email and password. Then back to where they were going, or the home page. */
export function useSignIn() {
	const router = useRouter();
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);
	const next = useNextPath(shopRoutes.HOME);

	return useMutation({
		mutationFn: async (values: SignInValues) => (await api.post(backendRoutes.SIGN_IN, values)).data.data as AuthSession,
		onSuccess: (session) => {
			signIn(session);
			router.replace(next);
		},
		onError: (error) => toast.error(errorMessage(error, "That email and password don't match.")),
	});
}

/**
 * Step 1 of the code flow ("Welcome to Fysi" → Continue): asks the API to send a one-time code to the email or phone.
 * `navigate` is false when resending from the verify screen.
 */
export function useRequestCode({ navigate = true }: { navigate?: boolean } = {}) {
	const router = useRouter();
	const toast = useToast();
	const next = useSearchParams().get("next");

	return useMutation({
		mutationFn: async (identifier: string) =>
			(await api.post(backendRoutes.REQUEST_CODE, { identifier })).data as { message?: string },
		onSuccess: (data, identifier) => {
			if (navigate) router.push(authRoutes.VERIFY(identifier, next));
			else toast.success(data?.message ?? "A new code is on its way.");
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/**
 * Step 2: the code is checked. A returning customer gets a session and is signed in. A new one gets
 * `is_new_user` and a short-lived `verification_token`, and goes on to "Create your account".
 */
export function useVerifyCode() {
	const router = useRouter();
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);
	const nextParam = useSearchParams().get("next");
	const next = useNextPath(shopRoutes.HOME);

	return useMutation({
		mutationFn: async (values: { identifier: string; code: string }) =>
			(await api.post(backendRoutes.VERIFY_CODE, values)).data.data as VerifyCodeResult,
		onSuccess: (result, { identifier }) => {
			if (result.is_new_user) {
				saveVerificationToken(result.verification_token);
				router.replace(authRoutes.CREATE_ACCOUNT(identifier, nextParam));
				return;
			}
			if (result.access_token && result.user && result.expires_in) {
				signIn({ access_token: result.access_token, user: result.user, expires_in: result.expires_in });
				router.replace(next);
			}
		},
		onError: (error) => toast.error(errorMessage(error, "That code didn't work. Check it and try again.")),
	});
}

/**
 * Step 3 (new customers): set a password. The verification token proves the code was entered. The account exists
 * (and the customer is signed in) from here; Personal Details comes next.
 */
export function useCreateAccount() {
	const router = useRouter();
	const toast = useToast();
	const signIn = useSession((s) => s.signIn);
	const nextParam = useSearchParams().get("next");

	return useMutation({
		mutationFn: async ({ identifier, password }: { identifier: string; password: string }) =>
			(
				await api.post(backendRoutes.SIGN_UP, {
					identifier,
					password,
					verification_token: readVerificationToken(),
					role: "customer",
				})
			).data.data as AuthSession,
		onSuccess: (session) => {
			saveVerificationToken(undefined);
			signIn(session);
			router.replace(authRoutes.PERSONAL_DETAILS(nextParam));
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Step 4 (new customers): name and phone, saved to the profile. Then back to where they were going. */
export function useSavePersonalDetails() {
	const router = useRouter();
	const toast = useToast();
	const setUser = useSession((s) => s.setUser);
	const next = useNextPath(shopRoutes.HOME);

	return useMutation({
		mutationFn: async (values: { first_name: string; last_name: string; phone_number: string }) =>
			(await api.put(backendRoutes.PROFILE, values)).data.data as User,
		onSuccess: (user) => {
			if (user) setUser(user);
			toast.success("Welcome to Fysi");
			router.replace(next);
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/**
 * The verification token is kept for this tab only (sessionStorage), never in the URL, so it is not left in history or
 * shared with a copied link.
 */
const TOKEN_KEY = "fysi-verification-token";

function saveVerificationToken(token: string | undefined) {
	try {
		if (token) sessionStorage.setItem(TOKEN_KEY, token);
		else sessionStorage.removeItem(TOKEN_KEY);
	} catch {
		// Storage blocked: the API will ask for a new code.
	}
}

function readVerificationToken() {
	try {
		return sessionStorage.getItem(TOKEN_KEY) ?? undefined;
	} catch {
		return undefined;
	}
}

export function useSignOut() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const signOut = useSession((s) => s.signOut);

	return () => {
		signOut();
		queryClient.clear();
		router.replace(shopRoutes.HOME);
	};
}

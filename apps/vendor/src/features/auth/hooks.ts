"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api/client";
import { authRoutes, backendRoutes, consoleRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import { useSession } from "@/features/auth/session";
import type { SignInValues } from "@/features/auth/schema";
import type { CodeSent, LoginResult, TokenSet, User } from "@/features/auth/types";

/** Keeps the session after any sign-in. Only vendor accounts get into the Vendor Hub. */
async function startSession(tokens: TokenSet) {
	if (tokens.role !== "vendor") {
		throw new Error("This isn't a vendor account. Create a seller account to sell on Fysi.");
	}
	const { data } = await api.get(backendRoutes.ME, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
	useSession.getState().signIn(tokens, data.data as User);
	return tokens;
}

const messageOf = (error: unknown, fallback: string) =>
	error instanceof Error && !("isAxiosError" in error) ? error.message : errorMessage(error, fallback);

/** Where a freshly signed-in vendor goes: 2FA setup first if it isn't on yet (PRD), else the console (ShopGate routes on). */
const afterSignIn = (tokens: TokenSet) => (tokens.twoFactorSetupRequired ? authRoutes.TWO_FACTOR : consoleRoutes.OVERVIEW);

/**
 * Sign in, step 1: email and password. With two-factor sign-in on, the API answers with an `mfaToken` instead of tokens
 * and the form asks for the authenticator code (useSignInCode).
 */
export function useSignIn({ onCodeNeeded }: { onCodeNeeded: (mfaToken: string) => void }) {
	const router = useRouter();
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: SignInValues) => {
			const result = (await api.post(backendRoutes.SIGN_IN, values)).data.data as LoginResult;
			if (result.mfaRequired) return { step: "code" as const, mfaToken: result.mfaToken };
			return { step: "done" as const, tokens: await startSession(result) };
		},
		retry: false,
		onSuccess: (result) => {
			if (result.step === "code") onCodeNeeded(result.mfaToken);
			else router.replace(afterSignIn(result.tokens));
		},
		onError: (error) => toast.error(messageOf(error, "That email and password don't match.")),
	});
}

/** Sign in, step 2: the 6-digit code from the authenticator app (the `mfaToken` lasts 5 minutes). */
export function useSignInCode() {
	const router = useRouter();
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: { mfaToken: string; code: string }) =>
			startSession((await api.post(backendRoutes.LOGIN_2FA, values)).data.data as TokenSet),
		retry: false,
		onSuccess: (tokens) => router.replace(afterSignIn(tokens)),
		onError: (error) => toast.error(messageOf(error, "That code didn't work. Try the newest one in your app.")),
	});
}

/** Sign-up (Figma "Personal Information"): creates the seller account; the API emails a 6-digit code. */
export function useRegister({ onRegistered }: { onRegistered: () => void }) {
	const toast = useToast();
	return useMutation({
		mutationFn: async (body: { name: string; email: string; password: string; phone: string; businessName: string }) =>
			(await api.post(backendRoutes.REGISTER, { ...body, accountType: "vendor" })).data.data as CodeSent,
		retry: false,
		onSuccess: () => onRegistered(),
		onError: (error) => toast.error(errorMessage(error, "We couldn't create your account. Try again.")),
	});
}

/** The emailed code: verifies the address and signs the vendor in. Two-factor setup comes next. */
export function useVerifyEmail() {
	const router = useRouter();
	const toast = useToast();
	return useMutation({
		mutationFn: async (values: { email: string; otp: string }) =>
			startSession((await api.post(backendRoutes.VERIFY_EMAIL, values)).data.data as TokenSet),
		retry: false,
		onSuccess: () => router.replace(authRoutes.TWO_FACTOR),
		onError: (error) => toast.error(messageOf(error, "That code didn't work. Check it and try again.")),
	});
}

/** "Resend Code". */
export function useResendCode() {
	const toast = useToast();
	return useMutation({
		mutationFn: async (email: string) => (await api.post(backendRoutes.RESEND_CODE, { email })).data.data as CodeSent,
		retry: false,
		onSuccess: (_, email) => toast.success(`A new code is on its way to ${email}.`),
		onError: (error) => toast.error(errorMessage(error)),
	});
}

/** Two-factor setup: a new authenticator secret and its otpauth:// URL (shown as a QR code). Asking again replaces it. */
export function useStartTwoFactor() {
	const toast = useToast();
	return useMutation({
		mutationFn: async () => (await api.post(backendRoutes.SETUP_2FA)).data.data as { secret: string; otpauthUrl: string },
		retry: false,
		onError: (error) => toast.error(errorMessage(error, "Couldn't start two-factor setup. Try again.")),
	});
}

/**
 * Confirms a code and turns two-factor sign-in on. The API signs out every session and returns a new token pair, which
 * replaces the stored one.
 */
export function useEnableTwoFactor() {
	const router = useRouter();
	const toast = useToast();
	const setTokens = useSession((s) => s.setTokens);
	const setUser = useSession((s) => s.setUser);
	return useMutation({
		mutationFn: async (code: string) => {
			const tokens = (await api.post(backendRoutes.ENABLE_2FA, { code })).data.data as TokenSet;
			setTokens(tokens);
			return (await api.get(backendRoutes.ME)).data.data as User;
		},
		retry: false,
		onSuccess: (user) => {
			setUser(user);
			toast.success("Two-factor sign-in is on. You'll enter a code from your app each time you sign in.");
			router.replace(consoleRoutes.OVERVIEW);
		},
		onError: (error) => toast.error(errorMessage(error, "That code didn't work. Try the newest one in your app.")),
	});
}

export function useSignOut() {
	const router = useRouter();
	const queryClient = useQueryClient();
	return () => {
		const { refreshToken, signOut } = useSession.getState();
		if (refreshToken) api.post(backendRoutes.LOGOUT, { refreshToken }).catch(() => undefined);
		signOut();
		queryClient.clear();
		router.replace(authRoutes.SIGN_IN);
	};
}

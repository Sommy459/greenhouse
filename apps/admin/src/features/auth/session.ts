"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenSet, User } from "@/features/auth/types";

type Tokens = Pick<TokenSet, "accessToken" | "refreshToken">;

/**
 * The signed-in admin. Every console page needs a session; admins must turn on two-factor sign-in (PRD).
 * The access token is short-lived: the API client swaps the single-use refresh token for a new pair when it expires.
 */
interface Session {
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	signIn: (tokens: Tokens, user: User) => void;
	setTokens: (tokens: Tokens) => void;
	setUser: (user: User) => void;
	signOut: () => void;
}

export const useSession = create<Session>()(
	persist(
		(set) => ({
			accessToken: null,
			refreshToken: null,
			user: null,
			signIn: ({ accessToken, refreshToken }, user) => set({ accessToken, refreshToken, user }),
			setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
			setUser: (user) => set({ user }),
			signOut: () => set({ accessToken: null, refreshToken: null, user: null }),
		}),
		{ name: "fysi-admin-session" },
	),
);

/** Signed in = holding a refresh token (an expired access token is renewed on the next request). */
export const isSignedIn = (s: Pick<Session, "refreshToken">) => !!s.refreshToken;

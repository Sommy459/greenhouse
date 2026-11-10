"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@/features/auth/types";

/** The signed-in customer. Browsing and the cart work signed out; checkout and /account need a session (C1). */
interface Session {
	token: string | null;
	user: User | null;
	expiresAt: number | null;
	signIn: (session: AuthSession) => void;
	setUser: (user: User) => void;
	signOut: () => void;
}

export const useSession = create<Session>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			expiresAt: null,
			signIn: ({ access_token, user, expires_in }) => set({ token: access_token, user, expiresAt: expires_in }),
			setUser: (user) => set({ user }),
			signOut: () => set({ token: null, user: null, expiresAt: null }),
		}),
		{ name: "greenhouse-session" },
	),
);

export const isExpired = (expiresAt: number | null) => !expiresAt || expiresAt * 1000 <= Date.now();

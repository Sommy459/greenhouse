"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, User } from "@/features/auth/types";

/** The signed-in vendor, kept apart from the storefront's session. Every seller-centre page needs a vendor session (V1). */
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
		{ name: "greenhouse-vendor-session" },
	),
);

export const isExpired = (expiresAt: number | null) => !expiresAt || expiresAt * 1000 <= Date.now();

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { authRoutes } from "@/lib/routes";
import { isExpired, useSession } from "@/features/auth/session";

/** The persisted session is only readable in the browser; render nothing until it is. */
const subscribe = (onChange: () => void) => useSession.persist.onFinishHydration(onChange);
const hydrated = () => useSession.persist.hasHydrated();

export function RequireVendor({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const token = useSession((s) => s.token);
	const expiresAt = useSession((s) => s.expiresAt);
	const signedIn = !!token && !isExpired(expiresAt);

	useEffect(() => {
		if (ready && !signedIn) router.replace(authRoutes.SIGN_IN);
	}, [ready, signedIn, router]);

	if (!ready || !signedIn) return <FullPageLoader />;
	return <>{children}</>;
}

export function FullPageLoader() {
	return (
		<div className="flex min-h-dvh items-center justify-center">
			<div className="loader" />
		</div>
	);
}

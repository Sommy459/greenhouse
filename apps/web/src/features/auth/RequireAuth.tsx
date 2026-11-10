"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { authRoutes } from "@/lib/routes";
import { isExpired, useSession } from "@/features/auth/session";

/** The persisted session is only readable in the browser; render nothing until it is. */
const subscribe = (onChange: () => void) => useSession.persist.onFinishHydration(onChange);
const hydrated = () => useSession.persist.hasHydrated();

/** Gates /account and /checkout: signed-out visitors go to sign in and come back here afterwards. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const token = useSession((s) => s.token);
	const expiresAt = useSession((s) => s.expiresAt);
	const signedIn = !!token && !isExpired(expiresAt);

	useEffect(() => {
		if (ready && !signedIn) router.replace(authRoutes.SIGN_IN(pathname));
	}, [ready, signedIn, router, pathname]);

	if (!ready || !signedIn) {
		return (
			<div className="flex min-h-[60dvh] items-center justify-center">
				<div className="loader" />
			</div>
		);
	}
	return <>{children}</>;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { authRoutes } from "@/lib/routes";
import { isSignedIn, useSession } from "@/features/auth/session";

/** The persisted session is only readable in the browser; render nothing until it is. */
const subscribe = (onChange: () => void) => useSession.persist.onFinishHydration(onChange);
const hydrated = () => useSession.persist.hasHydrated();

export function RequireVendor({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const ready = useSyncExternalStore(subscribe, hydrated, () => false);
	const pathname = usePathname();
	const signedIn = useSession(isSignedIn);
	const user = useSession((s) => s.user);
	// Vendors must turn on two-factor sign-in first: the API refuses everything else until then.
	const needs2fa = !!user && user.twoFactorRequired && !user.twoFactorEnabled && pathname !== authRoutes.TWO_FACTOR;

	useEffect(() => {
		if (ready && !signedIn) router.replace(authRoutes.SIGN_IN);
		else if (ready && needs2fa) router.replace(authRoutes.TWO_FACTOR);
	}, [ready, signedIn, needs2fa, router]);

	if (!ready || !signedIn || needs2fa) return <FullPageLoader />;
	return <>{children}</>;
}

export function FullPageLoader() {
	return (
		<div className="flex min-h-dvh items-center justify-center">
			<div className="loader" />
		</div>
	);
}

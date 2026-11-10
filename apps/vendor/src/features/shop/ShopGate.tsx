"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageLoader } from "@/features/auth/RequireVendor";
import { useSession } from "@/features/auth/session";
import { useProfile } from "@/features/shop/hooks";
import { authRoutes, setupRoutes } from "@/lib/routes";

/**
 * PRD flow: two-factor sign-in on (required for vendors), then the business profile and documents (draft, or fixing a
 * rejection → onboarding), then admin review (pending or suspended → the waiting page). Only approved shops get in.
 */
export function ShopGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const user = useSession((s) => s.user);
	const needs2fa = !!user && user.twoFactorRequired && !user.twoFactorEnabled;
	const { data: profile, isPending } = useProfile({ enabled: !needs2fa });
	const target = needs2fa
		? authRoutes.TWO_FACTOR
		: isPending
			? null
			: !profile || profile.status === "draft" || profile.status === "rejected"
				? setupRoutes.ONBOARDING
				: profile.status !== "approved"
					? setupRoutes.PENDING
					: null;

	useEffect(() => {
		if (target) router.replace(target);
	}, [target, router]);

	if ((!needs2fa && isPending) || target) return <FullPageLoader />;
	return <>{children}</>;
}

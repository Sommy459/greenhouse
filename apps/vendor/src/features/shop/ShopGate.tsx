"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageLoader } from "@/features/auth/RequireVendor";
import { useMyShop } from "@/features/shop/hooks";
import { setupRoutes } from "@/lib/routes";

/**
 * V1 / user flow: a vendor sells only once an admin has approved the shop. No shop yet → onboarding; pending,
 * rejected or suspended → the approval page (which offers "contact admin").
 */
export function ShopGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { data: shop, isPending } = useMyShop();
	const target = isPending ? null : !shop ? setupRoutes.ONBOARDING : shop.status !== "approved" ? setupRoutes.PENDING : null;

	useEffect(() => {
		if (target) router.replace(target);
	}, [target, router]);

	if (isPending || target) return <FullPageLoader />;
	return <>{children}</>;
}

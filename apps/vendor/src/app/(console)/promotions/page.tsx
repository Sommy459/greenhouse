import type { Metadata } from "next";
import { Suspense } from "react";
import { PromotionsView } from "@/features/promotions/components/PromotionsView";

export const metadata: Metadata = { title: "Promotions" };

export default function Page() {
	return (
		<Suspense>
			<PromotionsView />
		</Suspense>
	);
}

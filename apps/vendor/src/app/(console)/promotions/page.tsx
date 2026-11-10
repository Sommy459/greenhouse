import type { Metadata } from "next";
import { Suspense } from "react";
import { PromotionsView } from "@/features/promotions/components/PromotionsView";

export const metadata: Metadata = { title: "Promotion Management" };

export default function Page() {
	return (
		// PromotionsView reads the URL's search params.
		<Suspense>
			<PromotionsView />
		</Suspense>
	);
}

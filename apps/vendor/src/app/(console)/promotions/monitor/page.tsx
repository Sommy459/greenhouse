import type { Metadata } from "next";
import { Suspense } from "react";
import { MonitorPromotionsView } from "@/features/promotions/components/MonitorPromotionsView";

export const metadata: Metadata = { title: "Monitor Promotions" };

export default function Page() {
	return (
		// MonitorPromotionsView reads the URL's search params.
		<Suspense>
			<MonitorPromotionsView />
		</Suspense>
	);
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrdersView } from "@/features/orders/components/TrackOrdersView";

export const metadata: Metadata = { title: "Track Orders" };

export default function Page() {
	return (
		// TrackOrdersView reads the URL's search params.
		<Suspense>
			<TrackOrdersView />
		</Suspense>
	);
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/features/orders/components/OrdersView";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
	return (
		// OrdersView reads the URL's search params.
		<Suspense>
			<OrdersView />
		</Suspense>
	);
}

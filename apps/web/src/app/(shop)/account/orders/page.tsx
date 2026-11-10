import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/features/orders/components/OrdersView";

export const metadata: Metadata = { title: "Order History" };

export default function Page() {
	return (
		// OrdersView reads the tab and page from the URL (useSearchParams).
		<Suspense>
			<OrdersView />
		</Suspense>
	);
}

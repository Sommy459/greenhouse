import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersView } from "@/features/customers/components/CustomersView";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
	return (
		// CustomersView reads the URL's search params.
		<Suspense>
			<CustomersView />
		</Suspense>
	);
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { VendorsView } from "@/features/vendors/components/VendorsView";

export const metadata: Metadata = { title: "Vendors" };

export default function Page() {
	return (
		// VendorsView reads the URL's search params.
		<Suspense>
			<VendorsView />
		</Suspense>
	);
}
